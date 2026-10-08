import { EstadoUsuario } from '../../usuarios/enums/estado-usuario.enum';
import { RolUsuario } from '../../usuarios/enums/rol-usuario.enum';

export const CLAVE_USUARIOS_SEED = 'asd123';

export interface UsuarioSeed {
  documento: string;
  apellidos: string;
  nombres: string;
  email: string;
  estado: EstadoUsuario;
  rol: RolUsuario;
}

export const USUARIOS_SEED: UsuarioSeed[] = [
  // Administradores
  { documento: '28456123', apellidos: 'Gómez', nombres: 'Laura', email: 'gomez_laura@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.ADMINISTRADOR },
  { documento: '31789456', apellidos: 'Pereyra', nombres: 'Diego', email: 'pereyra_diego@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.ADMINISTRADOR },
  { documento: '33214587', apellidos: 'Acosta', nombres: 'Valeria', email: 'acosta_valeria@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.ADMINISTRADOR },
  { documento: '25698741', apellidos: 'Medina', nombres: 'Ricardo', email: 'medina_ricardo@ejemplo.com', estado: EstadoUsuario.BAJA, rol: RolUsuario.ADMINISTRADOR },

  // Médicos
  { documento: '24567890', apellidos: 'Fernández', nombres: 'Martín', email: 'fernandez_martin@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.MEDICO },
  { documento: '27345678', apellidos: 'López', nombres: 'Carolina', email: 'lopez_carolina@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.MEDICO },
  { documento: '29876543', apellidos: 'Díaz', nombres: 'Javier', email: 'diaz_javier@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.MEDICO },
  { documento: '30123987', apellidos: 'Romero', nombres: 'Natalia', email: 'romero_natalia@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.MEDICO },
  { documento: '26789012', apellidos: 'Sosa', nombres: 'Gustavo', email: 'sosa_gustavo@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.MEDICO },
  { documento: '23456781', apellidos: 'Herrera', nombres: 'Patricia', email: 'herrera_patricia@ejemplo.com', estado: EstadoUsuario.BAJA, rol: RolUsuario.MEDICO },

  // Pacientes
  { documento: '40123456', apellidos: 'Rodríguez', nombres: 'Sofía', email: 'rodriguez_sofia@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '38765432', apellidos: 'Martínez', nombres: 'Lucas', email: 'martinez_lucas@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '41234567', apellidos: 'García', nombres: 'Camila', email: 'garcia_camila@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '39876501', apellidos: 'Pérez', nombres: 'Mateo', email: 'perez_mateo@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '42345678', apellidos: 'Sánchez', nombres: 'Julieta', email: 'sanchez_julieta@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '37654321', apellidos: 'Torres', nombres: 'Nicolás', email: 'torres_nicolas@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '43456789', apellidos: 'Ramírez', nombres: 'Florencia', email: 'ramirez_florencia@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '36543210', apellidos: 'Flores', nombres: 'Tomás', email: 'flores_tomas@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '44567890', apellidos: 'Benítez', nombres: 'Agustina', email: 'benitez_agustina@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '35432109', apellidos: 'Álvarez', nombres: 'Joaquín', email: 'alvarez_joaquin@ejemplo.com', estado: EstadoUsuario.ACTIVO, rol: RolUsuario.PACIENTE },
  { documento: '34321098', apellidos: 'Ruiz', nombres: 'Marcela', email: 'ruiz_marcela@ejemplo.com', estado: EstadoUsuario.BAJA, rol: RolUsuario.PACIENTE },
];