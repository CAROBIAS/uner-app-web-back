import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { MedicoResponseDto } from './dto/medico-response.dto';
import { UpdateValorConsultaDto } from './dto/update-valor-consulta.dto';
import { MedicosService } from './medicos.service';

@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @Get()
  listar(): Promise<MedicoResponseDto[]> {
    return this.medicosService.listar();
  }

  @Roles(RolUsuario.ADMINISTRADOR)
  @Patch(':id/valor-consulta')
  actualizarValorConsulta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValorConsultaDto,
  ): Promise<MedicoResponseDto> {
    return this.medicosService.actualizarValorConsulta(id, dto);
  }
}