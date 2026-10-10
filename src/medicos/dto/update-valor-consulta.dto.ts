import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateValorConsultaDto {
  @ApiProperty({ example: 18000, description: 'Nuevo valor de la consulta', minimum: 1 })
  @IsInt()
  @Min(1)
  valor_consulta: number;
}