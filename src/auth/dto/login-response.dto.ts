import { RolUsuario } from '../../usuarios/enums/rol-usuario.enum';

export class UsuarioAutenticadoDto {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  rol: RolUsuario;
}

export class LoginResponseDto {
  accessToken: string;
  usuario: UsuarioAutenticadoDto;
}