import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CLAVE_USUARIOS_SEED, USUARIOS_SEED } from './data/usuarios.data';
import { Medico } from '../medicos/entities/medico.entity';
import { MEDICOS_SEED } from './data/medicos.data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
    @InjectRepository(Medico)
    private readonly medicosRepository: Repository<Medico>,
  ) { }

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get<string>('DB_SEED') !== 'true') {
      this.logger.log('Seed desactivado (DB_SEED distinto de true)');
      return;
    }
    await this.cargarUsuarios();
    await this.cargarMedicos();
  }

  private async cargarUsuarios(): Promise<void> {
    let insertados = 0;

    for (const datos of USUARIOS_SEED) {
      const existe = await this.usuariosRepository.existsBy({
        documento: datos.documento,
      });
      if (existe) {
        continue;
      }

      const clave = await hash(CLAVE_USUARIOS_SEED, 10);
      await this.usuariosRepository.insert({ ...datos, clave });
      insertados++;
    }

    this.logger.log(
      `Usuarios: ${insertados} insertados, ${USUARIOS_SEED.length - insertados} ya existían`,
    );
  }

  private async cargarMedicos(): Promise<void> {
    let insertados = 0;

    for (const datos of MEDICOS_SEED) {
      const existe = await this.medicosRepository.existsBy({
        matricula: datos.matricula,
      });
      if (existe) {
        continue;
      }

      const usuario = await this.usuariosRepository.findOneBy({
        documento: datos.documento,
      });
      if (!usuario) {
        this.logger.warn(
          `Medico no cargado, usuario ${datos.documento} no existe`,
        );
        continue;
      }

      const medico = this.medicosRepository.create({
        usuario,
        matricula: datos.matricula,
        valor_consulta: datos.valor_consulta,
      });
      await this.medicosRepository.save(medico);
      insertados++;
    }

    this.logger.log(
      `Medicos: ${insertados} insertados, ${MEDICOS_SEED.length - insertados} ya existían`,
    );
  }
}