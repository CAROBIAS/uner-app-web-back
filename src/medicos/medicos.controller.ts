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
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('medicos')
@ApiBearerAuth()
@Controller('medicos')
export class MedicosController {
  constructor(private readonly medicosService: MedicosService) {}

  @ApiOkResponse({ type: MedicoResponseDto, isArray: true })
  @Get()
  listar(): Promise<MedicoResponseDto[]> {
    return this.medicosService.listar();
  }

  @ApiOkResponse({ type: MedicoResponseDto })
  @Roles(RolUsuario.ADMINISTRADOR)
  @Patch(':id/valor-consulta')
  actualizarValorConsulta(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateValorConsultaDto,
  ): Promise<MedicoResponseDto> {
    return this.medicosService.actualizarValorConsulta(id, dto);
  }
}