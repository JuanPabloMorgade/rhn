'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Pencil,
  Eye,
  CircleArrowLeft,
  CircleArrowRight,
  Plus,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  correoDistribucionHeader,
  formateoFecha,
  formateoFechaCompleta,
  notificationAjustesHeader,
} from '@/helpers/helpers';
import DetallesDistribucion from './detalles-distribucion/page';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { toast } from 'react-toastify';
import { useMail } from '@/contexts/mailContext';
import { useAuth } from '@/contexts/authContext';
import { CorreoDistribucion } from '@/interfaces/correoDistribucion';
import { useNotificacion } from '@/contexts/notificacionContext';
import { useCorreos } from '@/contexts/correosDistribucionContext';
import { FormDiustribucion } from './formulario-distribucion/page';

interface Settings {
  senderEmail: string;
}

export default function SettingsPage() {
  const [settings] = useState<Settings>({ senderEmail: '' });
  const {
    cargaNotificacionPaginado,
    notificacionesData,
    toggleAutomatizacion,
  } = useNotificacion();

  const [loadingSwitches, setLoadingSwitches] = useState<string[]>([]);
  const [limiteNoti] = useState(25);
  const [paginaActualNoti, setPaginaActualNoti] = useState(1);

  const [limiteCorreoDistrib] = useState(25);
  const [paginaActualCorreoDistrib, setPaginaActualCorreoDistrib] = useState(1);

  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [error, setError] = useState('');
  const [dialogDetalleAbierto, setDialogDetalleAbierto] = useState(false);
  const [correoSeleccionado, setCorreoSeleccionado] =
    useState<CorreoDistribucion | null>(null);
  const [correoEditando, setCorreoEditando] =
    useState<CorreoDistribucion | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { senderEmail, fetchSenderEmail, updateSenderEmail } = useMail();
  const { correos, cargarCorreos } = useCorreos();
  const { userInfo } = useAuth();

  useEffect(() => {
    cargaNotificacionPaginado(limiteNoti, 1, true);
    cargarCorreos(limiteCorreoDistrib, 1);
  }, []);

  useEffect(() => {
    if (correoEditando) {
      setDialogAbierto(true);
    }
  }, [correoEditando]);

  useEffect(() => {
    if (!senderEmail) {
      fetchSenderEmail();
    }
  }, [senderEmail, fetchSenderEmail]);

  const handleDialogOpenChange = (open: boolean) => {
    setDialogAbierto(open);
    if (!open) {
      setCorreoEditando(null);
    }
  };

  const handleConfirmChange = () => {
    setError('');

    if (!newEmail || !confirmEmail) {
      setError('Completá ambos campos.');
      return;
    }

    if (newEmail !== confirmEmail) {
      setError('Los correos no coinciden.');
      return;
    }

    if (newEmail === settings.senderEmail) {
      setError('El nuevo correo debe ser diferente al actual.');
      return;
    }

    setShowConfirmDialog(true);
  };

  const confirmEmailChange = async () => {
    setShowConfirmDialog(false);

    await updateSenderEmail(newEmail);
  };

  const handleAutomatizacionChange = async (id: string, checked: boolean) => {
    setLoadingSwitches((prev) => [...prev, id]);

    try {
      const isoHoy = new Date().toISOString().split('T')[0];
      const fechaStr = formateoFecha(isoHoy);
      await toggleAutomatizacion(
        id,
        checked,
        userInfo?.uid || 'Usuario desconocido',
        fechaStr
      );
      await cargaNotificacionPaginado(limiteNoti, paginaActualNoti, true);
      toast.success('Automatización actualizada');
    } catch {
      toast.error('No se pudo actualizar la automatización');
    } finally {
      setLoadingSwitches((prev) => prev.filter((sid) => sid !== id));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Ajustes</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuración de automatización</CardTitle>
          <CardDescription>
            Configurar el envío automático de correo electrónico para eventos de
            notificación.
          </CardDescription>
        </CardHeader>
        <div className="flex-1 overflow-auto p-6">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {notificationAjustesHeader.map((column) => (
                  <TableHead key={column.field}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {notificacionesData?.notificacion.map((row, rowIndex) => {
                const isLoading = loadingSwitches.includes(row.id);

                return (
                  <TableRow key={row.id} className="h-[48px]">
                    {notificationAjustesHeader.map((column) => {
                      if (column.field === 'acciones') {
                        return (
                          <TableCell key={`${rowIndex}-acciones`}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div>
                                    <Switch
                                      checked={row.automatizacion}
                                      disabled={isLoading}
                                      onCheckedChange={(checked) =>
                                        handleAutomatizacionChange(
                                          row.id,
                                          checked
                                        )
                                      }
                                      aria-label="Toggle automatización"
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  Automatización
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      }

                      if (column.field === 'estado') {
                        return (
                          <TableCell key={`${rowIndex}-estado`}>
                            <span
                              className={`px-2 py-1 rounded text-sm text-center font-medium ${
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
                            : (row as any)[column.field]}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="border-t mt-2 p-2 bg-[#EEEEDD] font-bold">
            <div className="flex justify-end gap-4">
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() =>
                  setPaginaActualNoti((prev) => Math.max(prev - 1, 1))
                }
                disabled={paginaActualNoti === 1}
              >
                <CircleArrowLeft />
              </button>
              <div className="text-base mt-1 ml-[-10] mr-[-10] opacity-75">
                <span>
                  {Math.min(
                    (paginaActualNoti - 1) * limiteNoti + 1,
                    notificacionesData?.datosPagina?.totalDatos ?? 0
                  )}
                  -
                  {Math.min(
                    paginaActualNoti * limiteNoti,
                    notificacionesData?.datosPagina?.totalDatos ?? 0
                  )}
                </span>{' '}
                de {notificacionesData?.datosPagina?.totalDatos ?? 0}
              </div>
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() => setPaginaActualNoti((prev) => prev + 1)}
                disabled={
                  notificacionesData?.datosPagina?.sigPaginado === false
                }
              >
                <CircleArrowRight />
              </button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Correos de distribución</CardTitle>
            <CardDescription>
              Gestioná los correos a los que se envían las notificaciones.
            </CardDescription>
          </div>
          <Button onClick={() => setDialogAbierto(true)} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Nuevo
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {correoDistribucionHeader.map((col) => (
                    <TableHead key={col.field}>{col.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {correos?.correoDistribucion.map((correo, rowIndex) => (
                  <TableRow key={rowIndex} className="h-[48px]">
                    {correoDistribucionHeader.map((col) => {
                      if (col.field === 'acciones') {
                        return (
                          <TableCell key={`${rowIndex}-acciones`}>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="hover:bg-[#F9F9EC] p-1 rounded opacity-75"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setCorreoEditando(correo);
                                    }}
                                  >
                                    <Pencil className="w-6 h-6" />
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
                                      setCorreoSeleccionado(correo);
                                      setDialogDetalleAbierto(true);
                                    }}
                                  >
                                    <Eye className="w-6 h-6" />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        );
                      }

                      if (col.field === 'estado') {
                        return (
                          <TableCell key={`${rowIndex}-estado`}>
                            <span
                              className={`px-2 py-1 rounded text-sm font-medium text-center ${
                                correo.estado === true
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {correo.estado === true ? 'Activo' : 'Inactivo'}
                            </span>
                          </TableCell>
                        );
                      }

                      const isFecha = [
                        'fechaCreacion',
                        'createdAt',
                        'updatedAt',
                      ].includes(col.field);

                      if (
                        isFecha &&
                        typeof (correo as any)[col.field] === 'string'
                      ) {
                        return (
                          <TableCell key={`${rowIndex}-${col.field}`}>
                            {formateoFechaCompleta((correo as any)[col.field])}
                          </TableCell>
                        );
                      }

                      if (col.field === 'usuarioCreacion') {
                        return (
                          <TableCell key={`${rowIndex}-usuarioCreacion`}>
                            {correo.usuarioCreacion?.nombre}{' '}
                            {correo.usuarioCreacion?.apellido}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell key={`${rowIndex}-${col.field}`}>
                          {(correo as any)[col.field]}
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
                onClick={() =>
                  setPaginaActualCorreoDistrib((prev) => Math.max(prev - 1, 1))
                }
                disabled={paginaActualCorreoDistrib === 1}
              >
                <CircleArrowLeft />
              </button>
              <div className="text-base mt-1 ml-[-10] mr-[-10] opacity-75">
                <span>
                  {Math.min(
                    (paginaActualCorreoDistrib - 1) * limiteCorreoDistrib + 1,
                    correos?.datosPagina?.totalDatos ?? 0
                  )}
                  -
                  {Math.min(
                    paginaActualCorreoDistrib * limiteCorreoDistrib,
                    correos?.datosPagina?.totalDatos ?? 0
                  )}
                </span>{' '}
                de {correos?.datosPagina?.totalDatos ?? 0}
              </div>
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() => setPaginaActualCorreoDistrib((prev) => prev + 1)}
                disabled={correos?.datosPagina?.sigPaginado === false}
              >
                <CircleArrowRight />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Correo Remitente</CardTitle>
          <CardDescription>
            Configurar el envío automático de correo electrónico para eventos de
            notificación.
          </CardDescription>
        </CardHeader>

        <div className="space-y-2 pt-4 p-6">
          <Label>Correo actual del remitente</Label>
          <Input
            type="email"
            value={senderEmail}
            readOnly
            disabled
            className="bg-muted cursor-not-allowed text-muted-foreground"
          />

          <Label>Nuevo correo del remitente</Label>
          <div className="flex flex-col md:flex-row gap-4 max-w-full">
            <Input
              type="email"
              placeholder="nuevo@empresa.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Confirmar nuevo correo"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
            />
          </div>

          <div className="pt-2">
            <Button onClick={handleConfirmChange}>Confirmar cambio</Button>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </Card>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent aria-describedby="">
          <DialogHeader>
            <DialogTitle>¿Confirmar cambio de correo?</DialogTitle>
            <DialogDescription>
              El correo del remitente cambiará a: <strong>{newEmail}</strong>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancelar
            </Button>
            <Button onClick={confirmEmailChange}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={dialogAbierto} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger asChild></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear nueva notificación</DialogTitle>
            <DialogDescription>
              Completá los campos y presioná “Guardar”.
            </DialogDescription>
          </DialogHeader>
          <FormDiustribucion
            correoExistente={correoEditando}
            onSuccess={() => {
              setDialogAbierto(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={dialogDetalleAbierto}
        onOpenChange={setDialogDetalleAbierto}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalle del correo</DialogTitle>
            <DialogDescription>
              Aquí puedes ver los detalles del correo seleccionado.
            </DialogDescription>
          </DialogHeader>
          {correoSeleccionado && (
            <DetallesDistribucion detalleDistribucion={correoSeleccionado} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
