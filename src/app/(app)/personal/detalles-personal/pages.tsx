"use client";

import { PersonalData } from "@/interfaces/personal";
import {
  User,
  Mail,
  Calendar,
  BadgeInfo,
  FileBadge,
  Fingerprint,
  Contact,
  UserCheck,
  UserX,
  Phone,
  Briefcase,
  Handshake,
  LogOut,
  LogIn,
  Mails,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

export default function DetallesPersonal({
  detallePersonal,
}: {
  detallePersonal?: PersonalData | null;
}) {
  if (!detallePersonal) return null;

  return (
    <Card className="max-w-[800px] mx-auto mt-2 mb-8 shadow-lg rounded-xl border border-gray-200">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <User className="w-8 h-8" />
          <h2 className="text-2xl font-bold">
            {detallePersonal.nombre} {detallePersonal.apellido}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <InfoRow
            icon={<Mail className="w-4 h-4" />}
            label="Email institucional"
            value={detallePersonal.emailInstitucional || "—"}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Nacimiento"
            value={detallePersonal.fechaNacimiento || "—"}
          />
          <InfoRow
            icon={<Fingerprint className="w-4 h-4" />}
            label="DNI"
            value={detallePersonal.dni || "—"}
          />
          <InfoRow
            icon={<FileBadge className="w-4 h-4" />}
            label="Legajo"
            value={detallePersonal.legajo || "—"}
          />
          <InfoRow
            icon={<Briefcase className="w-4 h-4" />}
            label="Perfil"
            value={detallePersonal.perfil || "—"}
          />
          <InfoRow
            icon={<Handshake className="w-4 h-4" />}
            label="Relación"
            value={detallePersonal.relacion || "—"}
          />
          <InfoRow
            icon={<Mails className="w-4 h-4" />}
            label="Email de contacto"
            value={detallePersonal.emailContacto || "—"}
          />
          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="Teléfono de contacto"
            value={detallePersonal.telefonoContacto || "—"}
          />
          <InfoRow
            icon={<LogIn className="w-4 h-4" />}
            label="Ingreso"
            value={detallePersonal.fechaIngreso || "—"}
          />
          <InfoRow
            icon={<LogOut className="w-4 h-4" />}
            label="Egreso"
            value={detallePersonal.fechaEgreso || "—"}
          />
          <InfoRow
            icon={<Contact className="w-4 h-4" />}
            label="Creado por"
            value={detallePersonal.creadoPor || "—"}
          />
          <InfoRow
            icon={<Calendar className="w-4 h-4" />}
            label="Fecha creación"
            value={detallePersonal.fecha || "—"}
          />
          <InfoRow
            icon={
              detallePersonal.estado ? (
                <UserCheck className="w-4 h-4 text-green-600" />
              ) : (
                <UserX className="w-4 h-4 text-red-600" />
              )
            }
            label="Estado"
            value={detallePersonal.estado ? "Activo" : "Inactivo"}
          />
        </div>
      </CardContent>
    </Card>
  );
}
