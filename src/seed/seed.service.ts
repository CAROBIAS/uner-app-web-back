import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'bcryptjs';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { CLAVE_USUARIOS_SEED, USUARIOS_SEED } from './data/usuarios.data';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get<string>('DB_SEED') !== 'true') {
      this.logger.log('Seed desactivado (DB_SEED distinto de true)');
      return;
    }
    await this.cargarUsuarios();
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
}