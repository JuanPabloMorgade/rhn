import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { google } from 'googleapis';
import { formatEmailHtmlServer } from '@/helpers/formatEmailHtmlServer';
import {
	getHoyDM,
	reemplazarPlaceholders,
	parseFechaDDMMYYYY,
	ajustarDiaMensual,
} from '@/helpers/helpers';

const sendEmail = async (
	to: string[] | string,
	asunto: string,
	htmlMessage: string,
	senderEmail: string
) => {
	const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);
	serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

	const jwtClient = new google.auth.JWT(
		serviceAccount.client_email,
		undefined,
		serviceAccount.private_key,
		['https://www.googleapis.com/auth/gmail.send'],
		senderEmail
	);

	await jwtClient.authorize();

	const gmail = google.gmail({ version: 'v1', auth: jwtClient });
	const recipients = Array.isArray(to) ? to : [to];

        for (const email of recipients) {
                const formatted = await formatEmailHtmlServer(htmlMessage);
                const rawMessage = [
                        `To: ${email}`,
                        `From: ${senderEmail}`,
                        `Subject: ${asunto}`,
                        `MIME-Version: 1.0`,
                        `Content-Type: text/html; charset=UTF-8`,
                        ``,
                        formatted,
                ].join('\n');

		const encodedMessage = Buffer.from(rawMessage)
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');

		await gmail.users.messages.send({
			userId: 'me',
			requestBody: { raw: encodedMessage },
		});
	}
};

const ejecutarProceso = async (resultado: any[]) => {
	const { dia, mes, anio, fechaDDMMYYYY } = {
		...getHoyDM(),
		fechaDDMMYYYY: `${getHoyDM().dia}/${
			getHoyDM().mes
		}/${new Date().getFullYear()}`,
	};

	const snapshot = await adminDb
		.collection('notificaciones')
		.where('automatizacion', '==', true)
		.where('eliminado', '==', false)
		.where('estado', '==', true)
		.get();

	for (const doc of snapshot.docs) {
		const notificacion = doc.data();

		const senderDoc = await adminDb.doc('configuraciones/MailEnvio').get();
		const senderEmail = senderDoc.data()?.senderEmail;

		if (!notificacion.enviarA || !senderEmail) {
			resultado.push({ id: doc.id, error: 'Faltan campos de envÃ­o' });
			continue;
		}

		if (!notificacion.plantilla || typeof notificacion.plantilla !== 'string') {
			resultado.push({ id: doc.id, error: 'ID de plantilla no vÃ¡lido' });
			continue;
		}

		const plantillaSnap = await adminDb
			.collection('template')
			.doc(notificacion.plantilla)
			.get();
		const plantilla = plantillaSnap.data();

		if (!plantilla) {
			resultado.push({ id: doc.id, error: 'Plantilla no encontrada' });
			continue;
		}

		if (!plantilla.mensaje || !plantilla.asunto) {
			resultado.push({ id: doc.id, error: 'Plantilla incompleta' });
			continue;
		}

		const enviar = async (datos?: any) => {
			try {
				const mensaje = reemplazarPlaceholders(plantilla.mensaje, datos ?? {});
				await sendEmail(
					notificacion.enviarA,
					plantilla.asunto,
					mensaje,
					senderEmail
				);

				resultado.push({
					id: doc.id,
					destinatario: notificacion.enviarA,
					tipo: notificacion.disparadorEvento,
					plantilla: notificacion.plantilla,
					envio: 'OK',
				});
			} catch (err: any) {
				resultado.push({
					id: doc.id,
					error: 'FallÃ³ envÃ­o',
					detalle: err.message,
				});
			}
		};

		// DISPARADOR: CAMPO
		if (notificacion.disparadorEvento === 'Campo') {
			const origenSnap = await adminDb
				.collection(notificacion.origen)
				.where('estado', '==', true)
				.where('eliminado', '==', false)
				.get();

			for (const persona of origenSnap.docs) {
				const datos = persona.data();
				const valorCampo = datos[notificacion.campo];
				if (!valorCampo) continue;

				const fecha = parseFechaDDMMYYYY(valorCampo);
				if (!fecha || isNaN(fecha.getTime())) continue;

				const cumpleDM = {
					dia: fecha.getDate().toString().padStart(2, '0'),
					mes: (fecha.getMonth() + 1).toString().padStart(2, '0'),
				};

				if (cumpleDM.dia === dia && cumpleDM.mes === mes) {
					await enviar(datos);
				}
			}
		}

		// DISPARADOR: FECHA
		if (notificacion.disparadorEvento === 'Fecha') {
			const hoyISO = new Date().toISOString().split('T')[0];
			let diaNotificacion = notificacion.dia;
			if (notificacion.periodicidad === 'Mensual' && notificacion.dia) {
				diaNotificacion = ajustarDiaMensual(notificacion.dia, mes, anio);
			}

			if (
				notificacion.fecha1 === hoyISO ||
				notificacion.fecha2 === hoyISO ||
				diaNotificacion === dia ||
				notificacion.diaMes === `${dia}/${mes}`
			) {
				await enviar();
			}
		}
	}
};

export async function POST() {
	const resultado: any[] = [];
	await ejecutarProceso(resultado);
	return NextResponse.json({ ok: true, resultado });
}