'use client';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import FormularioTemplate from './formulario-template/page';
import React, { useEffect, useState } from 'react';
import { List, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTemplate } from '@/contexts/templateContext';
import { TemplateData } from '@/interfaces/template';
import { formularioTemplate } from '@/helpers/enum';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export default function TemplatePage() {
  const { templatesData, cargaTemplatePaginado } = useTemplate();
  const [limite] = useState(10);
  const [paginaActual] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [templateSeleccionado, setTemplateSeleccionado] =
    useState<TemplateData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [ajusteSwitch, setAjusteSwitch] = useState({
    verEliminados: false,
  });

  useEffect(() => {
    cargaTemplatePaginado(limite, paginaActual);
  }, []);

  useEffect(() => {
    if (!templatesData) return;
    const totalTemplates = templatesData.datosPagina.datos;
    const nuevoLimite = showAll ? totalTemplates : limite;
    cargaTemplatePaginado(nuevoLimite ?? limite, paginaActual);
  }, [showAll]);

  const handleCrearNuevo = () => {
    setTemplateSeleccionado(formularioTemplate);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleSelectTemplate = (template: TemplateData) => {
    setTemplateSeleccionado({ ...template });
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleSwitchChange = (checked: boolean, nombre: string) => {
    setAjusteSwitch((prev) => ({ ...prev, [nombre]: checked }));
  };

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Templates</h1>
      <div className="flex flex-col gap-2 lg:flex-row mt-8">
        <Card className="lg:w-1/3">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <List className="h-5 w-5" /> Listado
              </span>
              <Button variant="outline" size="sm" onClick={handleCrearNuevo}>
                <PlusCircle className="mr-2 h-4 w-4" /> Nuevo
              </Button>
            </CardTitle>
            <CardDescription>
              Seleccione una plantilla para ver o editar.
            </CardDescription>
            <div className="flex items-center justify-between space-x-2 p-4 border rounded-lg">
              <Label
                htmlFor="automaticBirthdayEmails"
                className="flex flex-col space-y-1"
              >
                <span>Ver templates eliminados</span>
                <span className="font-normal leading-snug text-muted-foreground">
                  Activa o desactiva esta opción para ver los otros templates
                </span>
              </Label>
              <Switch
                id="verEliminados"
                checked={ajusteSwitch.verEliminados}
                onCheckedChange={(checked) =>
                  handleSwitchChange(checked, 'verEliminados')
                }
                aria-label="Ver eliminados"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            {templatesData &&
            templatesData.template &&
            templatesData.template.length > 0 ? (
              <>
                {templatesData.template
                  .filter(
                    (template) =>
                      template.eliminado === ajusteSwitch.verEliminados
                  )
                  .map((template) => (
                    <Button
                      key={template.id}
                      variant={
                        templateSeleccionado?.id === template.id
                          ? 'secondary'
                          : 'ghost'
                      }
                      className="w-full justify-start text-left h-auto py-2"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{template.nombre}</span>
                        <span className="text-xs text-muted-foreground">
                          {template.tipo.charAt(0).toUpperCase() +
                            template.tipo.slice(1)}
                        </span>
                      </div>
                    </Button>
                  ))}

                {!showAll && templatesData.datosPagina.sigPaginado && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowAll(true)}
                    >
                      Ver más
                    </Button>
                  </div>
                )}

                {showAll && (templatesData.datosPagina.datos ?? 0) > limite && (
                  <div className="flex justify-center mt-2">
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setShowAll(false)}
                    >
                      Ver menos
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No hay plantillas creadas todavía.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="flex-1">
          {templateSeleccionado ? (
            <FormularioTemplate
              templateSeleccionado={templateSeleccionado}
              setTemplateSeleccionado={setTemplateSeleccionado}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              isCreating={isCreating}
              setIsCreating={setIsCreating}
              listadoTemplates={templatesData?.template || []}
            />
          ) : (
            <CardContent className="flex items-center justify-center h-full min-h-[300px]">
              <div className="text-center text-muted-foreground">
                <p>Seleccione una plantilla de la lista</p>
                <p>o</p>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={handleCrearNuevo}
                >
                  Crear una nuevo template
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
