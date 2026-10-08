import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { UsuariosService } from '../usuarios/usuarios.service';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const usuario = await this.usuariosService.findByDocumento(
      loginDto.documento,
    );
    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const claveValida = await compare(loginDto.clave, usuario.clave);
    if (!claveValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new ForbiddenException('Usuario dado de baja');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      rol: usuario.rol,
    });

    return {
      accessToken,
      usuario: {
        id: usuario.id,
        documento: usuario.documento,
        apellidos: usuario.apellidos,
        nombres: usuario.nombres,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  }
}