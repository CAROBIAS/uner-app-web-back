import { ApiProperty } from '@nestjs/swagger';

export class MedicoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 5 })
  id_usuario: number;

  @ApiProperty({ example: 10001 })
  matricula: number;
  
  @ApiProperty({ example: 15000 })
  valor_consulta: number;
}