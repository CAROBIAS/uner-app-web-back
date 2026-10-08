import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { EstadoUsuario } from '../enums/estado-usuario.enum';
import { RolUsuario } from '../enums/rol-usuario.enum';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'text', unique: true })
  documento: string;

  @Column({ type: 'text' })
  apellidos: string;

  @Column({ type: 'text' })
  nombres: string;

  @Column({ type: 'text' })
  email: string;

  @Column({ type: 'text' })
  clave: string;

  @Column({
    type: 'enum',
    enum: EstadoUsuario,
    enumName: 'estados_usuarios',
  })
  estado: EstadoUsuario;

  @Column({
    type: 'enum',
    enum: RolUsuario,
    enumName: 'roles_usuarios',
  })
  rol: RolUsuario;
}