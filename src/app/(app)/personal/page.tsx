'use client';

import FormPersonal from './formulario-personal/page';
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
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { personalHeader } from '@/helpers/helpers';
import { usePersonal } from '@/contexts/personalContext';
import { PersonalData } from '@/interfaces/personal';
import DetallesPersonal from './detalles-personal/pages';
import EstadoPersonal from './cambiar-estado/page';
import { useMail } from '@/contexts/mailContext';

export default function PersonalPage() {
  const { personalesData, cargaPersonalPaginado } = usePersonal();
  const [limite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [personalEditar, setPersonalEditar] = useState<PersonalData | null>(
    null
  );

  const { sendEmail } = useMail();

  useEffect(() => {
    cargaPersonalPaginado(limite, paginaActual);
  }, []);

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPersonalEditar(null);
    }
  };

  const handlePersonalCreado = () => {
    setIsOpen(false);
    cargaPersonalPaginado(limite, paginaActual);
  };

  const handleEditar = (rowData: PersonalData) => {
    setPersonalEditar(rowData);
    setIsOpen(true);
  };

  const handleEstadoPersonal = (rowData: PersonalData) => {
    setPersonalEditar(rowData);
    setIsStateOpen(true);
  };

  const handleVerPersonal = (rowData: PersonalData) => {
    setPersonalEditar(rowData);
    setIsViewOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de personal
          </h1>

          <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsOpen(true)}>Nuevo personal</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {personalEditar ? 'Editar personal' : 'Crear nuevo personal'}
                </DialogTitle>
                <DialogDescription>
                  {personalEditar
                    ? 'Modificá los campos y presioná "Guardar".'
                    : 'Completá los campos y presioná "Guardar".'}
                </DialogDescription>
              </DialogHeader>
              <FormPersonal
                onSuccess={handlePersonalCreado}
                personalExistente={personalEditar}
              />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isStateOpen} onOpenChange={setIsStateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modificar estado</DialogTitle>
              <DialogDescription>
                Quieres modificar el estado de{' '}
                <span className="font-bold">
                  {personalEditar?.nombre + ' ' + personalEditar?.apellido}{' '}
                </span>
                ?
                <br />
              </DialogDescription>
            </DialogHeader>
            <EstadoPersonal
              onSuccess={() => {
                handlePersonalCreado();
                setIsStateOpen(false);
              }}
              personalExistente={personalEditar}
              onClose={() => setIsStateOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
          <DialogContent className="max-w-[820px]">
            <DialogHeader>
              <DialogTitle>Detalles del Personal</DialogTitle>
              <DialogDescription>
                Aquí puedes ver los detalles del personal seleccionado.
              </DialogDescription>
            </DialogHeader>
            <DetallesPersonal detallePersonal={personalEditar} />
          </DialogContent>
        </Dialog>

        <Card className="h-[calc(100vh-125px)] flex flex-col">
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  {personalHeader.map((column) => (
                    <TableHead key={column.field}>{column.header}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              <TableBody>
                {personalesData?.personal.map((row, rowIndex) => (
                  <TableRow key={rowIndex} className="h-[48px]">
                    {personalHeader.map((column) => {
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
                                      handleEstadoPersonal(row);
                                    }}
                                  >
                                    {row.estado ? <CircleX /> : <CircleCheck />}
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                  {row.estado ? 'Deshabilitar' : 'Habilitar'}
                                </TooltipContent>
                              </Tooltip>

                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <button
                                    className="hover:bg-[#F9F9EC] p-1 rounded opacity-75"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVerPersonal(row);
                                    }}
                                  >
                                    <Eye />
                                  </button>
                                </TooltipTrigger>
                                <TooltipContent side="top">Ver</TooltipContent>
                              </Tooltip>
                              {/* <Tooltip>
																<TooltipTrigger asChild>
																	<button
																		className='hover:bg-[#F9F9EC] p-1 rounded opacity-75'
																		onClick={(e) => {
																			e.stopPropagation();
																			handleSendMail();
																		}}
																	>
																		<Mail />
																	</button>
																</TooltipTrigger>
																<TooltipContent side='top'>
																	Enviar mail
																</TooltipContent>
															</Tooltip> */}
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
                        'fecha',
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
                    personalesData?.datosPagina?.totalDatos ?? 0
                  )}
                  -
                  {Math.min(
                    paginaActual * limite,
                    personalesData?.datosPagina?.totalDatos ?? 0
                  )}
                </span>{' '}
                de {personalesData?.datosPagina?.totalDatos ?? 0}
              </div>
              <button
                className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
                onClick={() => setPaginaActual((prev) => prev + 1)}
                disabled={personalesData?.datosPagina?.sigPaginado === false}
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
