import { ApiProperty } from '@nestjs/swagger';
import { EstadoReserva } from '../enums/estado-reserva.enum';
import { UsuarioBaseDto } from './usuario-base.dto';

export class AgendaTurnoDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: '2026-10-26T09:00:00' })
  fecha_hora: Date;

  @ApiProperty({ enum: EstadoReserva, example: EstadoReserva.ACTIVO })
  estado: EstadoReserva;

  @ApiProperty({ example: 15000 })
  valor_consulta: number;

  @ApiProperty({ example: 3 })
  id_paciente: number;

  @ApiProperty({ example: 'Sofía' })
  paciente_nombres: string;

  @ApiProperty({ example: 'Rodríguez' })
  paciente_apellidos: string;

  @ApiProperty({ type: UsuarioBaseDto })
  paciente: UsuarioBaseDto;

  @ApiProperty({ type: UsuarioBaseDto })
  medico: UsuarioBaseDto;
}