import { EstadoUsuario } from '../enums/estado-usuario.enum';
import { RolUsuario } from '../enums/rol-usuario.enum';

/**
 * Datos de un usuario que se devuelven en las consultas.
 * No incluye la clave (hash) por seguridad.
 */
export class UsuarioResponseDto {
  id: number;
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
}