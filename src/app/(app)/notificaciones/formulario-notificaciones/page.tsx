'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { DialogClose } from '@/components/ui/dialog';
import { useNotificacion } from '@/contexts/notificacionContext';
import {
  formularioNotificaciones,
  opcionesCampo,
  opcionesDisparador,
  opcionesEnviarA,
  opcionesOrigen,
  opcionesPeriodicidad,
} from '@/helpers/enum';
import { NotificacionData } from '@/interfaces/notificacion';
import { db } from '@/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/authContext';
import { DayGridDropdown } from '@/components/custom/day-grid-dropdown';
import { MonthGridDropdown } from '@/components/custom/month-grid-dropdown';


export default function NotificationsForm({
  onSuccess,
  notificacionExistente,
}: {
  onSuccess?: () => void;
  notificacionExistente?: NotificacionData | null;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<NotificacionData>({ defaultValues: formularioNotificaciones });
  const { opcionesTemplates, crearNotificacion, editarNotificacion } =
    useNotificacion();
  const { user } = useAuth();
  const [templateOptions, setTemplateOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [disparadorOptions, setDisparadorOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const [distributionOptions, setDistributionOptions] = useState<
    { value: string; label: string }[]
  >([]);
  const plantilla = watch('plantilla');
  const periodicidad = watch('periodicidad');
  const disparador = watch('disparadorEvento');
  const enviarA = watch('enviarA');
  const today = new Date().toISOString().split('T')[0];
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    opcionesTemplates().then(setTemplateOptions);
  }, [opcionesTemplates]);

  useEffect(() => {
    if (!notificacionExistente || templateOptions.length === 0) return;
    const toIso = (f?: string) => {
      if (!f) return '';
      const [dd, mm, yyyy] = f.split('/');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    };

    reset({
      ...notificacionExistente,
      fecha1: toIso(notificacionExistente.fecha1),
      fecha2: toIso(notificacionExistente.fecha2),
    });
  }, [notificacionExistente, templateOptions, reset]);

  useEffect(() => {
    resetField('disparadorEvento');
    if (periodicidad === 'Anual' || periodicidad === 'Mensual') {
      setDisparadorOptions(opcionesDisparador);
    } else if (
      periodicidad === 'Fecha determinada' ||
      periodicidad === '2 Fechas determinadas'
    ) {
      setDisparadorOptions([{ value: 'Fecha', label: 'Fecha' }]);
    } else {
      setDisparadorOptions([]);
    }
  }, [periodicidad, resetField]);

  useEffect(() => {
    async function fetchDistribution() {
      const snap = await getDocs(collection(db, 'correosDistribucion'));
      const opts = snap.docs.map((doc) => ({
        value: doc.id,
        label: doc.data().email as string,
      }));
      setDistributionOptions(opts);
    }
    fetchDistribution();
  }, []);

  useEffect(() => {
    if (disparador !== 'Campo') {
      resetField('origen');
      resetField('campo');
    }
    if (disparador !== 'Fecha') {
      resetField('fecha1');
      resetField('fecha2');
    }
    if (!(periodicidad === 'Mensual' && disparador === 'Fecha')) {
      resetField('dia');
    }
  }, [disparador, periodicidad, resetField]);

  const onSubmit = async (data: NotificacionData) => {
    const notificacionesData = {
      ...data,
      creadoPor: user?.uid ?? '',
    };
    try {
      if (notificacionExistente) {
        await editarNotificacion({
          ...notificacionesData,
        });
        toast.success('Personal editado correctamente');
      } else {
        await crearNotificacion(notificacionesData);
        toast.success('Personal creado correctamente');
      }
      onSuccess?.();
    } catch (error) {
      toast.error('Error al crear personal');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            placeholder="Ingrese el Nombre"
            {...register('nombre', { required: 'El nombre es obligatorio' })}
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="plantilla">Plantilla</Label>
          <Controller
            name="plantilla"
            control={control}
            defaultValue={notificacionExistente?.plantilla ?? ''}
            rules={{ required: 'La plantilla es obligatoria' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={errors.plantilla ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.plantilla && (
            <p className="text-red-500 text-xs mt-1">
              {errors.plantilla.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="periodicidad">Periodicidad</Label>
          <Controller
            name="periodicidad"
            control={control}
            defaultValue={notificacionExistente?.periodicidad ?? ''}
            rules={{ required: 'La periodicidad es obligatoria' }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!plantilla}
              >
                <SelectTrigger
                  className={errors.periodicidad ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Seleccionar periodicidad" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesPeriodicidad.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.periodicidad && (
            <p className="text-red-500 text-xs mt-1">
              {errors.periodicidad.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="disparadorEvento">Disparador del evento</Label>
          <Controller
            name="disparadorEvento"
            control={control}
            rules={{ required: 'El disparador es obligatorio' }}
            render={({ field }) => (
              <Select
                value={field.value || ''}
                onValueChange={field.onChange}
                disabled={!periodicidad}
              >
                <SelectTrigger
                  className={errors.disparadorEvento ? 'border-red-500' : ''}
                >
                  <SelectValue placeholder="Seleccionar disparador" />
                </SelectTrigger>
                <SelectContent>
                  {disparadorOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.disparadorEvento && (
            <p className="text-red-500 text-xs mt-1">
              {errors.disparadorEvento.message}
            </p>
          )}
        </div>
      </div>

      <div>
        {periodicidad === 'Mensual' && disparador === 'Fecha' && (
          <Controller
            name="dia"
            control={control}
            defaultValue={notificacionExistente?.dia ?? ''}
            rules={{ required: 'Debes elegir un día' }}
            render={({ field, fieldState }) => (
              <div>
                <div className="flex items-center gap-2">
                  <Label>Día del mes: </Label>
                  <DayGridDropdown
                    placeholder="Ingrese día"
                    value={field.value}
                    onChange={field.onChange}
                    buttonClassName={errors.dia ? 'border-red-500' : ''}
                  />
                  {fieldState.error && (
                    <p className="text-red-500 text-xs mt-1">
                      {fieldState.error.message}
                    </p>
                  )}
                </div>
                <div>
                  {['29', '30', '31'].includes(field.value) && (
                    <p className="text-xs text-[rgba(0,0,0,0.84)] mt-1 drop-shadow-md">
                      Dado que esa fecha no existe en todos los meses, se
                      utilizará automáticamente el último día disponible de cada
                      mes.
                    </p>
                  )}
                </div>
              </div>
            )}
          />
        )}

        {periodicidad === 'Anual' && disparador === 'Fecha' && (
          <div className="flex items-center">
            <Controller
              name="diaMes"
              control={control}
              rules={{ required: 'Debes elegir día y mes' }}
              defaultValue={notificacionExistente?.diaMes ?? ''}
              render={({ field, fieldState }) => {
                const [initDia, initMes] = (field.value || '').split('/');
                const [dia, setDia] = useState(initDia || '');
                const [mes, setMes] = useState(initMes || '');

                useEffect(() => {
                  if (dia && mes) {
                    field.onChange(`${dia}/${mes}`);
                  } else {
                    field.onChange('');
                  }
                }, [dia, mes]);

                useEffect(() => {
                  setDia('');
                }, [mes]);

                const maxDays =
                  mes === '02'
                    ? 28
                    : ['04', '06', '09', '11'].includes(mes)
                    ? 30
                    : 31;

                return (
                  <div>
                    <div className="flex items-center gap-2">
                      <Label>Día y mes: </Label>

                      <MonthGridDropdown
                        value={mes}
                        onChange={setMes}
                        placeholder="Mes"
                        buttonClassName={
                          fieldState.error ? 'border-red-500' : ''
                        }
                      />

                      <DayGridDropdown
                        value={dia}
                        onChange={setDia}
                        placeholder="Día"
                        disabled={!mes}
                        maxDays={maxDays}
                        buttonClassName={
                          fieldState.error ? 'border-red-500' : ''
                        }
                      />
                    </div>
                    <div>
                      {['29', '30', '31'].includes(dia) && (
                        <p className="text-xs text-[rgba(0,0,0,0.84)] mt-1 drop-shadow-md">
                          Dado que esa fecha no existe en todos los meses, se
                          utilizará automáticamente el último día disponible de
                          cada mes.
                        </p>
                      )}
                    </div>
                  </div>
                );
              }}
            />

            {errors.diaMes && (
              <p className="text-red-500 text-xs mt-1 ml-[1rem]">
                {errors.diaMes.message}
              </p>
            )}
          </div>
        )}
      </div>

      {disparador === 'Campo' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="origen">Origen</Label>
            <Controller
              name="origen"
              control={control}
              rules={{ required: 'El origen es obligatorio' }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={errors.origen ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Seleccionar origen" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesOrigen.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.origen && (
              <p className="text-red-500 text-xs mt-1">
                {errors.origen.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="campo">Campo</Label>
            <Controller
              name="campo"
              control={control}
              rules={{ required: 'El campo es obligatorio' }}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger
                    className={errors.campo ? 'border-red-500' : ''}
                  >
                    <SelectValue placeholder="Seleccionar campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {opcionesCampo.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.campo && (
              <p className="text-red-500 text-xs mt-1">
                {errors.campo.message}
              </p>
            )}
          </div>
        </div>
      )}
      {disparador === 'Fecha' && periodicidad === 'Fecha determinada' && (
        <div>
          <Label htmlFor="fecha1">Fecha 1</Label>
          <Input
            id="fecha1"
            type="date"
            min={today}
            {...register('fecha1', { required: 'La Fecha 1 es obligatoria' })}
            className={errors.fecha1 ? 'border-red-500' : ''}
          />
          {errors.fecha1 && (
            <p className="text-red-500 text-xs mt-1">{errors.fecha1.message}</p>
          )}
        </div>
      )}
      {disparador === 'Fecha' && periodicidad === '2 Fechas determinadas' && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="fecha1">Fecha 1</Label>
            <Input
              id="fecha1"
              type="date"
              min={today}
              {...register('fecha1', { required: 'La Fecha 1 es obligatoria' })}
              className={errors.fecha1 ? 'border-red-500' : ''}
            />
            {errors.fecha1 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fecha1.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="fecha2">Fecha 2</Label>
            <Input
              id="fecha2"
              type="date"
              min={today}
              {...register('fecha2', { required: 'La Fecha 2 es obligatoria' })}
              className={errors.fecha2 ? 'border-red-500' : ''}
            />
            {errors.fecha2 && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fecha2.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="enviarA">Enviar a</Label>
        <Controller
          name="enviarA"
          control={control}
          defaultValue={notificacionExistente?.enviarA ?? ''}
          rules={{ required: 'El destinatario es obligatorio' }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className={errors.enviarA ? 'border-red-500' : ''}>
                <SelectValue placeholder="Seleccionar destino" />
              </SelectTrigger>
              <SelectContent>
                {opcionesEnviarA.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.enviarA && (
          <p className="text-red-500 text-xs mt-1">{errors.enviarA.message}</p>
        )}
      </div>
      {enviarA === 'Correo de distribución' && (
        <div>
          <Label>Correo de distribución</Label>
          <div className="p-2 flex-1 border border-gray-[#D9D9BF] rounded-md">
            <p className="ml-1">Listado de Correo de distribución (a futuro)</p>
          </div>
        </div>
      )}

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
