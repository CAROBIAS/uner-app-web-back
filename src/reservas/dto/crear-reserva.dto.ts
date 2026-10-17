import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsISO8601, IsNotEmpty } from 'class-validator';

export class CrearReservaDto {
  @ApiProperty({ example: 1, description: 'ID del médico seleccionado' })
  @IsInt()
  @IsNotEmpty()
  id_medico: number;

  @ApiProperty({
    example: '2026-11-10T09:00:00',
    description: 'Fecha y hora exacta del turno (debe respetar hora en punto)',
  })
  @IsISO8601()
  @IsNotEmpty()
  fecha_hora: string;
}