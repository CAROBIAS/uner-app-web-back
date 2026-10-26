import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ type: 'timestamp', name: 'fecha_hora' })
  fecha_hora: Date;

  @Column({
    type: 'enum',
    enum: EstadoReserva,
    enumName: 'estados_reservas',
    default: EstadoReserva.ACTIVO,
  })
  estado: EstadoReserva;

  @Column({ type: 'int', name: 'valor_consulta' })
  valor_consulta: number;
}