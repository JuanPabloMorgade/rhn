'use client';

import {
  CircleArrowRight,
  CircleArrowLeft,
  Pencil,
  Eye,
  CircleCheck,
  CircleX,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { notificationHeader } from '@/helpers/helpers';
import { useNotificacion } from '@/contexts/notificacionContext';
import { NotificacionData } from '@/interfaces/notificacion';
import { useEffect, useState } from 'react';
import NotificationsForm from './formulario-notificaciones/page';
import DetallesNotificaciones from './detalles-notificaciones/page';

export default function NotificationsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [limite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [notificacionEditar, setNotificacionEditar] =
    useState<NotificacionData | null>(null);

  const { cargaNotificacionPaginado, notificacionesData } = useNotificacion();

  useEffect(() => {
    cargaNotificacionPaginado(limite, 1);
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setNotificacionEditar(null);
    }
  };

  const handleNotificacionCreada = () => {
    setIsOpen(false);
    cargaNotificacionPaginado(limite, paginaActual);
  };

  const handleEditar = (rowData: NotificacionData) => {
    setNotificacionEditar(rowData);
    setIsOpen(true);
  };

  const handleVerNotificacion = (rowData: NotificacionData) => {
    setNotificacionEditar(rowData);
    setIsViewOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">Notificaciones</h1>

          <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsOpen(true)}>
                Nueva notificación
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {notificacionEditar
                    ? 'Editar notificación'
                    : 'Crear nueva notificación'}
                </DialogTitle>
                <DialogDescription>
                  {notificacionEditar
                    ? 'Modificá los campos y presioná "Guardar".'
                    : 'Completá los campos y presioná "Guardar".'}
                </DialogDescription>
              </DialogHeader>
              <NotificationsForm
                notificacionExistente={notificacionEditar}
                onSuccess={handleNotificacionCreada}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-[750px]">
            <DialogHeader>
              <DialogTitle>Detalles de la notificación</DialogTitle>
              <DialogDescription>
                Aquí puedes ver los detalles de la notificación seleccionada.
              </DialogDescription>
            </DialogHeader>
            <DetallesNotificaciones detalleNotificacion={notificacionEditar} />
          </DialogContent>
        </Dialog>

        <Card className="h-[calc(100vh-125px)] flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {notificationHeader.map((column) => (
                    <TableHead key={column.field}>{column.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {notificacionesData?.notificacion.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="h-[48px]">
                    {notificationHeader.map((column) => {
                      if (column.field === 'acciones') {
                        return (
                          <TableCell key={`${rowIndex}-acciones`}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="hover:bg-[#F9F9EC] p-1 rounded opacity-75"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleEditar(row);
                                    }}
                                  >
                                    <Pencil />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  Editar
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="hover:bg-[#F9F9EC] p-1 rounded opacity-75"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerNotificacion(row);
                                    }}
                                  >
                                    <Eye />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      }

                      if (column.field === 'estado') {
                        return (
                          <TableCell key={`${rowIndex}-${column.field}`}>
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium ${
                                row.estado
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {row.estado ? 'Activo' : 'Inactivo'}
                            </span>
                          </TableCell>
                        );
                      }

                      const isFechaField = [
                        'fechaCreacion',
                        'createdAt',
                        'updatedAt',
                      ].includes(column.field);

                      return (
                        <TableCell key={`${rowIndex}-${column.field}`}>
                          {isFechaField && typeof row[column.field] === 'string'
                            ? (row[column.field] as string).slice(0, 10)
                            : row[column.field]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="border-t mt-2 p-2 bg-[#EEEEDD] font-bold">
            <div className="flex justify-end gap-4">
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))}
                disabled={paginaActual === 1}
              >
                <CircleArrowLeft />
              </button>
              <div className="text-base mt-1 ml-[-10] mr-[-10] opacity-75">
                <span>
                  {Math.min(
                    (paginaActual - 1) * limite + 1,
                    notificacionesData?.datosPagina?.totalDatos ?? 0
                  )}
                  -
                  {Math.min(
                    paginaActual * limite,
                    notificacionesData?.datosPagina?.totalDatos ?? 0
                  )}
                </span>{' '}
                de {notificacionesData?.datosPagina?.totalDatos ?? 0}
              </div>
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() => setPaginaActual((prev) => prev + 1)}
                disabled={
                  notificacionesData?.datosPagina?.sigPaginado === false
                }
              >
                <CircleArrowRight />
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
