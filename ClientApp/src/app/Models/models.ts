export interface Cliente {
  clienteId: number;
  usuarioId: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  direccionEnvio: string;
  telefono: string;
  usuario: Usuario;
}

export interface Personal {
  personalId: number;
  usuarioId: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  puesto: string;
  fechaContratacion: Date | null;
  usuario: Usuario;
}

export interface Usuario {
  usuarioId: number;
  email: string;
  passwordHash: string;
  rol: string;
  fechaCreacion: Date;
  activo: boolean;
  cliente?: Cliente;
  personal?: Personal;
}

export interface ClienteRegistroModel {
  email: string;
  passwordHash: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  telefono: string;
  direccionEnvio: string;
}

export interface PersonalRegistroModel {
  email: string;
  passwordHash: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  puesto: string;
  fechaContratacion: Date | null;
}
