import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EstadoUsuario } from '../usuarios/enums/estado-usuario.enum';
import { MedicoResponseDto } from './dto/medico-response.dto';
import { UpdateValorConsultaDto } from './dto/update-valor-consulta.dto';
import { Medico } from './entities/medico.entity';

@Injectable()
export class MedicosService {
  constructor(
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) { }

  async listar(): Promise<MedicoResponseDto[]> {
    const medicos = await this.medicosRepository.find({
      relations: { usuario: true },
      order: { id: 'ASC' },
    });

    const lista: MedicoResponseDto[] = [];
    for (const m of medicos) {
      const dto = new MedicoResponseDto();
      dto.id = m.id;
      dto.id_usuario = m.usuario.id;
      dto.nombres = m.usuario.nombres;
      dto.apellidos = m.usuario.apellidos;
      dto.matricula = m.matricula;
      dto.valor_consulta = m.valor_consulta;
      lista.push(dto);
    }
    return lista;
  }

  async actualizarValorConsulta(
    id: number,
    dto: UpdateValorConsultaDto,
  ): Promise<MedicoResponseDto> {
    const medico = await this.medicosRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });
    if (!medico) {
      throw new NotFoundException('Medico no encontrado');
    }
    if (medico.usuario.estado !== EstadoUsuario.ACTIVO) {
      throw new BadRequestException('Medico dado de baja');
    }

    medico.valor_consulta = dto.valor_consulta;
    await this.medicosRepository.save(medico);

    const respuesta = new MedicoResponseDto();
    respuesta.id = medico.id;
    respuesta.id_usuario = medico.usuario.id;
    respuesta.nombres = medico.usuario.nombres;
    respuesta.apellidos = medico.usuario.apellidos;
    respuesta.matricula = medico.matricula;
    respuesta.valor_consulta = medico.valor_consulta;
    return respuesta;
  }

  async existeMedicoActivo(id: number): Promise<boolean> {
    const medico = await this.medicosRepository.findOne({
      where: { id },
      relations: { usuario: true },
    });
    return !!medico && medico.usuario.estado === EstadoUsuario.ACTIVO;
  }

  async obtenerValorActual(id: number): Promise<number> {
    const medico = await this.medicosRepository.findOneBy({ id });
    if (!medico) {
      throw new NotFoundException('Medico no encontrado');
    }
    return medico.valor_consulta;
  }
}