'use client';

import {
  Bell,
  FileText,
  Repeat,
  Zap,
  Globe,
  Rows,
  Calendar,
  Send,
  Settings,
  Clock,
  Contact,
  UserCheck,
  UserX,
  Trash2,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { NotificacionData } from '@/interfaces/notificacion';

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span className="font-medium">{label}:</span>
      <span className="ml-1">{value}</span>
    </div>
  );
}

export default function DetallesNotificaciones({
  detalleNotificacion,
}: {
  detalleNotificacion?: NotificacionData | null;
}) {
  if (!detalleNotificacion) return null;

  return (
    <Card className="max-w-[800px] mx-auto mt-2 mb-8 shadow-lg rounded-xl border border-gray-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8" />
          <h2 className="text-2xl font-bold">
            {detalleNotificacion.nombre || '--'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <InfoRow
            icon={<FileText className="w-4 h-4" />}
            label="Plantilla"
            value={detalleNotificacion.plantillaNombre || '—'}
          />
          <InfoRow
            icon={<Repeat className="w-4 h-4" />}
            label="Periodicidad"
            value={detalleNotificacion.periodicidad || '—'}
          />
          <InfoRow
            icon={<Zap className="w-4 h-4" />}
            label="Disparador"
            value={detalleNotificacion.disparadorEvento || '—'}
          />
          <InfoRow
            icon={<Globe className="w-4 h-4" />}
            label="Origen"
            value={detalleNotificacion.origen || '—'}
          />
          <InfoRow
            icon={<Rows className="w-4 h-4" />}
            label="Campo"
            value={detalleNotificacion.campo || '—'}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Fecha 1"
            value={detalleNotificacion.fecha1 || '—'}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Fecha 2"
            value={detalleNotificacion.fecha2 || '—'}
          />
          <InfoRow
            icon={<Send className="w-4 h-4" />}
            label="Enviar a"
            value={detalleNotificacion.enviarA || '—'}
          />
          <InfoRow
            icon={<Settings className="w-4 h-4" />}
            label="Automatización"
            value={detalleNotificacion.automatizacion ? 'Sí' : 'No'}
          />
          <InfoRow
            icon={<Clock className="w-4 h-4" />}
            label="Fecha automatización"
            value={detalleNotificacion.fechaAutomatizacion || '—'}
          />
          <InfoRow
            icon={<Contact className="w-4 h-4" />}
            label="Usuario automatización"
            value={detalleNotificacion.usuarioAutomatizacion || '—'}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Fecha creación"
            value={detalleNotificacion.fechaCreacion || '—'}
          />
          <InfoRow
            icon={<Contact className="w-4 h-4" />}
            label="Creado por"
            value={detalleNotificacion.creadoPor || '—'}
          />
          <InfoRow
            icon={
              detalleNotificacion.estado ? (
                <UserCheck className="w-4 h-4 text-green-600" />
              ) : (
                <UserX className="w-4 h-4 text-red-600" />
              )
            }
            label="Estado"
            value={detalleNotificacion.estado ? 'Activo' : 'Inactivo'}
          />
          <InfoRow
            icon={<Trash2 className="w-4 h-4 text-red-500" />}
            label="Eliminado"
            value={detalleNotificacion.eliminado ? 'Sí' : 'No'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
