import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsDateString, IsOptional } from 'class-validator';

export class CrearReservaDto {
  @ApiProperty({ example: 1, description: 'ID del médico seleccionado' })
  @IsInt()
  @IsNotEmpty()
  id_medico: number;

  @ApiProperty({ example: '2026-11-10T09:00:00', description: 'Fecha y hora exacta del turno' })
  @IsDateString()
  @IsNotEmpty()
  fecha_hora: string;

  @ApiProperty({ example: 3, description: 'ID del paciente: ', required: false })
  @IsInt()
  @IsOptional()
  id_paciente?: number;
}