// app/api/notificaciones/cron/route.ts

import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
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
  // 1) Volcamos el HTML a disco para inspección
  const outPath = path.join(process.cwd(), 'ultimo-email.html');
  fs.writeFileSync(outPath, htmlMessage, 'utf8');
  console.log(`📁 [sendEmail] HTML volcado en: ${outPath}`);

  // 2) Lógica de envío vía Gmail
  const recipients = Array.isArray(to) ? to : [to];
  console.log(`🚀 [sendEmail] Enviando "${asunto}" a: ${recipients.join(', ')}`);

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
  for (const email of recipients) {
    console.log(`📧 [sendEmail] Preparando mensaje para ${email}`);
    const rawMessage = [
      `To: ${email}`,
      `From: ${senderEmail}`,
      `Subject: ${asunto}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      htmlMessage,
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
    console.log(`✔ [sendEmail] Mail enviado a ${email}`);
  }
};

const ejecutarProceso = async (resultado: any[]) => {
  const { dia, mes, anio } = getHoyDM();
  const fechaDDMMYYYY = `${dia}/${mes}/${new Date().getFullYear()}`;
  console.log(`🗓️  [cron] Hoy es ${fechaDDMMYYYY}`);

  const snapshot = await adminDb
    .collection('notificaciones')
    .where('automatizacion', '==', true)
    .where('eliminado', '==', false)
    .where('estado', '==', true)
    .get();

  console.log(`[cron] Encontré ${snapshot.docs.length} notificaciones activas`);

  for (const doc of snapshot.docs) {
    const notificacion = doc.data();
    console.log(`\n[cron] Procesando notificación ${doc.id} (disparador: ${notificacion.disparadorEvento})`);

    const senderDoc = await adminDb.doc('configuraciones/MailEnvio').get();
    const senderEmail = senderDoc.data()?.senderEmail;
    if (!notificacion.enviarA || !senderEmail) {
      console.warn(`[cron]  ⚠️ Faltan campos de envío en ${doc.id}`);
      resultado.push({ id: doc.id, error: 'Faltan campos de envío' });
      continue;
    }

    if (!notificacion.plantilla || typeof notificacion.plantilla !== 'string') {
      console.warn(`[cron]  ⚠️ Plantilla no válida en ${doc.id}`);
      resultado.push({ id: doc.id, error: 'ID de plantilla no válido' });
      continue;
    }

    const plantillaSnap = await adminDb
      .collection('template')
      .doc(notificacion.plantilla)
      .get();
    const plantilla = plantillaSnap.data();
    if (!plantilla || !plantilla.mensaje || !plantilla.asunto) {
      console.warn(`[cron]  ⚠️ Plantilla incompleta o no encontrada en ${doc.id}`);
      resultado.push({ id: doc.id, error: 'Plantilla incompleta o no encontrada' });
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
        console.error(`[cron]  ✖ Error enviando ${doc.id}:`, err);
        resultado.push({
          id: doc.id,
          error: 'Falló envío',
          detalle: err.message,
        });
      }
    };

    // DISPARADOR: CAMPO (ej. cumpleaños)
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

    // DISPARADOR: FECHA (diaria, mensual, anual)
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
  console.log('🚀 [cron] Entré al endpoint de notificaciones/cron');
  const resultado: any[] = [];
  await ejecutarProceso(resultado);
  console.log('🚀 [cron] Resultado final:', resultado);
  return NextResponse.json({ ok: true, resultado });
}
