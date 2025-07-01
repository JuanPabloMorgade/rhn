'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CorreoDistribucion } from '@/interfaces/correoDistribucion';
import { Calendar, Mail, Mails, User, UserCheck, UserX } from 'lucide-react';

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

export default function DetallesDistribucion({
  detalleDistribucion,
}: {
  detalleDistribucion?: CorreoDistribucion | null;
}) {
  if (!detalleDistribucion) return null;

  return (
    <Card className="w-[480px] mx-auto mt-2 mb-8 shadow-lg rounded-xl border border-gray-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Mails className="w-8 h-8" />
          <h2 className="text-2xl font-bold">
            {detalleDistribucion.denominacion || '--'}
          </h2>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <InfoRow
            icon={<User className="w-4 h-4" />}
            label="Denominación"
            value={detalleDistribucion.denominacion}
          />
          <InfoRow
            icon={<Mail className="w-4 h-4" />}
            label="Email"
            value={detalleDistribucion.email}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Fecha de creación"
            value={new Date(detalleDistribucion.fechaCreacion).toLocaleString()}
          />
          <InfoRow
            icon={<User className="w-4 h-4" />}
            label="Creado por"
            value={`${detalleDistribucion.usuarioCreacion?.nombre} ${detalleDistribucion.usuarioCreacion?.apellido}`}
          />
          <InfoRow
            icon={
              detalleDistribucion.estado === true ? (
                <UserCheck className="w-4 h-4 text-green-600" />
              ) : (
                <UserX className="w-4 h-4 text-red-600" />
              )
            }
            label="Estado"
            value={detalleDistribucion.estado === true ? 'Activo' : 'Inactivo'}
          />
        </div>
      </CardContent>
    </Card>
  );
}
