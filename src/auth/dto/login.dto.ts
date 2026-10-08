import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString({ message: 'El documento debe ser un texto' })
  @IsNotEmpty({ message: 'El documento es obligatorio' })
  documento: string;

  @IsString({ message: 'La clave debe ser un texto' })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  clave: string;
}