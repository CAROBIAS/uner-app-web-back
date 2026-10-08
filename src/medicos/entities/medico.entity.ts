import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity({ name: 'medicos' })
export class Medico {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @OneToOne(() => Usuario, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_usuario' })
  usuario: Usuario;

  @Column({ type: 'int', unique: true })
  matricula: number;

  @Column({ type: 'int' })
  valor_consulta: number;
}