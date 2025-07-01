'use client';

import { PersonalData } from '@/interfaces/personal';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { usePersonal } from '@/contexts/personalContext';
import { formateoFecha } from '@/helpers/helpers';
import { DialogClose } from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';

export default function EstadoPersonal({
  onSuccess,
  personalExistente,
  onClose,
}: {
  onSuccess?: () => void;
  personalExistente?: PersonalData | null;
  onClose?: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalData>({
    defaultValues: personalExistente ?? undefined,
  });

  const { deshabilitarPersonal } = usePersonal();

  const onSubmit = async (data: PersonalData) => {
    const personalData = {
      ...data,
      fechaEgreso:
        personalExistente?.estado === false
          ? ''
          : formateoFecha(data.fechaEgreso || ''),
    };
    try {
      await deshabilitarPersonal(personalData);
      onSuccess?.();
      onClose?.();
    } catch (error) {
      console.error('Error al editar el personal:', error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        {personalExistente?.estado !== false && (
          <div className="flex flex-col items-center mb-4">
            <p className="text-sm mb-1 text-[#7e7e67]">Fecha de Egreso</p>
            <div className="flex justify-center items-center w-40">
              <Input
                id="fechaEgreso"
                type="date"
                placeholder="Fecha de Egreso"
                {...register('fechaEgreso', {
                  required: personalExistente?.estado
                    ? 'Fecha de egreso es obligatoria'
                    : false,
                })}
                className={`w-full ${
                  errors.fechaEgreso ? 'border-red-500' : ''
                }`}
              />
            </div>
            {errors.fechaEgreso && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fechaEgreso.message}
              </p>
            )}
          </div>
        )}

        {personalExistente?.estado === false && (
          <div className="text-center mb-4">
            <p className="text-sm text-[#7e7e67]">
              El personal ya está deshabilitado, al guardar se volverá a
              habilitar.
            </p>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          <DialogClose asChild>
            <Button
              type="button"
              variant="outline"
              className="hover:bg-gray-100"
            >
              Cancelar
            </Button>
          </DialogClose>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </div>
  );
}
