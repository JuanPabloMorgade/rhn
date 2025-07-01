'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import * as Icons from 'lucide-react';
import { useNotificacion } from '@/contexts/notificacionContext';
import { usePersonal } from '@/contexts/personalContext';
import { useAuth } from '@/contexts/authContext';
import { useTemplate } from '@/contexts/templateContext';
import { useCorreos } from '@/contexts/correosDistribucionContext';
import { TotalActivos } from '@/helpers/enum';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';

export default function DashboardPage() {
  const { notificacionesData, cargaNotificacionPaginado } = useNotificacion();
  const { contarActivos } = usePersonal();
  const { contarActivos: contarActivosAuth } = useAuth();
  const { contarActivos: contarActivosTemplate } = useTemplate();
  const { contarActivos: contarActivosCorreos } = useCorreos();
  const { contarActivos: contarActivosNotificaciones } = useNotificacion();
  const [activos, setActivos] = useState<TotalActivos>({
    personal: 0,
    usuarios: 0,
    templates: 0,
    correoDistribucion: 0,
    notificaciones: 0,
  });
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    cargaNotificacionPaginado(25, 1, true);
    (async () => {
      const [
        personalCount,
        usuariosCount,
        templateCount,
        correosCount,
        notificacionesCount,
      ] = await Promise.all([
        contarActivos(),
        contarActivosAuth(),
        contarActivosTemplate(),
        contarActivosCorreos(),
        contarActivosNotificaciones(),
      ]);

      setActivos({
        personal: personalCount,
        usuarios: usuariosCount,
        templates: templateCount,
        correoDistribucion: correosCount,
        notificaciones: notificacionesCount,
      });
    })();
  }, []);

  useEffect(() => {
    if (!notificacionesData) return;
    const automatizadas = notificacionesData.notificacion.filter(
      (n) => n.automatizacion
    );

    const today = new Date();
    const proximos7Dias = new Set<string>();

    for (let i = 0; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      proximos7Dias.add(`${dd}/${mm}`);
    }

    (async () => {
      const personalSnap = await getDocs(collection(db, 'personal'));
      const personals = personalSnap.docs
        .map((doc) => doc.data())
        .filter((p: any) => p.estado === true);
      const counts: Record<string, number> = {};

      for (const noti of automatizadas) {
        let cnt = 0;

        if (noti.disparadorEvento === 'Campo') {
          console.log('Entro por CAMPO');
          const campo = noti.campo as 'fechaNacimiento' | 'fechaIngreso';
          personals.forEach((personal) => {
            const fechaStr = (personal as any)[campo] as string;
            if (!fechaStr) return;
            const [dd, mm] = fechaStr.split('/');
            console.log(`Comparando ${dd}/${mm} con próximos 7 días`);
            if (proximos7Dias.has(`${dd}/${mm}`)) cnt++;
          });
        } else if (noti.disparadorEvento === 'Fecha') {
          switch (noti.periodicidad) {
            case 'Anual':
              if (noti.diaMes && proximos7Dias.has(noti.diaMes)) cnt++;
              break;

            case 'Mensual':
              const dayNum = Number(noti.dia);
              proximos7Dias.forEach((dmy) => {
                const [dd] = dmy.split('/');
                if (Number(dd) === dayNum) cnt++;
              });
              break;

            case 'Fecha determinada':
              if (noti.fecha1) {
                const [dd, mm] = noti.fecha1.split('/');
                if (proximos7Dias.has(`${dd}/${mm}`)) cnt++;
              }
              break;

            case '2 Fechas determinadas':
              [noti.fecha1, noti.fecha2].forEach((f) => {
                if (!f) return;
                const [dd, mm] = f.split('/');
                if (proximos7Dias.has(`${dd}/${mm}`)) cnt++;
              });
              break;
          }
        }

        counts[noti.id] = cnt;
      }

      setEventCounts(counts);
    })();
  }, [notificacionesData]);

  const automatizadas = notificacionesData?.notificacion.filter(
    (n) => n.automatizacion === true
  );

  const statsCards = [
    { title: 'Personal', count: activos.personal, icon: 'FileUser' },
    { title: 'Usuarios', count: activos.usuarios, icon: 'Users' },
    { title: 'Templates', count: activos.templates, icon: 'LayoutPanelTop' },
    {
      title: 'Correos Distribución',
      count: activos.correoDistribucion,
      icon: 'Mail',
    },
    { title: 'Notificaciones', count: activos.notificaciones, icon: 'BellDot' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Panel</h1>
      <div className="border border-gray-[#F5F5D5] shadow-lg rounded-lg p-6">
        <p className="text-lg font-semibold mb-3">
          Automatizaciones activas - Eventos para los próximos 7 días
        </p>
        {automatizadas && automatizadas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
            {automatizadas.map((noti) => {
              const IconComponent =
                (Icons as any)[noti.icono as string] || Icons.Bell;
              return (
                <Card
                  key={noti.id}
                  className="flex flex-col justify-between h-full transform transition-transform duration-200 ease-out hover:scale-95 shadow"
                >
                  <CardHeader>
                    <div className="flex justify-center items-center gap-2">
                      <CardTitle className="text-base">{noti.nombre}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <p className="font-semibold text-2xl">
                        {' '}
                        {eventCounts[noti.id] ?? 0}
                      </p>
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No hay notificaciones automatizadas.
          </p>
        )}
      </div>

      <div className="border border-gray-[#F5F5D5] shadow-lg rounded-lg p-6">
        <p className="text-lg font-semibold mb-3">
          Configuraciones habilitadas
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-5 gap-6">
          {statsCards.map(({ title, count, icon }) => {
            const IconComponent = (Icons as any)[icon] || Icons.Bell;
            return (
              <Card
                key={title}
                className="flex flex-col justify-between h-full transform transition-transform duration-200 ease-out hover:scale-105 shadow"
              >
                <CardHeader>
                  <div className="flex justify-center items-center gap-2">
                    <CardTitle className="text-base">{title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <p className="font-semibold text-2xl">{count}</p>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
