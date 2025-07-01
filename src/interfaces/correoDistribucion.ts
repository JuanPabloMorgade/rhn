export interface CorreoDistribucion {
  id: string;
  denominacion: string;
  email: string;
  estado: boolean;
  fechaCreacion: string;
  usuarioCreacion: {
    uid: string;
    nombre: string;
    apellido: string;
  };
}

export interface DatosPagina {
  datos: number | undefined;
  sigPaginado: boolean;
  antPaginado: boolean;
  totalDatos: number | undefined;
}

export interface CorreoDistribucionData {
  correoDistribucion: CorreoDistribucion[];
  datosPagina: DatosPagina;
}
