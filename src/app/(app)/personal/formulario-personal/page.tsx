"use client";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PersonalData } from "@/interfaces/personal";
import { Controller, useForm } from "react-hook-form";
import {
  formularioPersonal,
  opcionesPerfil,
  opcionesRelacion,
} from "@/helpers/enum";
import { Checkbox } from "@/components/ui/checkbox";
import { usePersonal } from "@/contexts/personalContext";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/authContext";
import { useEffect, useState } from "react";
import { formateoFecha } from "@/helpers/helpers";
import { parse, format } from "date-fns";

function convertirFecha(fecha: string) {
  return format(parse(fecha, "dd/MM/yyyy", new Date()), "yyyy-MM-dd");
}

export default function FormPersonal({
  onSuccess,
  personalExistente,
}: {
  onSuccess?: () => void;
  personalExistente?: PersonalData | null;
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalData>({
    defaultValues: personalExistente
      ? {
          ...personalExistente,
          fechaNacimiento: convertirFecha(personalExistente.fechaNacimiento),
          fechaIngreso: convertirFecha(personalExistente.fechaIngreso),
        }
      : formularioPersonal,
  });
  const [estado, setEstado] = useState(false);
  const { crearPersonal, editarPersonal } = usePersonal();
  const { userInfo } = useAuth();

  useEffect(() => {
    setEstado(personalExistente?.estado ?? false);
  }, []);

  const handleChangeCheckbox = (checked: boolean) => {
    setEstado(checked);
  };

  const capitalizeWords = (value: string) => {
    return value.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const formateoPersonal = (data: PersonalData): PersonalData => {
    const formattedData = { ...data };

    (Object.keys(data) as (keyof PersonalData)[]).forEach((key) => {
      const value = data[key];
      if (
        typeof value === "string" &&
        key !== "emailInstitucional" &&
        key !== "id"
      ) {
        (formattedData as any)[key] = capitalizeWords(value);
      }
    });

    return formattedData;
  };

  const onSubmit = async (data: PersonalData) => {
    const personalData = {
      ...data,
      fechaNacimiento: formateoFecha(data.fechaNacimiento),
      fechaIngreso: formateoFecha(data.fechaIngreso),
      creadoPor: userInfo?.uid ?? "",
      estado: estado,
    };
    const datosFormateados = formateoPersonal(personalData);
    try {
      if (personalExistente) {
        await editarPersonal({
          ...datosFormateados,
        });
        toast.success("Personal editado correctamente");
      } else {
        await crearPersonal(datosFormateados);
        toast.success("Personal creado correctamente");
      }
      onSuccess?.();
    } catch (error) {
      toast.error("Error al crear personal");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-2">
        <div className="flex-1 min-w-0">
          <Label>Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            placeholder="Fecha de Nacimiento"
            {...register("fechaNacimiento", {
              required: "Fecha de nacimiento es obligatoria",
            })}
            className={`w-full ${
              errors.fechaNacimiento ? "border-red-500" : ""
            }`}
          />
          {errors.fechaNacimiento && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fechaNacimiento.message}
            </p>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Label>Fecha de Ingreso</Label>
          <Input
            id="fechaIngreso"
            type="date"
            placeholder="Fecha de Ingreso"
            {...register("fechaIngreso", {
              required: "Fecha de ingreso es obligatoria",
            })}
            className={`w-full ${
              errors.fechaNacimiento ? "border-red-500" : ""
            }`}
          />
          {errors.fechaIngreso && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fechaIngreso.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 mt-4 min-w-0">
          <Label>Nombre</Label>
          <Input
            id="nombre"
            placeholder="Nombre"
            {...register("nombre", {
              required: "Nombre es obligatorio",
            })}
            className={errors.nombre ? "border-red-500" : ""}
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs mt-1">
              {errors.nombre?.message}
            </p>
          )}
        </div>
        <div className="flex-1 mt-4 min-w-0">
          <Label>Apellido</Label>
          <Input
            id="apellido"
            placeholder="Apellido"
            {...register("apellido", {
              required: "Apellido es obligatorio",
            })}
            className={errors.apellido ? "border-red-500" : ""}
          />
          {errors.apellido && (
            <p className="text-red-500 text-xs mt-1">
              {errors.apellido?.message}
            </p>
          )}
        </div>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 mt-4 min-w-0">
          <Label>Email Institucional</Label>
          <Input
            id="emailInstitucional"
            type="email"
            placeholder="Email Institucional"
            {...register("emailInstitucional", {
              required: "Email es obligatorio",
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" },
            })}
            className={errors.emailInstitucional ? "border-red-500" : ""}
            disabled={!!personalExistente}
          />
          {errors.emailInstitucional && (
            <p className="text-red-500 text-xs mt-1">
              {errors.emailInstitucional.message}
            </p>
          )}
        </div>
        <div className="flex-1 mt-4 min-w-0">
          <Label>Perfil</Label>
          <Controller
            control={control}
            name="perfil"
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger
                  className={`w-full min-w-[200px] ${
                    errors.perfil ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Seleccionar perfil" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesPerfil.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.perfil && (
            <p className="text-red-500 text-xs mt-1">{errors.perfil.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 mt-4 min-w-0">
          <Label>Legajo</Label>
          <Input
            id="legajo"
            placeholder="Legajo"
            {...register("legajo", {
              required: "Este campo es obligatorio",
              pattern: { value: /^[0-9]+$/, message: "Solo números" },
            })}
            className={errors.legajo ? "border-red-500" : ""}
            disabled={!!personalExistente}
          />
          {errors.legajo && (
            <p className="text-red-500 text-xs mt-1">{errors.legajo.message}</p>
          )}
        </div>

        <div className="flex-1 mt-4 min-w-0">
          <Label>DNI</Label>
          <Input
            id="dni"
            placeholder="DNI"
            {...register("dni", {
              required: "Este campo es obligatorio",
              pattern: { value: /^[0-9]+$/, message: "Solo números" },
            })}
            className={errors.dni ? "border-red-500" : ""}
            disabled={!!personalExistente}
          />
          {errors.dni && (
            <p className="text-red-500 text-xs mt-1">{errors.dni.message}</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 mt-4 min-w-0">
          <Label>Email de Contacto</Label>
          <Input
            id="emailContacto"
            type="email"
            placeholder="Email de Contacto"
            {...register("emailContacto", {
              pattern: { value: /^\S+@\S+$/i, message: "Email inválido" },
            })}
            className={errors.emailContacto ? "border-red-500" : ""}
          />
          {errors.emailContacto && (
            <p className="text-red-500 text-xs mt-1">
              {errors.emailContacto.message}
            </p>
          )}
        </div>
        <div className="flex-1 mt-4 min-w-0">
          <Label>Teléfono de Contacto</Label>
          <Input
            id="telefonoContacto"
            placeholder="Teléfono de Contacto"
            {...register("telefonoContacto", {
              pattern: { value: /^[0-9]+$/, message: "Solo números" },
            })}
            className={errors.telefonoContacto ? "border-red-500" : ""}
          />
          {errors.telefonoContacto && (
            <p className="text-red-500 text-xs mt-1">
              {errors.telefonoContacto.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1 mt-4 min-w-0">
          <Label>Relación con la Empresa</Label>
          <Controller
            control={control}
            name="relacion"
            rules={{ required: "Campo requerido" }}
            render={({ field }) => (
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <SelectTrigger
                  className={`w-full min-w-[200px] ${
                    errors.perfil ? "border-red-500" : ""
                  }`}
                >
                  <SelectValue placeholder="Seleccionar relación" />
                </SelectTrigger>
                <SelectContent>
                  {opcionesRelacion.map((opcion) => (
                    <SelectItem key={opcion.value} value={opcion.value}>
                      {opcion.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.relacion && (
            <p className="text-red-500 text-xs mt-1">
              {errors.relacion.message}
            </p>
          )}
        </div>
        <div className="flex-1"></div>
      </div>

      {!personalExistente && (
        <div className="flex items-center space-x-2 ml-1 mt-4">
          <Checkbox
            id="status"
            checked={estado}
            onCheckedChange={(checked) => handleChangeCheckbox(!!checked)}
          />
          <label htmlFor="status" className="text-sm">
            Estado activo
          </label>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-6">
        <DialogClose asChild>
          <Button type="button" variant="outline" className="hover:bg-gray-100">
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
}
