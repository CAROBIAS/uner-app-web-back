import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';
import { ReservasService } from './reservas.service';

@ApiTags('reservas')
@ApiBearerAuth()
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) {}

  @ApiOkResponse({ type: ReservaResponseDto })
  @Roles(RolUsuario.PACIENTE)
  @Post()
  crear(
    @Body() dto: CrearReservaDto,
    @UsuarioActual() usuario: Usuario,
  ): Promise<ReservaResponseDto> {
    return this.reservasService.crear(dto, usuario);
  }

  @ApiOkResponse({ type: ReservaResponseDto, isArray: true })
  @Get()
  listar(@UsuarioActual() usuario: Usuario): Promise<ReservaResponseDto[]> {
    return this.reservasService.listarPorUsuario(usuario);
  }

  @ApiOkResponse({ type: ReservaResponseDto })
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  @Patch(':id/cancelar')
  cancelar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioActual() usuario: Usuario,
  ): Promise<ReservaResponseDto> {
    return this.reservasService.cancelar(id, usuario);
  }
}