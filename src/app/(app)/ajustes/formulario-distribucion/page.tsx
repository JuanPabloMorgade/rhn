'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { formularioCorreoDistribucion } from '@/helpers/enum';
import { useAuth } from '@/contexts/authContext';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { CorreoDistribucion } from '@/interfaces/correoDistribucion';
import { useCorreos } from '@/contexts/correosDistribucionContext';
import { DialogClose } from '@/components/ui/dialog';

export function FormDiustribucion({
  correoExistente,
  onSuccess,
}: {
  correoExistente?: CorreoDistribucion | null;
  onSuccess?: () => void;
}) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CorreoDistribucion>({
    defaultValues: correoExistente || formularioCorreoDistribucion,
  });
  const { agregarCorreo, actualizarCorreo } = useCorreos();
  const { user, userInfo } = useAuth();

  useEffect(() => {
    reset(correoExistente ?? formularioCorreoDistribucion);
  }, [correoExistente, reset]);

  const onSubmit = async (data: CorreoDistribucion) => {
    const notificacionesData = {
      ...data,
      usuarioCreacion: {
        uid: user?.uid || 'desconocido',
        nombre: userInfo?.nombre || '',
        apellido: userInfo?.apellido || '',
      },
    };
    try {
      if (correoExistente) {
        await actualizarCorreo(correoExistente.id, notificacionesData);
        toast.success('Correo distribución editado correctamente');
      } else {
        await agregarCorreo(notificacionesData);
        toast.success('Correo distribución creado correctamente');
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear el correo distribución');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="denominacion">Denominación</Label>
          <Input
            id="denominacion"
            placeholder="Ingrese la denominación"
            {...register('denominacion', {
              required: 'La denominación es obligatoria',
            })}
            className={errors.denominacion ? 'border-red-500' : ''}
          />
          {errors.denominacion && (
            <p className="text-red-500 text-xs mt-1">
              {errors.denominacion.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            placeholder="Ingrese el email"
            {...register('email', { required: 'El email es obligatorio' })}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Controller
              name="estado"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="estado"
                  checked={field.value}
                  onCheckedChange={(val) => field.onChange(!!val)}
                />
              )}
            />
            <Label htmlFor="estado">Habilitado</Label>
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit" disabled={isSubmitting}>
          Guardar
        </Button>
      </div>
    </form>
  );
}
