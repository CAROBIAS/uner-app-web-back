import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { EstadoReserva } from '../enums/estado-reserva.enum';

export class CambiarEstadoDto {
  @ApiProperty({
    enum: [EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE],
    example: EstadoReserva.ATENDIDO,
  })
  @IsIn([EstadoReserva.ATENDIDO, EstadoReserva.AUSENTE])
  estado: EstadoReserva;
}