import { RolUsuario } from '../../usuarios/enums/rol-usuario.enum';

export interface UsuarioToken {
  id: number;
  rol: RolUsuario;
}