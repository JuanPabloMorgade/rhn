'use client';

import { db } from '@/firebase';
import { fechaAhora } from '@/helpers/helpers';
import {
	DatosPagina,
	NotificacionData,
	NotificacionesData,
} from '@/interfaces/notificacion';
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

interface NoticiationContextProps {
	notificacionesData: NotificacionesData | undefined;
	cargaNotificacionPaginado: (
		limit: number,
		page: number,
		soloActivos?: boolean
	) => Promise<void>;
	crearNotificacion: (
		nuevaNotificacion: Omit<NotificacionData, 'id'>
	) => Promise<string>;
	editarNotificacion: (
		notificacionActualizada: NotificacionData
	) => Promise<boolean>;
	toggleAutomatizacion: (
		id: string,
		enabled: boolean,
		usuarioUid: string,
		fechaAutomatizacion: string
	) => Promise<boolean>;
	deshabilitarNotificacion: (
		notificacionActualizada: NotificacionData
	) => Promise<boolean>;
	opcionesTemplates: () => Promise<{ value: string; label: string }[]>;
	obtenerTiposYTemplates: () => Promise<{
		tipos: string[];
		agrupado: { tipo: string; templates: { value: string; label: string }[] }[];
	}>;
	obtenerTipoDePlantilla: (id: string) => Promise<string | null>;
	contarActivos: () => Promise<number>;
}

const NotificationContext = createContext<NoticiationContextProps | undefined>(
	undefined
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [notificacionesData, setNotificacionesData] = React.useState<
		NotificacionesData | undefined
	>(undefined);

	const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		hour12: false,
	}).format(fechaAhora);

	const getNotificacionInfo = async (
		limit: number,
		pagina: number,
		soloActivos: boolean = false
	): Promise<NotificacionesData> => {
		// 1) traigo todas las notificaciones ordenadas
		const notificacionCol = collection(db, 'notificaciones');
		const notificacionSnap = await getDocs(
			query(notificacionCol, orderBy('fechaCreacion', 'desc'))
		);

		// 2) mapeo a array de NotificacionData
		const todosNotificaciones: NotificacionData[] = notificacionSnap.docs.map(
			(doc) => {
				const data = doc.data() as Omit<NotificacionData, 'id'>;
				return {
					id: doc.id,
					...data,
				};
			}
		);

		// 3) filtro por estado si me lo piden
		const filtradas = soloActivos
			? todosNotificaciones.filter((n) => n.estado === true)
			: todosNotificaciones;

		// 4) calculo paginado
		const totalNotis = filtradas.length;
		const inicio = (pagina - 1) * limit;
		const fin = inicio + limit;
		const sliceNotis = filtradas.slice(inicio, fin);

		// 5) busco nombres de usuarios y plantillas para el slice
		const usuariosCol = collection(db, 'usuarios');
		const usuariosSnap = await getDocs(usuariosCol);
		const uidToNombre: Record<string, string> = {};
		usuariosSnap.forEach((doc) => {
			const { nombre, apellido } = doc.data() as UserData;
			uidToNombre[doc.id] = `${nombre} ${apellido}`;
		});

		const templateCol = collection(db, 'template');
		const templateSnap = await getDocs(templateCol);
		const idToTemplateName: Record<string, string> = {};
		templateSnap.forEach((doc) => {
			const { nombre } = doc.data() as { nombre: string };
			idToTemplateName[doc.id] = nombre;
		});

		// 6) mappeo el slice a la forma final que envío al front
		const notificacionPaginado: NotificacionData[] = sliceNotis.map((noti) => ({
			...noti,
			creadoPor: uidToNombre[noti.creadoPor] || 'No disponible',
			plantillaNombre: idToTemplateName[noti.plantilla] || 'No disponible',
		}));

		// 7) armo datos de paginación
		const datosPagina: DatosPagina = {
			datos: totalNotis,
			sigPaginado: fin < totalNotis,
			antPaginado: inicio > 0,
			totalDatos: totalNotis,
		};

		return {
			notificacion: notificacionPaginado,
			datosPagina,
		};
	};

	const cargaNotificacionPaginado = async (
		limit: number,
		page: number,
		soloActivos: boolean = false
	) => {
		const data = await getNotificacionInfo(limit, page, soloActivos);
		setNotificacionesData(data);
	};

	const crearNotificacion = async (
		nuevaNotificacion: Omit<NotificacionData, 'id'>
	): Promise<string> => {
		try {
			const notificacionRef = collection(db, 'notificaciones');
			const dataConFecha = {
				...nuevaNotificacion,
				fechaCreacion: fechaFormateada,
				eliminado: false,
			};
			const docRef = await addDoc(notificacionRef, dataConFecha);
			await updateDoc(doc(db, 'notificaciones', docRef.id), {
				id: docRef.id,
			});

			return docRef.id;
		} catch (error) {
			console.error('Error al crear la notificacion:', error);
			throw error;
		}
	};

	const editarNotificacion = async (notificacion: NotificacionData) => {
		try {
			const { id, ...datos } = notificacion;
			await updateDoc(doc(db, 'notificaciones', id), datos);
			return true;
		} catch (error) {
			console.error('Error al actualizar la notificación:', error);
			throw new Error('Error al actualizar la notificación');
		}
	};

	const toggleAutomatizacion = async (
		id: string,
		enabled: boolean,
		usuarioUid: string,
		fechaAutomatizacion: string
	) => {
		try {
			await updateDoc(doc(db, 'notificaciones', id), {
				automatizacion: enabled,
				usuarioAutomatizacion: usuarioUid,
				fechaAutomatizacion: fechaAutomatizacion,
			});
			return true;
		} catch (error) {
			console.error('Error al togglear automatizacion:', error);
			throw new Error('No se pudo actualizar la automatización');
		}
	};

	const deshabilitarNotificacion = async (
		notificacionActualizado: NotificacionData
	) => {
		try {
			await updateDoc(doc(db, 'notificaciones', notificacionActualizado.id), {
				estado: !notificacionActualizado.estado,
				eliminado: !notificacionActualizado.eliminado,
			});

			return true;
		} catch (error) {
			console.error('Error al actualizar la notificacion:', error);
			throw new Error('Error al actualizar la notificacion');
		}
	};

	const opcionesTemplates = async (): Promise<
		{ value: string; label: string }[]
	> => {
		const templateCol = collection(db, 'template');
		const q = query(
			templateCol,
			where('estado', '==', true),
			orderBy('nombre', 'asc')
		);

		const snap = await getDocs(q);
		return snap.docs.map((doc) => {
			const data = doc.data() as { nombre: string };
			return {
				value: doc.id,
				label: data.nombre,
			};
		});
	};

	const obtenerTiposYTemplates = async () => {
		const snap = await getDocs(collection(db, 'template'));
		const data = snap.docs
			.filter((doc) => doc.data().estado === true)
			.map((doc) => ({ id: doc.id, ...(doc.data() as any) }));

		const tiposUnicos = [...new Set(data.map((d) => d.tipo).filter(Boolean))];

		const tiposConTemplates = tiposUnicos.map((tipo: string) => ({
			tipo,
			templates: data
				.filter((t) => t.tipo === tipo)
				.map((t) => ({ value: t.id, label: t.nombre })),
		}));

		return {
			tipos: tiposUnicos,
			agrupado: tiposConTemplates,
		};
	};

	const obtenerTipoDePlantilla = async (plantillaId: string) => {
		const plantillaSnap = await getDocs(collection(db, 'template'));
		const doc = plantillaSnap.docs.find((d) => d.id === plantillaId);
		return doc?.data()?.tipo ?? null;
	};

	const contarActivos = async (): Promise<number> => {
		const personalCol = collection(db, 'notificaciones');
		const qActivos = query(personalCol, where('estado', '==', true));
		const snap = await getDocs(qActivos);
		return snap.size;
	};

	return (
		<NotificationContext.Provider
			value={{
				notificacionesData,
				cargaNotificacionPaginado,
				crearNotificacion,
				editarNotificacion,
				toggleAutomatizacion,
				deshabilitarNotificacion,
				opcionesTemplates,
				obtenerTiposYTemplates,
				obtenerTipoDePlantilla,
				contarActivos,
			}}
		>
			{children}
		</NotificationContext.Provider>
	);
};

export const useNotificacion = (): NoticiationContextProps => {
	const context = useContext(NotificationContext);
	if (!context) {
		throw new Error(
			'useNotification must be used within an NotificationProvider'
		);
	}
	return context;
};
