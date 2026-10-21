import { ApiProperty } from '@nestjs/swagger';
import { EstadoReserva } from '../enums/estado-reserva.enum';

export class ReservaResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  id_medico: number;

  @ApiProperty({ example: 3 })
  id_paciente: number;

  @ApiProperty({ example: '2026-11-10T09:00:00' })
  fecha_hora: Date;

  @ApiProperty({ enum: EstadoReserva, example: EstadoReserva.ACTIVO })
  estado: EstadoReserva;

  @ApiProperty({ example: 15000, description: 'Valor de la consulta: ' })
  valor_consulta: number;
}