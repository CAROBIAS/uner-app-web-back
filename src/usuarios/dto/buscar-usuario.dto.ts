import { IsNotEmpty, IsString, Matches } from 'class-validator';

/**
 * Parámetros para buscar un usuario.
 * Se reciben por query: GET /api/usuarios?documento=40123456
 */
export class BuscarUsuarioDto {
  @IsString()
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  @Matches(/^\d+$/, { message: 'El documento debe contener solo números' })
  documento: string;
}