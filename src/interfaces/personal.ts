export interface PersonalData {
  id: string;
  nombre: string;
  apellido: string;
  emailInstitucional: string;
  emailContacto: string;
  telefonoContacto: string;
  relacion: string;
  creadoPor: string;
  fecha: string;
  fechaNacimiento: string;
  fechaIngreso: string;
  fechaEgreso: string;
  dni: string;
  legajo: string;
  perfil: string;
  estado: boolean;
  eliminado: boolean;
}

export interface DatosPagina {
  datos: number | undefined;
  sigPaginado: boolean;
  antPaginado: boolean;
  totalDatos: number | undefined;
}

export interface PersonalesData {
  personal: PersonalData[];
  datosPagina: DatosPagina;
}