import { db } from '@/firebase';
import { CorreoDistribucion } from '@/interfaces/correoDistribucion';
import { NotificacionData } from '@/interfaces/notificacion';
import { PersonalData } from '@/interfaces/personal';
import { TemplateData } from '@/interfaces/template';
import { UserData } from '@/interfaces/user';
import { getDocs, collection } from 'firebase/firestore';

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

// -------- API notificaciones --------//

export const getHoyDM = () => {
  const hoy = new Date();

  const dia = hoy.getDate().toString().padStart(2, '0');
  const mes = (hoy.getMonth() + 1).toString().padStart(2, '0');
  const anio = hoy.getFullYear();

  return {
    dia,
    mes,
    anio: anio.toString(),
    fechaStr: hoy.toISOString().split('T')[0],
    fechaDDMMYYYY: `${dia}/${mes}/${anio}`,
  };
};

export const reemplazarPlaceholders = (
  template: string,
  datos: Record<string, any>
): string => {
  return template.replace(/{{\s*([^}]+)\s*}}/g, (_, clave) => {
    const valor = datos[clave.trim()];
    return valor !== undefined ? String(valor) : '';
  });
};

export const parseFechaDDMMYYYY = (fechaStr: string): Date | null => {
  if (!fechaStr || typeof fechaStr !== 'string') return null;

  const [dia, mes, anio] = fechaStr.split('/');
  if (!dia || !mes || !anio) return null;

  return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
};

export const ajustarDiaMensual = (
  dia: string,
  mes: string,
  anio: string
): string => {
  const diaNum = parseInt(dia);
  if (isNaN(diaNum)) return dia;

  // Obtener el último día del mes actual
  const ultimoDia = new Date(parseInt(anio), parseInt(mes), 0).getDate();

  // Si el día ingresado no existe en este mes, usar el último día
  return diaNum > ultimoDia
    ? ultimoDia.toString().padStart(2, '0')
    : dia.padStart(2, '0');
};

// -------- FIN API notificaciones --------//

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

// --------  Fin Correo Distribución --------

// -------- Funcion Formatear Correo Distribución --------

export async function formatEmailHtmlClient(htmlRaw: string): Promise<string> {
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.visibility = 'hidden';
  container.style.left = '-9999px';
  container.innerHTML = htmlRaw;
  document.body.appendChild(container);

  container.querySelectorAll('img').forEach((img) => {
    img.style.height = 'auto';
    img.style.display = 'block';

    const align = img.getAttribute('data-align');
    if (align === 'center') {
      img.style.margin = '0 auto';
    } else if (align === 'right') {
      img.style.marginLeft = 'auto';
      img.style.marginRight = '0';
      img.style.marginTop = '0';
      img.style.marginBottom = '0.5em';
    } else if (align === 'left') {
      img.style.margin = '0 auto 0 0';
    }

    const width = img.getAttribute('data-width');
    if (width) {
      img.style.width = width;
    }
  });

  const finalHtml = container.innerHTML;
  document.body.removeChild(container);
  console.log('HTML formateado:', finalHtml);
  return finalHtml;
}

// -------- Fin Funcion Formatear Correo Distribución --------

// -------- Fecha ISO y DD/MM/YYYY --------

export const toISO = (f?: string) => {
  if (!f) return '';
  const parts = f.split('/');
  if (parts.length !== 3) return '';
  const [dd, mm, yyyy] = parts;
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
};

export const fromISOToDDMMYYYY = (f?: string) => {
  if (!f) return '';
  const parts = f.split('-');
  if (parts.length !== 3) return '';
  const [yyyy, mm, dd] = parts;
  return `${dd}/${mm}/${yyyy}`;
};

// -------- Fin Fecha ISO y DD/MM/YYYY --------