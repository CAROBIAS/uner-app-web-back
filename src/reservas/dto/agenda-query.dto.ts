import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, Matches } from 'class-validator';

export class AgendaQueryDto {
  @ApiProperty({
    example: '2026-10-26',
    description: 'Fecha de la agenda (YYYY-MM-DD)',
  })
  @IsDateString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  fecha: string;
}