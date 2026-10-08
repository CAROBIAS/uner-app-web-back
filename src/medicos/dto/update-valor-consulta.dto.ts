import { IsInt, Min } from 'class-validator';

export class UpdateValorConsultaDto {
  @IsInt()
  @Min(1)
  valor_consulta: number;
}