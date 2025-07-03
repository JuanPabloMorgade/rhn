import { NotificacionData } from '@/interfaces/notificacion';
import { PersonalData } from '@/interfaces/personal';
import { TemplateData } from '@/interfaces/template';
import { UserData } from '@/interfaces/user';

export interface Opcion {
	value: string;
	label: string;
}

export const opcionesRol: Opcion[] = [
	{ value: 'Admin', label: 'Administrador' },
	{ value: 'Rrhh', label: 'RRHH' },
	{ value: 'Otros', label: 'Otros' },
];

export const opcionesPerfil: Opcion[] = [
	{ value: 'Administrativo', label: 'Administrativo' },
	{ value: 'Desarrollador', label: 'Desarrollador' },
	{ value: 'Project Manager', label: 'Project Manager' },
	{ value: 'Ux/Ui', label: 'UX/UI' },
	{ value: 'Tester', label: 'Tester' },
	{ value: 'Gerente', label: 'Gerente' },
	{ value: 'Analista', label: 'Analista' },
	{ value: 'Rrhh', label: 'RRHH' },
	{ value: 'Otro', label: 'Otro' },
];

export const opcionesRelacion: Opcion[] = [
	{ value: 'Dependencia', label: 'Dependencia' },
	{ value: 'Proveedor', label: 'Proveedor' },
	{ value: 'Proveedor Eventual', label: 'Proveedor Eventual' },
	{ value: 'Pasantia', label: 'Pasantía' },
];

export const opcionesTipoTemplate: Opcion[] = [
	{ value: 'Cumpleaños', label: 'Cumpleaños' },
	{ value: 'Aniversario', label: 'Aniversario' },
	{ value: 'Politica', label: 'Política' },
	{ value: 'Feriado', label: 'Feriado' },
	{ value: 'Beneficios', label: 'Beneficios' },
	{ value: 'Personalizado', label: 'Personalizado' },
];

export const opcionesPeriodicidad: Opcion[] = [
	{ value: 'Anual', label: 'Anual' },
	{ value: 'Mensual', label: 'Mensual' },
	{ value: 'Fecha determinada', label: 'Fecha determinada' },
	{ value: '2 Fechas determinadas', label: '2 Fechas determinadas' },
];

export const opcionesOrigen = [
	{ value: 'personal', label: 'Personal' },
	{ value: 'feriados', label: 'Feriados' },
];

export const opcionesCampoPersonal = [
	{ value: 'fechaNacimiento', label: 'Fecha de nacimiento' },
	{ value: 'fechaIngreso', label: 'Fecha de ingreso' },
];

export const opcionesCampoFeriados = [
	{ value: 'fechaFeriado', label: 'Fecha de feriado' },
];

export const opcionesEnviarA = [
	{ value: 'Email institucional', label: 'Email institucional' },
	{ value: 'Correo de distribución', label: 'Correo de distribución' },
];

export const opcionesDisparador = [
	{ value: 'Campo', label: 'Campo' },
	{ value: 'Fecha', label: 'Fecha' },
];

export const meses = [
	{ value: '01', label: 'Ene' },
	{ value: '02', label: 'Feb' },
	{ value: '03', label: 'Mar' },
	{ value: '04', label: 'Abr' },
	{ value: '05', label: 'May' },
	{ value: '06', label: 'Jun' },
	{ value: '07', label: 'Jul' },
	{ value: '08', label: 'Ago' },
	{ value: '09', label: 'Sep' },
	{ value: '10', label: 'Oct' },
	{ value: '11', label: 'Nov' },
	{ value: '12', label: 'Dic' },
];

export const formularioUsuario: UserData = {
	nombre: '',
	apellido: '',
	email: '',
	contraseña: '',
	contraseña2: '',
	rol: '',
	status: false,
	eliminado: false,
	creadoPor: '',
	uid: '',
	fecha: '',
};

export const formularioPersonal: PersonalData = {
	id: '',
	apellido: '',
	nombre: '',
	emailInstitucional: '',
	emailContacto: '',
	telefonoContacto: '',
	relacion: '',
	creadoPor: '',
	fecha: '',
	fechaNacimiento: '',
	fechaIngreso: '',
	fechaEgreso: '',
	dni: '',
	legajo: '',
	perfil: '',
	estado: false,
	eliminado: false,
};

export const formularioTemplate: TemplateData = {
	id: '',
	nombre: '',
	creadoPor: '',
	fecha: '',
	estado: false,
	eliminado: false,
	tipo: '',
	asunto: '',
	mensaje: '',
	imagenUrl: '',
	imagenPath: '',
};

export const formularioNotificaciones: NotificacionData = {
	id: '',
	nombre: '',
	fechaCreacion: '',
	creadoPor: '',
	plantilla: '',
	periodicidad: '',
	disparadorEvento: '',
	origen: '',
	campo: '',
	fecha1: '',
	fecha2: '',
	enviarA: [],
	fechaAutomatizacion: '',
	usuarioAutomatizacion: '',
	diaMes: '',
	dia: '',
	automatizacion: false,
	estado: false,
	eliminado: false,
	tipoDestino: '',
	relacionDestino: '',
	tipoSeleccionCorreoInstitucional: '',
};

export const formularioCorreoDistribucion = {
	denominacion: '',
	email: '',
	estado: false,
};

export type TotalActivos = {
  personal: number;
  usuarios: number;
  templates: number;
  correoDistribucion: number;
  notificaciones: number;
};
