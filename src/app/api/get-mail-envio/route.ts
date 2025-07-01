import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export async function GET() {
	try {
		const doc = await adminDb.doc('configuraciones/MailEnvio').get();
		const senderEmail = doc.exists ? doc.data()?.senderEmail : null;
		return NextResponse.json({ senderEmail });
	} catch (error) {
		console.error('Error al obtener senderEmail:', error);
		return NextResponse.json({ error: 'Error interno' }, { status: 500 });
	}
}
