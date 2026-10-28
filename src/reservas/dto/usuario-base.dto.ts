import { ApiProperty } from "@nestjs/swagger";
import { RolUsuario } from "../../usuarios/enums/rol-usuario.enum";

export class UsuarioBaseDto {
    @ApiProperty({ example: 3 })
    id: number;

    @ApiProperty({ example: '24567890', description: 'Documento de identidad', required: false })
    documento?: string;

    @ApiProperty({ example: 'Martin', description: 'Nombres del usuario' })
    nombres: string;

    @ApiProperty({ example: 'Fernandez', description: 'Apellidos del usuario' })
    apellidos: string;

    @ApiProperty({ example: 'fernandez_martin@ejemplo.com', description: 'Correo electrónico' })
    email: string;
}