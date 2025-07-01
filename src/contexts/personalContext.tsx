'use client';

import { db } from '@/firebase';
import { fechaAhora } from '@/helpers/helpers';
import {
  DatosPagina,
  PersonalData,
  PersonalesData,
} from '@/interfaces/personal';
import { UserData } from '@/interfaces/user';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import React, { createContext, useContext, useState } from 'react';

interface PersonalContextProps {
  personalInfo: PersonalData | undefined;
  personalesData: PersonalesData | undefined;
  cargaPersonalPaginado: (limit: number, page: number) => Promise<void>;
  crearPersonal: (nuevoPersonal: Omit<PersonalData, 'id'>) => Promise<string>;
  editarPersonal: (personalActualizado: PersonalData) => Promise<boolean>;
  deshabilitarPersonal: (personalActualizado: PersonalData) => Promise<boolean>;
  contarActivos: () => Promise<number>;
}

const PersonalContext = createContext<PersonalContextProps | undefined>(
  undefined
);

export const PersonalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [personalInfo, setPersonalInfo] = React.useState<
    PersonalData | undefined
  >(undefined);
  const [personalesData, setPersonalesData] = React.useState<
    PersonalesData | undefined
  >(undefined);

  const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(fechaAhora);

  const getPersonalInfo = async (
    limit: number,
    pagina: number
  ): Promise<PersonalesData> => {
    const personalCol = collection(db, 'personal');
    const personalSnap = await getDocs(
      query(personalCol, orderBy('fecha', 'desc'))
    );

    const usuariosCol = collection(db, 'usuarios');
    const usuariosSnap = await getDocs(usuariosCol);

    const uidToNombre: Record<string, string> = {};
    usuariosSnap.forEach((doc) => {
      const data = doc.data() as UserData;
      uidToNombre[doc.id] = `${data.nombre} ${data.apellido}`;
    });

    const todosPersonales: PersonalData[] = personalSnap.docs.map((doc) => {
      const data = doc.data() as Omit<PersonalData, 'id'>;
      return {
        id: doc.id,
        ...data,
      };
    });

    const totalPersonales = todosPersonales.length;
    const inicio = (pagina - 1) * limit;
    const fin = inicio + limit;

    const personalPaginado: PersonalData[] = todosPersonales
      .slice(inicio, fin)
      .map((personal) => {
        const creadorUID = personal.creadoPor;
        const nombreCreador = uidToNombre[creadorUID] || 'No disponible';
        return {
          ...personal,
          creadoPor: nombreCreador,
        };
      });

    const datosPagina: DatosPagina = {
      datos: totalPersonales,
      sigPaginado: fin < totalPersonales,
      antPaginado: inicio > 0,
      totalDatos: totalPersonales,
    };

    return {
      personal: personalPaginado,
      datosPagina,
    };
  };

  const cargaPersonalPaginado = async (limit: number, page: number) => {
    const data = await getPersonalInfo(limit, page);
    setPersonalesData(data);
  };

  const crearPersonal = async (
    nuevoPersonal: Omit<PersonalData, 'id'>
  ): Promise<string> => {
    try {
      const personalRef = collection(db, 'personal');
      const dataConFecha = {
        ...nuevoPersonal,
        fecha: fechaFormateada,
        eliminado: false,
      };
      const docRef = await addDoc(personalRef, dataConFecha);
      await updateDoc(doc(db, 'personal', docRef.id), {
        id: docRef.id,
      });

      return docRef.id;
    } catch (error) {
      console.error('Error al crear personal:', error);
      throw error;
    }
  };

  const editarPersonal = async (personalActualizado: PersonalData) => {
    try {
      await updateDoc(doc(db, 'personal', personalActualizado.id), {
        nombre: personalActualizado.nombre,
        apellido: personalActualizado.apellido,
        fechaNacimiento: personalActualizado.fechaNacimiento,
        fechaIngreso: personalActualizado.fechaIngreso,
        perfil: personalActualizado.perfil,
        relacion: personalActualizado.relacion,
        emailContacto: personalActualizado.emailContacto,
        telefonoContacto: personalActualizado.telefonoContacto,
        estado: personalActualizado.estado,
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar el personal:', error);
      throw new Error('Error al actualizar el personal');
    }
  };

  const deshabilitarPersonal = async (personalActualizado: PersonalData) => {
    try {
      await updateDoc(doc(db, 'personal', personalActualizado.id), {
        estado: !personalActualizado.estado,
        eliminado: !personalActualizado.eliminado,
        fechaEgreso: personalActualizado.fechaEgreso,
      });

      return true;
    } catch (error) {
      console.error('Error al actualizar el personal:', error);
      throw new Error('Error al actualizar el personal');
    }
  };

  const contarActivos = async (): Promise<number> => {
    const personalCol = collection(db, 'personal');
    const qActivos = query(personalCol, where('estado', '==', true));
    const snap = await getDocs(qActivos);
    return snap.size;
  };

  return (
    <PersonalContext.Provider
      value={{
        personalInfo,
        personalesData,
        cargaPersonalPaginado,
        crearPersonal,
        editarPersonal,
        deshabilitarPersonal,
        contarActivos,
      }}
    >
      {children}
    </PersonalContext.Provider>
  );
};

export const usePersonal = (): PersonalContextProps => {
  const context = useContext(PersonalContext);
  if (!context) {
    throw new Error('usePersonal must be used within an PersonalProvider');
  }
  return context;
};
