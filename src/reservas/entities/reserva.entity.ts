import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { EstadoReserva } from '../enums/estado-reserva.enum';

@Entity({ name: 'reservas' })
export class Reserva {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @ManyToOne(() => Medico, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_medico' })
  medico: Medico;

  @ManyToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_paciente' })
  paciente: Usuario;

  @Column({ type: 'timestamp' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    default: EstadoReserva.PENDIENTE,
  })
  estado: EstadoReserva;

  @Column({ type: 'int' })
  valor_congelado: number;

  @CreateDateColumn({ type: 'timestamp' })
  creado_en: Date;
}