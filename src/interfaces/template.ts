export interface TemplateData {
  id: string;
  nombre: string;
  tipo: string;
  asunto: string;
  mensaje: string;
  creadoPor: string;
  fecha?: string;
  estado: boolean;
  eliminado: boolean;
  noEliminar?: boolean;
  imagenUrl?: string;
  imagenPath?: string;
  imagenNombre?: string;
}

export interface DatosPagina {
  datos: number | undefined;
  sigPaginado: boolean;
  antPaginado: boolean;
  totalDatos: number | undefined;
}

export interface TemplatesData {
  template: TemplateData[];
  datosPagina: DatosPagina;
}
