export interface UserData {
  uid: string;
  apellido: string;
  nombre: string;
  email: string;
  rol: string;
  status?: boolean;
  creadoPor: string;
  eliminado?: boolean;
  fecha: string;
  contraseña?: string;
  contraseña2?: string;
}

export interface DatosPagina {
  totalDatos: number | undefined;
  sigPaginado: boolean;
  antPaginado: boolean;
  usuarios: number | undefined;
}

export interface UsersDataState {
  usuarios: UserData[];
  datosPagina: DatosPagina;
}
