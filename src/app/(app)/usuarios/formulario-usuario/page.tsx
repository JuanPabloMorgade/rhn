'use client';

import { DialogClose } from '@/components/ui/dialog';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect } from 'react';
import { formularioUsuario, opcionesRol } from '@/helpers/enum';
import { useAuth } from '@/contexts/authContext';
import { Checkbox } from '@/components/ui/checkbox';
import { UserData } from '@/interfaces/user';
import { validateUserForm } from '@/helpers/helpers';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';

export function FormUsersPage({
  onSuccess,
  usuarioExistente,
}: {
  onSuccess?: () => void;
  usuarioExistente?: any;
}) {
  const { registerFirebase, userInfo, editarUsuarioFirebase } = useAuth();
  const isEdit = !!usuarioExistente;

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
    reset,
  } = useForm<UserData>({
    defaultValues: usuarioExistente || formularioUsuario,
  });

  useEffect(() => {
    if (usuarioExistente) {
      reset(usuarioExistente);
    } else {
      reset(formularioUsuario);
    }
  }, [usuarioExistente, reset]);

  const capitalizeWords = (value: string) => {
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formateoUsuarios = (data: UserData): UserData => {
    const formattedData = { ...data };

    (Object.keys(data) as (keyof UserData)[]).forEach((key) => {
      const value = data[key];
      if (
        typeof value === 'string' &&
        key !== 'email' &&
        key !== 'contraseña' &&
        key !== 'uid'
      ) {
        (formattedData as any)[key] = capitalizeWords(value);
      }
    });

    return formattedData;
  };

  const onSubmit = async (data: UserData) => {
    if (!userInfo?.uid) return;

    const { errors: validationErrors, isValid } = validateUserForm(
      data,
      isEdit
    );

    if (!isValid) {
      Object.entries(validationErrors).forEach(([key, message]) => {
        setError(key as keyof UserData, { message });
      });
      return;
    }
    const datosFormateados = formateoUsuarios(data);
    try {
      if (isEdit) {
        await editarUsuarioFirebase(datosFormateados);
        toast.success('Usuario editado exitosamente');
      } else {
        await registerFirebase({
          ...datosFormateados,
          creadoPor: userInfo.uid,
        });
        toast.success('Usuario creado exitosamente');
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div suppressHydrationWarning>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        autoComplete="off"
      >
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Nombre</Label>
            <Input
              {...register('nombre')}
              placeholder="Nombre"
              className={errors.nombre ? 'border-red-500' : ''}
            />
            {errors.nombre && (
              <p className="text-red-500 text-xs mt-1">
                {errors.nombre.message}
              </p>
            )}
          </div>
          <div className="flex-1">
            <Label>Apellido</Label>
            <Input
              {...register('apellido')}
              placeholder="Apellido"
              className={errors.apellido ? 'border-red-500' : ''}
            />
            {errors.apellido && (
              <p className="text-red-500 text-xs mt-1">
                {errors.apellido.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex-1">
          <Label>Email</Label>
          <Input
            {...register('email')}
            placeholder="Email"
            type="email"
            disabled={isEdit}
            autoComplete="off"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {!isEdit && (
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Contraseña</Label>
              <Input
                {...register('contraseña')}
                placeholder="Contraseña"
                type="password"
                autoComplete="new-password"
                className={errors.contraseña ? 'border-red-500' : ''}
              />
              {errors.contraseña && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contraseña.message}
                </p>
              )}
            </div>
            <div className="flex-1">
              <Label>Repetir contraseña</Label>
              <Input
                {...register('contraseña2')}
                placeholder="Repetir contraseña"
                type="password"
                autoComplete="new-password"
                className={errors.contraseña2 ? 'border-red-500' : ''}
              />
              {errors.contraseña2 && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.contraseña2.message}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex-1">
          <Label>Rol</Label>
          <Controller
            name="rol"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={`w-full ${errors.rol ? 'border-red-500' : ''}`}
                >
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesRol.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.rol && (
            <p className="text-red-500 text-xs mt-1">{errors.rol.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-1">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="status"
                checked={field.value}
                onCheckedChange={(val) => field.onChange(!!val)}
              />
            )}
          />
          <label htmlFor="status" className="text-sm">
            Estado activo
          </label>
        </div>

        <div className="flex justify-end gap-2 mt-6">
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
