'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/authContext';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'firebase/auth';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';

export default function PerfilUsuarioDialog({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (value: boolean) => void;
}) {
  const { userInfo, user, editarUsuarioFirebase, setUserInfo } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      actual: '',
      contraseña: '',
      contraseña2: '',
    },
  });

  const contraseña = watch('contraseña');
  const contraseña2 = watch('contraseña2');

  useEffect(() => {
    reset({
      nombre: userInfo?.nombre || '',
      apellido: userInfo?.apellido || '',
      actual: '',
      contraseña: '',
      contraseña2: '',
    });
  }, [userInfo, reset]);

  const onSubmit = async (data: any) => {
    if (!user || !userInfo?.uid) return;

    if (data.contraseña && data.contraseña !== data.contraseña2) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    try {
      setIsSubmitting(true);

      await editarUsuarioFirebase({
        ...userInfo,
        nombre: data.nombre,
        apellido: data.apellido,
      });

      setUserInfo({
        ...userInfo,
        nombre: data.nombre,
        apellido: data.apellido,
      });

      if (data.contraseña) {
        if (!data.actual) {
          toast.error('Debés ingresar tu contraseña actual para cambiarla');
          setIsSubmitting(false);
          return;
        }
        const credential = EmailAuthProvider.credential(
          user.email!,
          data.actual
        );
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, data.contraseña);
      }

      toast.success('Perfil actualizado correctamente');
      setIsSubmitting(false);
      setOpen(false);
    } catch (error: any) {
      console.error(error);
      setIsSubmitting(false);
      if (error.code === 'auth/wrong-password') {
        toast.error('Contraseña actual incorrecta');
      } else if (error.code === 'auth/requires-recent-login') {
        toast.error(
          'Por seguridad, tenés que volver a iniciar sesión para hacer esto'
        );
      } else {
        toast.error('Error al actualizar perfil');
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mi perfil</DialogTitle>
          <DialogDescription>Editá tus datos personales</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                {...register('nombre', { required: true })}
                placeholder="Nombre"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Apellido</label>
              <Input
                {...register('apellido', { required: true })}
                placeholder="Apellido"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Email</label>
            <Input value={userInfo?.email} disabled />
          </div>

          <div>
            <label className="text-sm font-medium">Contraseña actual</label>
            <Input
              type="password"
              placeholder="Contraseña actual"
              {...register('actual', {
                validate: (value) =>
                  !watch('contraseña') || value.trim() !== ''
                    ? true
                    : 'Ingresá tu contraseña actual para cambiarla',
              })}
            />
            {errors.actual && (
              <p className="text-sm text-red-500 mt-1">
                {errors.actual.message}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Nueva contraseña</label>
              <Input
                type="password"
                placeholder="Nueva contraseña"
                {...register('contraseña', {
                  minLength: {
                    value: 6,
                    message: 'La contraseña debe tener al menos 6 caracteres',
                  },
                })}
              />
              {errors.contraseña && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.contraseña.message}
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">Repetir contraseña</label>
              <Input
                type="password"
                placeholder="Repetir contraseña"
                {...register('contraseña2', {
                  validate: (value) =>
                    value === watch('contraseña') ||
                    'Las contraseñas no coinciden',
                })}
              />
              {errors.contraseña2 && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.contraseña2.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Cerrar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
