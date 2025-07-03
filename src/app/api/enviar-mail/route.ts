// app/api/mensajes/route.ts

import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';
import { formatEmailHtmlServer } from '@/helpers/formatEmailHtmlServer';

export async function POST(req: NextRequest) {
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ error: 'Body vacío' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch {
      return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
    }

    const { to, subject, message: rawHtml, senderEmail } = body;

    if (!senderEmail || !to || !subject || !rawHtml) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // ----> Acá formateamos el HTML en server-side
    const formattedHtml = await formatEmailHtmlServer(rawHtml);
	console.log('>>> [route] HTML recibido de formatEmailHtmlServer:\n', formattedHtml);

    // reconstruimos el MIME con el HTML ya formateado
    const rawMessage = [
      `To: ${to}`,
      `From: ${senderEmail}`,
      `Subject: ${subject}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=UTF-8`,
      ``,
      formattedHtml, // <–– usamos el HTML formateado
    ].join('\n');

    const encodedMessage = Buffer.from(rawMessage)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const serviceAccount = JSON.parse(
      process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
    );
    serviceAccount.private_key = serviceAccount.private_key.replace(
      /\\n/g,
      '\n'
    );

    const jwtClient = new google.auth.JWT(
      serviceAccount.client_email,
      undefined,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/gmail.send'],
      senderEmail
    );
    await jwtClient.authorize();

    const gmail = google.gmail({ version: 'v1', auth: jwtClient });
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
