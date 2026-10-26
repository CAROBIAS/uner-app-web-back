import { Controller, Get, NotFoundException, Query } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { BuscarUsuarioDto } from './dto/buscar-usuario.dto';
import { UsuarioResponseDto } from './dto/usuario-response.dto';
import { Usuario } from './entities/usuario.entity';
import { RolUsuario } from './enums/rol-usuario.enum';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Busca un usuario por número de documento.
   * GET /api/usuarios?documento=40123456
   */
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.MEDICO)
  @Get()
  async buscarPorDocumento(
    @Query() query: BuscarUsuarioDto,
  ): Promise<UsuarioResponseDto> {
    const usuario = await this.usuariosService.findByDocumento(query.documento);
    if (!usuario) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return this.aUsuarioResponse(usuario);
  }

  /** Arma la respuesta sin la clave. */
  private aUsuarioResponse(usuario: Usuario): UsuarioResponseDto {
    return {
      id: usuario.id,
      documento: usuario.documento,
      apellidos: usuario.apellidos,
      nombres: usuario.nombres,
      email: usuario.email,
      estado: usuario.estado,
      rol: usuario.rol,
    };
  }
}