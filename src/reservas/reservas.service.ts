import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, Between } from 'typeorm';
import { Reserva } from './entities/reserva.entity';
import { CrearReservaDto } from './dto/crear-reserva.dto';
import { ReservaResponseDto } from './dto/reserva-response.dto';
import { EstadoReserva } from './enums/estado-reserva.enum';
import { MedicosService } from '../medicos/medicos.service';
import { RolUsuario } from '../usuarios/enums/rol-usuario.enum';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { AgendaTurnoDto } from './dto/agenda-turno.dto';
import { CambiarEstadoDto } from './dto/cambiar-estado.dto';
import { Medico } from '../medicos/entities/medico.entity';

@Injectable()
export class ReservasService {
  constructor(
    @InjectRepository(Reserva)
    private readonly reservasRepository: Repository<Reserva>,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    private readonly medicosService: MedicosService,
  ) { }

  async crear(crearReservaDto: CrearReservaDto, usuarioActual: Usuario): Promise<ReservaResponseDto> {
    const { id_medico, fecha_hora, id_paciente } = crearReservaDto;
    const fechaCita = new Date(fecha_hora);
    const ahora = new Date();

    let pacienteFinal = usuarioActual;

    // Si reserva el Administrador, debe especificar a qué paciente asignarla
    if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
      if (!id_paciente) {
        throw new BadRequestException('El administrador debe especificar el id_paciente para realizar la reserva.');
      }
      const pacienteEncontrado = await this.usuariosRepository.findOneBy({ id: id_paciente });
      if (!pacienteEncontrado || pacienteEncontrado.rol !== RolUsuario.PACIENTE || pacienteEncontrado.estado !== EstadoUsuario.ACTIVO) {
        throw new BadRequestException('El paciente seleccionado no existe, no es un paciente válido o no se encuentra activo.');
      }
      pacienteFinal = pacienteEncontrado;
    }

    //  Validar que el médico exista y esté activo
    const medicoActivo = await this.medicosService.existeMedicoActivo(id_medico);
    if (!medicoActivo) {
      throw new BadRequestException('El médico seleccionado no existe o no se encuentra activo.');
    }

    //  Validar días laborales (Lunes a Viernes)
    const diaSemana = fechaCita.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      throw new BadRequestException('Las reservas solo están permitidas de lunes a viernes.');
    }

    //  Validar horario de atención (08:00 a 16:00 hs, turnos de 1 hora exacta)
    const hora = fechaCita.getHours();
    const minutos = fechaCita.getMinutes();
    const segundos = fechaCita.getSeconds();

    if (minutos !== 0 || segundos !== 0 || hora < 8 || hora >= 16) {
      throw new BadRequestException('Los turnos deben ser de 1 hora exacta dentro de la franja horaria de 08:00 a 16:00 hs.');
    }

    // Validar anticipación máxima de 30 días corridos
    const diferenciaMs = fechaCita.getTime() - ahora.getTime();
    const diasDiferencia = diferenciaMs / (1000 * 60 * 60 * 24);
    if (diasDiferencia < 0 || diasDiferencia > 30) {
      throw new BadRequestException('Las reservas solo se permiten con un máximo de 30 días corridos de antelación.');
    }

    // Prevención de solapamientos (excluyendo solo el estado CANCELADO)
    const turnoExistente = await this.reservasRepository.findOne({
      where: {
        medico: { id: id_medico },
        fecha_hora: fechaCita,
        estado: Not(EstadoReserva.CANCELADO),
      },
    });

    if (turnoExistente) {
      throw new BadRequestException('El profesional médico ya cuenta con un turno reservado en ese horario.');
    }

    // Obtener y congelar el valor de la consulta actual
    const valorConsultaActual = await this.medicosService.obtenerValorActual(id_medico);

    // Crear y guardar
    const nuevaReserva = this.reservasRepository.create({
      medico: { id: id_medico },
      paciente: pacienteFinal,
      fecha_hora: fechaCita,
      estado: EstadoReserva.ACTIVO,
      valor_consulta: valorConsultaActual,
    });

    const guardada = await this.reservasRepository.save(nuevaReserva);
    return this.mapearARespuesta(guardada);
  }

  async listarPorUsuario(usuarioActual: Usuario): Promise<ReservaResponseDto[]> {
    let whereCondition = {};
    if (usuarioActual.rol === RolUsuario.PACIENTE) {
      whereCondition = { paciente: { id: usuarioActual.id } };
    }

    const reservas = await this.reservasRepository.find({
      where: whereCondition,
      relations: { medico: { usuario: true }, paciente: true },
      order: { fecha_hora: 'ASC' },
    });

    return reservas.map(r => this.mapearARespuesta(r));
  }

  async obtenerDisponibilidad(id_medico: number, fechaStr: string): Promise<string[]> {
    const medicoActivo = await this.medicosService.existeMedicoActivo(id_medico);
    if (!medicoActivo) {
      throw new NotFoundException('El médico no existe o no se encuentra activo.');
    }

    const [year, month, day] = fechaStr.split('-').map(Number);
    const fechaInicio = new Date(year, month - 1, day);

    // Si es fin de semana, devuelve arreglo vacío
    const diaSemana = fechaInicio.getDay();
    if (diaSemana === 0 || diaSemana === 6) {
      return [];
    }

    const horasBase = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

    const inicioDia = new Date(year, month - 1, day, 0, 0, 0);
    const finDia = new Date(year, month - 1, day, 23, 59, 59);

    const reservasExistentes = await this.reservasRepository.find({
      where: {
        medico: { id: id_medico },
        fecha_hora: Between(inicioDia, finDia),
        estado: Not(EstadoReserva.CANCELADO),
      },
    });

    const horasOcupadas = reservasExistentes.map(r => {
      const d = new Date(r.fecha_hora);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    });

    const ahora = new Date();
    const esHoy = ahora.getFullYear() === year && (ahora.getMonth() + 1) === month && ahora.getDate() === day;
    const horaActual = ahora.getHours();

    return horasBase.filter(horaStr => {
      if (horasOcupadas.includes(horaStr)) {
        return false;
      }
      if (esHoy) {
        const [hStr] = horaStr.split(':').map(Number);
        if (hStr <= horaActual) {
          return false;
        }
      }
      return true;
    });
  }

  async cancelar(idReserva: number, usuarioActual: Usuario): Promise<ReservaResponseDto> {
    const reserva = await this.reservasRepository.findOne({
      where: { id: idReserva },
      relations: ['paciente', 'medico'],
    });

    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada.');
    }

    if (reserva.estado === EstadoReserva.CANCELADO) {
      throw new BadRequestException('La reserva ya se encuentra cancelada.');
    }

    const ahora = new Date();

    if (usuarioActual.rol === RolUsuario.PACIENTE) {
      if (reserva.paciente.id !== usuarioActual.id) {
        throw new ForbiddenException('No tiene permisos para cancelar esta reserva.');
      }

      const fechaCitaSinHora = new Date(reserva.fecha_hora);
      fechaCitaSinHora.setHours(0, 0, 0, 0);

      const hoySinHora = new Date(ahora);
      hoySinHora.setHours(0, 0, 0, 0);

      if (hoySinHora >= fechaCitaSinHora) {
        throw new BadRequestException('Los pacientes solo pueden cancelar hasta el día anterior a la cita.');
      }
    } else if (usuarioActual.rol === RolUsuario.ADMINISTRADOR) {
      if (ahora >= new Date(reserva.fecha_hora)) {
        throw new BadRequestException('No se puede cancelar un turno cuya hora de inicio ya ha pasado.');
      }
    } else {
      throw new ForbiddenException('Rol no autorizado para cancelar reservas.');
    }

    reserva.estado = EstadoReserva.CANCELADO;
    const actualizada = await this.reservasRepository.save(reserva);
    return this.mapearARespuesta(actualizada);
  }

  async obtenerAgenda(
    usuarioId: number,
    fecha: string,
  ): Promise<AgendaTurnoDto[]> {
    const medico = await this.medicosService.obtenerPorUsuarioId(usuarioId);
    if (!medico) {
      throw new ForbiddenException('El usuario autenticado no es un médico.');
    }

    const [year, month, day] = fecha.split('-').map(Number);
    const inicioDia = new Date(year, month - 1, day, 0, 0, 0);
    const finDia = new Date(year, month - 1, day, 23, 59, 59, 999);

    const reservas = await this.reservasRepository.find({
      where: {
        medico: { id: medico.id },
        fecha_hora: Between(inicioDia, finDia),
      },
      relations: { paciente: true },
      order: { fecha_hora: 'ASC' },
    });

    return reservas.map((r) => this.mapearAAgenda(r, medico));
  }

  async cambiarEstado(
    idReserva: number,
    usuarioId: number,
    dto: CambiarEstadoDto,
  ): Promise<AgendaTurnoDto> {
    const medico = await this.medicosService.obtenerPorUsuarioId(usuarioId);
    if (!medico) {
      throw new ForbiddenException('El usuario autenticado no es un médico.');
    }

    const reserva = await this.reservasRepository.findOne({
      where: { id: idReserva },
      relations: { medico: true, paciente: true },
    });
    if (!reserva) {
      throw new NotFoundException('Reserva no encontrada.');
    }
    if (reserva.medico.id !== medico.id) {
      throw new ForbiddenException('No puede modificar turnos de otro médico.');
    }
    if (reserva.estado !== EstadoReserva.ACTIVO) {
      throw new BadRequestException(
        'Solo se pueden marcar turnos en estado ACTIVO.',
      );
    }

    reserva.estado = dto.estado;
    const actualizada = await this.reservasRepository.save(reserva);
    return this.mapearAAgenda(actualizada, medico);
  }

  private mapearAAgenda(r: Reserva, medico: Medico): AgendaTurnoDto {
    const dto = new AgendaTurnoDto();
    dto.id = r.id;
    dto.fecha_hora = r.fecha_hora;
    dto.estado = r.estado;
    dto.valor_consulta = r.valor_consulta;
    dto.id_paciente = r.paciente?.id;
    dto.paciente_nombres = r.paciente?.nombres;
    dto.paciente_apellidos = r.paciente?.apellidos;

    dto.paciente = {
      id: r.paciente.id,
      documento: r.paciente.documento,
      nombres: r.paciente.nombres,
      apellidos: r.paciente.apellidos,
      email: r.paciente.email,
    };

    dto.medico = {
      id: medico.id,
      documento: medico.usuario.documento,
      nombres: medico.usuario.nombres,
      apellidos: medico.usuario.apellidos,
      email: medico.usuario.email,
    };

    return dto;
  }
  // Mapeos a DTO:

  private mapearARespuesta(reserva: Reserva): ReservaResponseDto {
    const dto = new ReservaResponseDto();

    dto.id = reserva.id;
    dto.estado = reserva.estado;
    dto.fecha_hora = reserva.fecha_hora;
    dto.valor_consulta = reserva.valor_consulta;

    // Mapear el objeto anidado del paciente
    if (reserva.paciente) {
      dto.paciente = {
        id: reserva.paciente.id,
        documento: reserva.paciente.documento,
        nombres: reserva.paciente.nombres,
        apellidos: reserva.paciente.apellidos,
        email: reserva.paciente.email,
      };
    }

    // Mapear el objeto anidado del médico
    if (reserva.medico) {
      // Si tu entidad Medico extiende de Usuario o tiene la relación apuntando a la tabla usuarios:
      const infoMedico = reserva.medico.usuario || reserva.medico;

      dto.medico = {
        id: reserva.medico.id,
        documento: infoMedico?.documento,
        nombres: infoMedico?.nombres,
        apellidos: infoMedico?.apellidos,
        email: infoMedico?.email,
      };
    }

    return dto;
  }
}