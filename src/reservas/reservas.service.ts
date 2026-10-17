import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MedicosService } from '../medicos/medicos.service';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';
import { Reserva } from './entities/reserva.entity';
import { EstadoReserva } from './enums/estado-reserva.enum';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    private readonly medicosService: MedicosService,
  ) {}

  async crear(dto: CrearReservaDto, usuarioActual: Usuario): Promise<ReservaResponseDto> {
    const fechaTurno = new Date(dto.fecha_hora);

    // 1. Validar días laborales (Lunes a Viernes)
    const diaSemana = fechaTurno.getDay(); // 0 = Domingo, 6 = Sábado
    if (diaSemana === 0 || diaSemana === 6) {
      throw new BadRequestException('Solo se permiten reservas de lunes a viernes.');
    }

    // 2. Validar franja horaria (08:00 a 16:00 hs) y hora en punto
    const hora = fechaTurno.getHours();
    const minutos = fechaTurno.getMinutes();
    const segundos = fechaTurno.getSeconds();

    if (minutos !== 0 || segundos !== 0 || hora < 8 || hora >= 16) {
      throw new BadRequestException(
        'Los turnos deben ser de una hora exacta entre las 08:00 y las 16:00 hs.',
      );
    }

    // 3. Validar anticipación máxima de 30 días corridos
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const maxFecha = new Date(hoy);
    maxFecha.setDate(maxFecha.getDate() + 30);

    if (fechaTurno < hoy || fechaTurno > maxFecha) {
      throw new BadRequestException(
        'Las reservas solo se permiten desde hoy y hasta con 30 días corridos de antelación.',
      );
    }

    // 4. Validar que el médico exista y esté activo
    const medicoActivo = await this.medicosService.existeMedicoActivo(dto.id_medico);
    if (!medicoActivo) {
      throw new NotFoundException('Médico no encontrado o inactivo.');
    }

    // 5. Prevención de solapamientos para el mismo médico en el mismo horario
    const solapado = await this.reservasRepository.createQueryBuilder('reserva')
      .where('reserva.id_medico = :id_medico', { id_medico: dto.id_medico })
      .andWhere('reserva.fecha_hora = :fecha_hora', { fecha_hora: fechaTurno })
      .andWhere('reserva.estado NOT IN (:...estados)', {
        estados: [EstadoReserva.CANCELADA_PACIENTE, EstadoReserva.CANCELADA_ADMIN],
      })
      .getOne();

    if (solapado) {
      throw new BadRequestException('El médico ya cuenta con un turno reservado en este horario.');
    }

    // 6. Obtener valor actual del médico y congelarlo
    const valorConsulta = await this.medicosService.obtenerValorActual(dto.id_medico);

    // 7. Crear y guardar la reserva
    const nuevaReserva = this.reservasRepository.create({
      medico: { id: dto.id_medico } as any,
      paciente: { id: usuarioActual.id } as any,
      fecha_hora: fechaTurno,
      estado: EstadoReserva.PENDIENTE,
      valor_congelado: valorConsulta,
    });

    const guardada = await this.reservasRepository.save(nuevaReserva);
    return this.mapearADto(guardada);
  }

  async cancelar(idReserva: number, usuarioActual: Usuario): Promise<ReservaResponseDto> {
    const reserva = await this.reservasRepository.findOne({
      where: { id: idReserva },
      relations: { paciente: true, medico: { usuario: true } },
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    if (
      reserva.estado === EstadoReserva.CANCELADA_PACIENTE ||
      reserva.estado === EstadoReserva.CANCELADA_ADMIN
    ) {
      throw new BadRequestException('La reserva ya se encuentra cancelada.');
    }

    const ahora = new Date();

    // Política de cancelación por Rol
    if (usuarioActual.rol === RolUsuario.PACIENTE) {
      if (reserva.paciente.id !== usuarioActual.id) {
        throw new ForbiddenException('No tiene permisos para cancelar este turno.');
      }

      // Paciente: Permitida hasta las 23:59:59 del día anterior a la cita.
      const fechaCita = new Date(reserva.fecha_hora);
      fechaCita.setHours(0, 0, 0, 0);

      const limiteCancelacion = new Date(fechaCita);
      if (ahora >= limiteCancelacion) {
        throw new BadRequestException(
          'Fuera de término: Los pacientes solo pueden cancelar hasta el día anterior a la cita.',
        );
      }

      reserva.estado = EstadoReserva.CANCELADA_PACIENTE;
    } else if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
      // Administrador: Permitida hasta el momento exacto del inicio del turno.
      if (ahora >= new Date(reserva.fecha_hora)) {
        throw new BadRequestException(
          'No se puede cancelar un turno cuya hora de inicio ya ha transcurrido.',
        );
      }

      reserva.estado = EstadoReserva.CANCELADA_ADMIN;
    } else {
      throw new ForbiddenException('Rol no autorizado para cancelar turnos.');
    }

    const actualizada = await this.reservasRepository.save(reserva);
    return this.mapearADto(actualizada);
  }

  async listarPorUsuario(usuario: Usuario): Promise<ReservaResponseDto[]> {
    let whereCondition = {};
    if (usuario.rol === RolUsuario.PACIENTE) {
      whereCondition = { paciente: { id: usuario.id } };
    }

    const reservas = await this.reservasRepository.find({
      where: whereCondition,
      relations: { medico: { usuario: true }, paciente: true },
      order: { fecha_hora: 'DESC' },
    });

    return reservas.map((r) => this.mapearADto(r));
  }

  private mapearADto(r: Reserva): ReservaResponseDto {
    const dto = new ReservaResponseDto();
    dto.id = r.id;
    dto.id_medico = r.medico?.id;
    dto.id_paciente = r.paciente?.id;
    dto.fecha_hora = r.fecha_hora;
    dto.estado = r.estado;
    dto.valor_congelado = r.valor_congelado;
    return dto;
  }
}