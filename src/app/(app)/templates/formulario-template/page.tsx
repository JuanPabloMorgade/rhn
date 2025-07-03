'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { formularioTemplate, opcionesTipoTemplate } from '@/helpers/enum';
import { TemplateData } from '@/interfaces/template';
import { CheckCircle, Edit, Save, Trash2, X } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useTemplate } from '@/contexts/templateContext';
import { useAuth } from '@/contexts/authContext';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'react-toastify';
import { placeholdersCanvas } from '@/helpers/helpers';
import type { Editor } from '@tiptap/react';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import { SIMPLE_EDITOR_EMAIL_CSS } from '@/styles/simple-editor-email';
import { extractEditorHtml } from '@/lib/tiptap-utils';

export default function FormularioTemplateSinImagen({
  templateSeleccionado,
  setTemplateSeleccionado,
  isEditing,
  setIsEditing,
  isCreating,
  setIsCreating,
  listadoTemplates,
}: {
  templateSeleccionado: TemplateData | null;
  setTemplateSeleccionado: (t: TemplateData | null) => void;
  isEditing: boolean;
  setIsEditing: (b: boolean) => void;
  isCreating: boolean;
  setIsCreating: (b: boolean) => void;
  listadoTemplates: TemplateData[];
}) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const { userInfo } = useAuth();
  const {
    crearTemplate,
    editarTemplate,
    cargaTemplatePaginado,
    eliminarTemplate,
  } = useTemplate();

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TemplateData>({
    defaultValues: templateSeleccionado || formularioTemplate,
  });

  useEffect(() => {
    reset(templateSeleccionado || formularioTemplate);
  }, [templateSeleccionado, reset]);

  const handleEditarInit = useCallback((ed: Editor) => {
    setEditor(ed);
  }, []);

  const limpiarEdicion = useCallback(() => {
    if (editor) {
      editor.destroy();
      setEditor(null);
    }
  }, [editor]);

  const handleCreateNew = () => {
    limpiarEdicion();
    setTemplateSeleccionado({ ...formularioTemplate, id: '' });
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEditar = () => {
    limpiarEdicion();
    setIsEditing(true);
  };

  const handleCancelar = (e: React.MouseEvent) => {
    e.preventDefault();
    limpiarEdicion();
    if (isCreating) {
      setTemplateSeleccionado(null);
      setIsCreating(false);
      setIsEditing(false);
    } else if (isEditing) {
      const original = listadoTemplates.find(
        (t) => t.id === templateSeleccionado?.id
      );
      setTemplateSeleccionado(original || null);
      setIsEditing(false);
    } else {
      setTemplateSeleccionado(null);
    }
  };

  const handleEliminar = async (id: string) => {
    if (templateSeleccionado?.noEliminar) {
      return toast.error('No se puede eliminar el template');
    }
    try {
      await eliminarTemplate(id);
      await cargaTemplatePaginado(50, 1);
      toast.success('Template actualizado correctamente');
      if (templateSeleccionado) {
        setTemplateSeleccionado({
          ...templateSeleccionado,
          eliminado: !templateSeleccionado.eliminado,
          estado: !templateSeleccionado.estado,
        });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al eliminar el template');
    }
  };

  const onSubmit = async (data: TemplateData) => {
    try {
      const payload = {
        nombre: data.nombre,
        tipo: data.tipo,
        asunto: data.asunto,
        mensaje: data.mensaje,
        estado: data.estado,
        imagenUrl: '',
        imagenPath: '',
        imagenNombre: '',
        creadoPor: isCreating
          ? userInfo?.uid || ''
          : templateSeleccionado?.creadoPor || '',
        fecha: isCreating
          ? new Date().toISOString()
          : templateSeleccionado?.fecha || '',
        eliminado: isCreating
          ? false
          : templateSeleccionado?.eliminado || false,
      };

      let newId = templateSeleccionado?.id || '';
      if (isCreating) {
        newId = await crearTemplate(payload);
        toast.success('Template creado correctamente');
      } else {
        await editarTemplate({ id: newId, ...payload });
        toast.success('Template actualizado correctamente');
      }

      await cargaTemplatePaginado(50, 1);
      setTemplateSeleccionado({ id: newId, ...payload });

      limpiarEdicion();
      setIsCreating(false);
      setIsEditing(false);
      reset(formularioTemplate);
    } catch (e) {
      console.error('Error al guardar el template:', e);
      toast.error('Error al guardar el template');
    }
  };

  return (
    <div>
      {templateSeleccionado ? (
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {isEditing
                ? isCreating
                  ? 'Crear nuevo template'
                  : 'Editar Template'
                : templateSeleccionado.nombre}
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                      onClick={handleCancelar}
                    >
                      <X className="h-4 w-4" /> Cerrar
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleEditar}
                      aria-label="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant={
                            templateSeleccionado.eliminado
                              ? 'secondary'
                              : 'destructive'
                          }
                          size="icon"
                          aria-label="Eliminar/Reactivar"
                        >
                          {templateSeleccionado.eliminado ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se{' '}
                            {templateSeleccionado.eliminado
                              ? 'reactivará'
                              : 'eliminará'}{' '}
                            la plantilla "{templateSeleccionado.nombre}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              handleEliminar(templateSeleccionado.id)
                            }
                          >
                            {templateSeleccionado.eliminado
                              ? 'Reactivar'
                              : 'Eliminar'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                ) : (
                  <>
                    <Button
                      type="submit"
                      size="sm"
                      variant="default"
                      disabled={isSubmitting}
                    >
                      <Save className="mr-2 h-4 w-4" /> Guardar
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleCancelar}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                  </>
                )}
              </div>
            </CardTitle>
            {!isEditing && (
              <CardDescription>
                Asunto: {templateSeleccionado.asunto}
              </CardDescription>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {isEditing && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nombre">Nombre del Template</Label>
                    <Input
                      id="nombre"
                      className={`w-full ${
                        errors.nombre ? 'border-red-500' : ''
                      }`}
                      placeholder="Nombre del Template"
                      {...register('nombre', {
                        required: 'Nombre es obligatorio',
                      })}
                    />
                    {errors.nombre && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.nombre.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="tipo">Tipo del Template</Label>
                    <Controller
                      name="tipo"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            className={`w-full ${
                              errors.tipo ? 'border-red-500' : ''
                            }`}
                          >
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {opcionesTipoTemplate.map((opcion) => (
                              <SelectItem
                                key={opcion.value}
                                value={opcion.value}
                              >
                                {opcion.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.tipo && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.tipo.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="asunto">Asunto</Label>
                  <Input
                    id="asunto"
                    className={`w-full ${
                      errors.asunto ? 'border-red-500' : ''
                    }`}
                    placeholder="Asunto"
                    {...register('asunto', {
                      required: 'Asunto es obligatorio',
                    })}
                  />
                  {errors.asunto && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.asunto.message}
                    </p>
                  )}
                </div>

                <div className="w-full overflow-x-auto">
                  <Label>Se recomienda trabajar en pantallas grandes</Label>
                  <div className="w-full h-[600px] mt-2">
                    <SimpleEditor
                      templateId={templateSeleccionado?.id ?? ''}
                      initialContent={extractEditorHtml(
                        templateSeleccionado?.mensaje || ''
                      )}
                      onInit={handleEditarInit}
                      onUpdate={(html) =>
                        setValue(
                          'mensaje',
                          `<style>${SIMPLE_EDITOR_EMAIL_CSS}</style><div class="simple-editor-content">${html}</div>`
                        )
                      }
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
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
                  <Label htmlFor="estado" className="text-sm">
                    Estado activo
                  </Label>
                </div>
              </>
            )}

            {!isEditing && (
              <>
                {templateSeleccionado?.mensaje && (
                  <div className="mt-4">
                    <Label>Vista previa HTML</Label>
                    <iframe
                      title="Vista previa"
                      srcDoc={templateSeleccionado.mensaje}
                      className="w-full h-[500px] border bg-white rounded-md"
                    />
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-medium mb-1">
                    Placeholders disponibles para usar:
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {placeholdersCanvas.map((p) => (
                      <code
                        key={p.value}
                        className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                      >
                        {p.label}
                      </code>
                    ))}
                  </div>
                </div>
              </>
            )}
          </CardContent>

          {isEditing && (
            <CardFooter className="flex justify-end gap-2">
              <Button type="submit" variant="default" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Guardar
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelar}>
                <X className="mr-2 h-4 w-4" /> Cancelar
              </Button>
            </CardFooter>
          )}
        </form>
      ) : (
        <CardContent className="flex items-center justify-center h-full min-h-[300px]">
          <div className="text-center text-muted-foreground">
            <p>Seleccione una plantilla de la lista o</p>
            <Button
              variant="link"
              onClick={handleCreateNew}
              className="p-0 h-auto"
            >
              Crear un nuevo template
            </Button>
          </div>
        </CardContent>
      )}
    </div>
  );
}
