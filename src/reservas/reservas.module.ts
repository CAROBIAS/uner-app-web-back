import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reserva } from './entities/reserva.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { ReservasController } from './reservas.controller';
import { ReservasService } from './reservas.service';
import { MedicosModule } from '../medicos/medicos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reserva, Usuario]),
    MedicosModule,
  ],
  controllers: [ReservasController],
  providers: [ReservasService],
  exports: [ReservasService],
})
export class ReservasModule {}