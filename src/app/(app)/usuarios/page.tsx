'use client';

import * as React from 'react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CircleArrowRight,
  CircleArrowLeft,
  Pencil,
  UserCog,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/authContext';
import { useEffect, useState } from 'react';
import { usuariosHeader } from '@/helpers/helpers';
import { FormUsersPage } from './formulario-usuario/page';
import { Button } from '@/components/ui/button';
import { UserData } from '@/interfaces/user';
import { toast } from 'react-toastify';

export default function UsersPage() {
  const { usersData, cargaUsuariosPaginado, enviarCorreoRestablecimiento } =
    useAuth();
  const [limite] = useState(25);
  const [paginaActual, setPaginaActual] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState<UserData | null>(null);
  const [usuarioParaContraseña, setUsuarioParaContraseña] =
    useState<UserData | null>(null);

  useEffect(() => {
    cargaUsuariosPaginado(limite, paginaActual);
  }, [paginaActual]);

  const handleUsuarioCreado = () => {
    setIsOpen(false);
    cargaUsuariosPaginado(limite, paginaActual);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setUsuarioEditar(null);
    }
  };

  const handleEditar = (rowData: UserData) => {
    setUsuarioEditar(rowData);
    setIsOpen(true);
  };

  const handleModificarContraseña = (rowData: UserData) => {
    //Se establece el usuario para el cual se va a cambiar la contraseña
    setUsuarioParaContraseña(rowData);
    //y se abre el diálogo de restablecimiento de contraseña
    setIsPasswordOpen(true);
  };

  const handleSubmitNuevaContraseña = async () => {
    // Función para enviar el correo de restablecimiento de contraseña
    if (!usuarioParaContraseña) return;
    try {
      await enviarCorreoRestablecimiento(usuarioParaContraseña.email);
      setIsPasswordOpen(false);
      toast.success('Email enviado para restablecer la contraseña');
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      toast.error('Error al enviar el email de restablecimiento');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold tracking-tight mb-6">
          Administrador de usuarios
        </h1>
        <Dialog open={isOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)}>Nuevo usuario</Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {usuarioEditar ? 'Editar usuario' : 'Crear nuevo usuario'}
              </DialogTitle>
              <DialogDescription>
                {usuarioEditar
                  ? 'Modificá los campos y presioná "Guardar".'
                  : 'Completá los campos y presioná "Guardar".'}
              </DialogDescription>
            </DialogHeader>
            <FormUsersPage
              onSuccess={handleUsuarioCreado}
              usuarioExistente={usuarioEditar}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar contraseña</DialogTitle>
            <DialogDescription>
              Se enviará un correo electrónico al usuario:{' '}
              <span className="font-bold"> {usuarioParaContraseña?.email}</span>
              , para restablecer su contraseña.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsPasswordOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleSubmitNuevaContraseña();
                }}
              >
                Restablecer contraseña
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card className="h-[calc(100vh-125px)] flex flex-col">
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {usuariosHeader.map((column) => (
                  <TableHead key={column.field}>{column.header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>

            <TableBody>
              {usersData?.usuarios.map((row, rowIndex) => (
                <TableRow key={rowIndex} className="h-[48px]">
                  {usuariosHeader.map((column) => {
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
                              <TooltipContent side="top">Editar</TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  className="hover:bg-[#F9F9EC] p-1 rounded opacity-75"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleModificarContraseña(row);
                                  }}
                                >
                                  <UserCog />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                Restablecer contraseña
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      );
                    }

                    if (column.field === 'status') {
                      return (
                        <TableCell key={`${rowIndex}-status`}>
                          <span
                            className={`px-2 py-1 rounded text-sm font-medium ${
                              row.status
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {row.status ? 'Activo' : 'Inactivo'}
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
                  usersData?.datosPagina?.usuarios ?? 0
                )}
                -
                {Math.min(
                  paginaActual * limite,
                  usersData?.datosPagina?.usuarios ?? 0
                )}
              </span>{' '}
              de {usersData?.datosPagina?.usuarios ?? 0}
            </div>
            <button
              className="px-2 p-1 rounded opacity-75 disabled:opacity-50"
              onClick={() => setPaginaActual((prev) => prev + 1)}
              disabled={
                usersData && usersData.datosPagina.sigPaginado === false
              }
            >
              <CircleArrowRight />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
