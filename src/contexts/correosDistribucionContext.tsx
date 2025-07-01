'use client';
import { db } from '@/firebase';
import {
  CorreoDistribucion,
  DatosPagina,
  CorreoDistribucionData,
} from '@/interfaces/correoDistribucion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { createContext, useContext, useState } from 'react';

interface CorreosContextProps {
  correos: CorreoDistribucionData | undefined;
  datosPagina: DatosPagina | null;
  cargarCorreos: (limit?: number, page?: number) => Promise<void>;
  agregarCorreo: (
    nuevo: Omit<CorreoDistribucion, 'id' | 'fechaCreacion'>
  ) => Promise<void>;
  actualizarCorreo: (
    id: string,
    data: Partial<Pick<CorreoDistribucion, 'denominacion' | 'email' | 'estado'>>
  ) => Promise<void>;
  contarActivos: () => Promise<number>;
}

const CorreosContext = createContext<CorreosContextProps | undefined>(
  undefined
);

export const CorreosDistribucionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [correos, setCorreos] = useState<CorreoDistribucionData | undefined>(
    undefined
  );
  const [datosPagina, setDatosPagina] = useState<DatosPagina | null>(null);

  const cargarCorreos = async (limit = 20, page = 1) => {
    const res = await fetch(
      `/api/correos-distribucion?limit=${limit}&page=${page}`
    );
    if (!res.ok) throw new Error('Error cargando correos');

    const data = (await res.json()) as CorreoDistribucionData;
    setCorreos(data);
    setDatosPagina(data.datosPagina);
  };

  const agregarCorreo = async (
    nuevo: Omit<CorreoDistribucion, 'id' | 'fechaCreacion'>
  ) => {
    const res = await fetch('/api/correos-distribucion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevo),
    });
    if (res.ok) await cargarCorreos();
  };

  const actualizarCorreo = async (
    id: string,
    data: Partial<Pick<CorreoDistribucion, 'denominacion' | 'email' | 'estado'>>
  ) => {
    const res = await fetch(`/api/correos-distribucion/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Error actualizando correo');
    await cargarCorreos();
  };

  const contarActivos = async (): Promise<number> => {
    const personalCol = collection(db, 'correos-distribucion');
    const qActivos = query(personalCol, where('estado', '==', true));
    const snap = await getDocs(qActivos);
    return snap.size;
  };

  return (
    <CorreosContext.Provider
      value={{
        correos,
        datosPagina,
        cargarCorreos,
        agregarCorreo,
        actualizarCorreo,
        contarActivos,
      }}
    >
      {children}
    </CorreosContext.Provider>
  );
};

export const useCorreos = () => {
  const context = useContext(CorreosContext);
  if (!context)
    throw new Error('useCorreosContext debe usarse dentro de CorreosProvider');
  return context;
};
