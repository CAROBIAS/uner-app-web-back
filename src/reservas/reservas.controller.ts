import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';
import { AgendaQueryDto } from './dto/agenda-query.dto';
import { AgendaTurnoDto } from './dto/agenda-turno.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { ReservasService } from './reservas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@ApiTags('reservas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('reservas')
export class ReservasController {
  constructor(private readonly reservasService: ReservasService) { }

  @ApiOkResponse({ type: String, isArray: true })
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  @Get('disponibilidad')
  @ApiQuery({ name: 'id_medico', type: Number, example: 1 })
  @ApiQuery({ name: 'fecha', type: String, example: '2026-10-20' })
  obtenerDisponibilidad(
    @Query('id_medico', ParseIntPipe) id_medico: number,
    @Query('fecha') fecha: string,
  ): Promise<string[]> {
    return this.reservasService.obtenerDisponibilidad(id_medico, fecha);
  }

  @ApiOkResponse({ type: ReservaResponseDto })
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
  @Post()
  crear(
    @Body() dto: CrearReservaDto,
    @UsuarioActual() usuario: Usuario,
  ): Promise<ReservaResponseDto> {
    return this.reservasService.crear(dto, usuario);
  }

  @ApiOkResponse({ type: ReservaResponseDto, isArray: true })
  @Roles(RolUsuario.PACIENTE, RolUsuario.ADMINISTRADOR)
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

  @ApiOkResponse({ type: AgendaTurnoDto, isArray: true })
  @Roles(RolUsuario.MEDICO)
  @Get('agenda')
  @ApiQuery({ name: 'fecha', type: String, example: '2026-10-26' })
  obtenerAgenda(
    @Query() query: AgendaQueryDto,
    @UsuarioActual() usuario: Usuario,
  ): Promise<AgendaTurnoDto[]> {
    return this.reservasService.obtenerAgenda(usuario.id, query.fecha);
  }

  @ApiOkResponse({ type: AgendaTurnoDto })
  @Roles(RolUsuario.MEDICO)
  @Patch(':id/estado')
  cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoDto,
    @UsuarioActual() usuario: Usuario,
  ): Promise<AgendaTurnoDto> {
    return this.reservasService.cambiarEstado(id, usuario.id, dto);
  }
}