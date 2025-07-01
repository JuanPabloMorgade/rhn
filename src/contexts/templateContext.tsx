'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import {
  TemplateData,
  TemplatesData,
  DatosPagina,
} from '@/interfaces/template';
import { db } from '@/firebase';
import { UserData } from '@/interfaces/user';
import { fechaAhora } from '@/helpers/helpers';
import { storage } from '@/firebase';

type ResultadoSubida = { url: string; path: string; name: string };

interface TemplateContextProps {
  templateInfo: TemplateData | undefined;
  templatesData: TemplatesData | undefined;
  cargaTemplatePaginado: (limit: number, page: number) => Promise<void>;
  crearTemplate: (nuevoTemplate: Omit<TemplateData, 'id'>) => Promise<string>;
  editarTemplate: (templateActualizado: TemplateData) => Promise<boolean>;
  eliminarTemplate: (id: string) => Promise<void>;
  subirImagen: (file: File, templateId: string) => Promise<ResultadoSubida>;
  eliminarImagenStorage: (rutaImagen: string) => Promise<void>;
  contarActivos: () => Promise<number>;
}

const TemplateContext = createContext<TemplateContextProps | undefined>(
  undefined
);

export const useTemplate = (): TemplateContextProps => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

export const TemplateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [templateInfo, setTemplateInfo] = useState<TemplateData | undefined>(
    undefined
  );
  const [templatesData, setTemplatesData] = useState<TemplatesData | undefined>(
    undefined
  );

  const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fechaAhora);

  const getTemplateInfo = async (
    limit: number,
    pagina: number
  ): Promise<TemplatesData> => {
    const templateCol = collection(db, 'template');
    const templateSnap = await getDocs(
      query(templateCol, orderBy('fecha', 'desc'))
    );

    const usuariosCol = collection(db, 'usuarios');
    const usuariosSnap = await getDocs(usuariosCol);

    const uidToNombre: Record<string, string> = {};
    usuariosSnap.forEach((doc) => {
      const data = doc.data() as UserData;
      uidToNombre[doc.id] = `${data.nombre} ${data.apellido}`;
    });

    const todosTemplates: TemplateData[] = templateSnap.docs.map((docSnap) => {
      const data = docSnap.data() as Omit<TemplateData, 'id'>;
      return {
        id: docSnap.id,
        ...data,
      };
    });

    const totalTemplates = todosTemplates.length;
    const inicio = (pagina - 1) * limit;
    const fin = inicio + limit;

    const templatePaginado: TemplateData[] = todosTemplates
      .slice(inicio, fin)
      .map((template) => {
        const creadorUID = template.creadoPor;
        const nombreCreador = uidToNombre[creadorUID] || 'No disponible';
        return {
          ...template,
          creadoPor: nombreCreador,
        };
      });

    const datosPagina: DatosPagina = {
      datos: totalTemplates,
      sigPaginado: fin < totalTemplates,
      antPaginado: inicio > 0,
      totalDatos: totalTemplates,
    };

    return {
      template: templatePaginado,
      datosPagina,
    };
  };

  const cargaTemplatePaginado = async (limit: number, page: number) => {
    const data = await getTemplateInfo(limit, page);
    setTemplatesData(data);
  };

  const crearTemplate = async (
    nuevoTemplate: Omit<TemplateData, 'id'>
  ): Promise<string> => {
    try {
      const templateRef = collection(db, 'template');
      const dataConFecha = {
        nombre: nuevoTemplate.nombre,
        tipo: nuevoTemplate.tipo,
        asunto: nuevoTemplate.asunto,
        mensaje: nuevoTemplate.mensaje,
        estado: true,
        eliminado: false,
        creadoPor: nuevoTemplate.creadoPor,
        fecha: fechaFormateada,
        imagenUrl: nuevoTemplate.imagenUrl || '',
        imagenPath: nuevoTemplate.imagenPath || '',
        imagenNombre: nuevoTemplate.imagenNombre || '',
      };
      const docRef = await addDoc(templateRef, dataConFecha);
      await updateDoc(doc(db, 'template', docRef.id), {
        id: docRef.id,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al crear el template:', error);
      throw error;
    }
  };

  const editarTemplate = async (templateActualizado: TemplateData) => {
    try {
      const docRef = doc(db, 'template', templateActualizado.id);
      await updateDoc(docRef, {
        nombre: templateActualizado.nombre,
        tipo: templateActualizado.tipo,
        asunto: templateActualizado.asunto,
        mensaje: templateActualizado.mensaje,
        estado: templateActualizado.estado,
        imagenUrl: templateActualizado.imagenUrl ?? '',
        imagenPath: templateActualizado.imagenPath ?? '',
        imagenNombre: templateActualizado.imagenNombre ?? '',
      });
      return true;
    } catch (error) {
      console.error('Error al actualizar el template:', error);
      throw new Error('Error al actualizar el template');
    }
  };

  const eliminarTemplate = async (id: string) => {
    try {
      const docRef = doc(db, 'template', id);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) {
        console.warn(`El template con ID ${id} no existe.`);
        return;
      }
      const data = snapshot.data() as {
        estado: boolean;
        eliminado: boolean;
      };
      const nuevoEstado = !data.estado;
      const nuevoEliminado = !data.eliminado;
      await updateDoc(docRef, {
        estado: nuevoEstado,
        eliminado: nuevoEliminado,
      });
    } catch (error) {
      console.error('Error al “eliminar” el template:', error);
      throw error;
    }
  };

  const subirImagen = async (
    file: File,
    templateId: string
  ): Promise<ResultadoSubida> => {
    const timestamp = Date.now();
    const nombreArchivo = file.name;
    const path = `templates/${templateId}/${timestamp}_${nombreArchivo}`;
    const imagenRef = storageRef(storage, path);

    await uploadBytes(imagenRef, file);
    const url = await getDownloadURL(imagenRef);

    return { url, path, name: `${timestamp}_${nombreArchivo}` };
  };

  const eliminarImagenStorage = async (rutaImagen: string) => {
    try {
      const imgRef = storageRef(storage, rutaImagen);
      await deleteObject(imgRef);
    } catch (error) {
      console.error('Error al eliminar la imagen de Storage:', error);
      throw error;
    }
  };

  const contarActivos = async (): Promise<number> => {
    const personalCol = collection(db, 'template');
    const qActivos = query(personalCol, where('estado', '==', true));
    const snap = await getDocs(qActivos);
    return snap.size;
  };

  return (
    <TemplateContext.Provider
      value={{
        templateInfo,
        templatesData,
        cargaTemplatePaginado,
        crearTemplate,
        editarTemplate,
        eliminarTemplate,
        subirImagen,
        eliminarImagenStorage,
        contarActivos,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
};
