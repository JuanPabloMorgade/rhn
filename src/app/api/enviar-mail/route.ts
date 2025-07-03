import { google } from 'googleapis';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
	try {
		const text = await req.text();
		if (!text)
			return NextResponse.json({ error: 'Body vacÃ­o' }, { status: 400 });
		let body;
		try {
			body = JSON.parse(text);
		} catch (err) {
			return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
		}

		const { to, subject, message, senderEmail } = body;

		if (!senderEmail || !to || !subject || !message) {
			return NextResponse.json(
				{ error: 'Faltan campos requeridos' },
				{ status: 400 }
			);
		}

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

		const rawMessage = [
			`To: ${to}`,
			`From: ${senderEmail}`,
			`Subject: ${subject}`,
			`MIME-Version: 1.0`,
			`Content-Type: text/html; charset=UTF-8`,
			``,
			`${message}`,
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

		return NextResponse.json({ success: true });
	} catch (error) {
		console.error('Error al enviar correo:', error);
		return NextResponse.json({ error: 'Error interno' }, { status: 500 });
	}
}