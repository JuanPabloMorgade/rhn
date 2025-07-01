export interface NotificacionData {
  id: string;
  nombre: string;
  plantilla: string;
  periodicidad: string;
  disparadorEvento: string;
  origen: string;
  campo: string;
  fecha1: string;
  fecha2: string;
  enviarA: string;
  automatizacion: boolean;
  fechaAutomatizacion: string;
  usuarioAutomatizacion: string;
  fechaCreacion: string;
  creadoPor: string;
  estado: boolean;
  eliminado: boolean;
  diaMes: string;
  dia: string;
  plantillaNombre?: string;
  icono?: string;
}

export interface DatosPagina {
  datos: number | undefined;
  sigPaginado: boolean;
  antPaginado: boolean;
  totalDatos: number | undefined;
}

export interface NotificacionesData {
  notificacion: NotificacionData[];
  datosPagina: DatosPagina;
}
