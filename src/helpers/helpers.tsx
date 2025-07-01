import { CorreoDistribucion } from '@/interfaces/correoDistribucion';
import { NotificacionData } from '@/interfaces/notificacion';
import { PersonalData } from '@/interfaces/personal';
import { TemplateData } from '@/interfaces/template';
import { UserData } from '@/interfaces/user';

export const fechaAhora = new Date();
export const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(fechaAhora);

export const formateoFecha = (isoDate: string): string => {
  if (!isoDate) return '';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
};

export const formateoFechaCompleta = (isoDate: string): string => {
  if (!isoDate) return '';
  const [fechaSolo] = isoDate.split('T');
  const [year, month, day] = fechaSolo.split('-');
  return `${day}/${month}/${year}`;
};


// -------- Usuarios --------
export type UsuarioColumn = {
  field: keyof UserData | 'acciones';
  header: string;
};

export const usuariosHeader: UsuarioColumn[] = [
  { field: 'apellido', header: 'Apellido' },
  { field: 'nombre', header: 'Nombre' },
  { field: 'email', header: 'Email' },
  { field: 'rol', header: 'Rol' },
  { field: 'fecha', header: 'Fecha' },
  { field: 'creadoPor', header: 'Creado Por' },
  { field: 'status', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' },
];

export const validateUserForm = (formState: UserData, isEdit: boolean) => {
  const newErrors: Record<string, string> = {};

  if (!formState.nombre.trim()) {
    newErrors.nombre = 'El nombre es obligatorio';
  }

  if (!formState.apellido.trim()) {
    newErrors.apellido = 'El apellido es obligatorio';
  }

  if (!formState.email.trim()) {
    newErrors.email = 'El email es obligatorio';
  } else if (!/^\S+@\S+\.\S+$/.test(formState.email)) {
    newErrors.email = 'El email no es válido';
  }

  if (!isEdit) {
    if (!formState.contraseña) {
      newErrors.contraseña = 'La contraseña es obligatoria';
    } else if (formState.contraseña.length < 6) {
      newErrors.contraseña = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formState.contraseña2) {
      newErrors.contraseña2 = 'Debe repetir la contraseña';
    } else if (formState.contraseña !== formState.contraseña2) {
      newErrors.contraseña2 = 'Las contraseñas no coinciden';
    }
  }

  if (!formState.rol) {
    newErrors.rol = 'Debe seleccionar un rol';
  }

  return {
    errors: newErrors,
    isValid: Object.keys(newErrors).length === 0,
  };
};

// -------- Fin Usuarios --------

// -------- Personal --------

export type PersonalColumn = {
  field: keyof PersonalData | 'acciones';
  header: string;
};

export const personalHeader: PersonalColumn[] = [
  { field: 'legajo', header: 'Legajo' },
  { field: 'apellido', header: 'Apellido' },
  { field: 'nombre', header: 'Nombre' },
  { field: 'fechaIngreso', header: 'Fecha de Ingreso' },
  { field: 'emailInstitucional', header: 'Email institucional' },
  { field: 'perfil', header: 'Perfil' },
  { field: 'estado', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' },
];

// -------- Fin Personal --------

// -------- Template --------

export type TemplateColumn = {
  field: keyof TemplateData | 'acciones';
  header: string;
};

export const templateHeader: TemplateColumn[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'tipo', header: 'Tipo' },
  { field: 'asunto', header: 'Asunto' },
  { field: 'mensaje', header: 'Mensaje' },
  { field: 'fecha', header: 'Fecha' },
  { field: 'estado', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' },
];

export const placeholdersCanvas = [
  {
    label: 'Nombre',
    value: '{{nombre}}',
  },
  {
    label: 'Apellido',
    value: '{{apellido}}',
  },
  {
    label: 'Email Institucional',
    value: '{{emailInstitucional}}',
  },
  {
    label: 'Fecha de nacimiento',
    value: '{{fechaNacimiento}}',
  },
  {
    label: 'Fecha de ingreso',
    value: '{{fechaIngreso}}',
  },
  {
    label: 'Fecha de egreso',
    value: '{{fechaEgreso}}',
  },
  {
    label: 'DNI',
    value: '{{dni}}',
  },
  {
    label: 'Legajo',
    value: '{{legajo}}',
  },
  {
    label: 'Perfil',
    value: '{{perfil}}',
  },
  {
    label: 'Fecha Efectiva',
    value: '{{fecha_efectiva}}',
  },
  {
    label: 'Nombre Feriado',
    value: '{{nombre_feriado}}',
  },
  {
    label: 'Fecha',
    value: '{{fecha}}',
  },
  {
    label: 'Fecha Inscripción',
    value: '{{fecha_inscripción}}',
  },
  {
    label: 'Enlace Incripcion',
    value: '{{enlace_incripcion}}',
  },
  {
    label: 'Detalles Beneficios',
    value: '{{detalles_beneficios}}',
  },
];

export const placeholdersFeriados = [
  {
    label: 'Ciclo anual',
    value: '{{cicloAnual}}',
  },
  {
    label: 'Denominación',
    value: '{{denominacion}}',
  },
  {
    label: 'Fecha de feriado',
    value: '{{fechaFeriado}}',
  },
];

// -------- Fin Template --------

// -------- Notificaciones --------

export type NotificationColumn = {
  field: keyof NotificacionData | 'acciones';
  header: string;
};

export const notificationHeader: NotificationColumn[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'plantillaNombre', header: 'Plantilla' },
  { field: 'periodicidad', header: 'Periodicidad' },
  { field: 'fechaCreacion', header: 'Fecha' },
  { field: 'estado', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' },
];

export const notificationAjustesHeader: NotificationColumn[] = [
  { field: 'nombre', header: 'Nombre' },
  { field: 'periodicidad', header: 'Periodicidad' },
  { field: 'fechaCreacion', header: 'Fecha' },
  { field: 'estado', header: 'Estado' },
  { field: 'acciones', header: 'Automatización' },
];

// -------- Fin Notificaciones --------

// -------- Correo Distribución --------

export type correoDistribucionColumn = {
  field: keyof CorreoDistribucion | 'acciones';
  header: string;
};

export const correoDistribucionHeader: correoDistribucionColumn[] = [
  { field: 'denominacion', header: 'Denominación' },
  { field: 'email', header: 'Email' },
  { field: 'fechaCreacion', header: 'Fecha' },
  { field: 'usuarioCreacion', header: 'Creado por' },
  { field: 'estado', header: 'Estado' },
  { field: 'acciones', header: 'Acciones' },
];

// --------  Correo Distribución --------
