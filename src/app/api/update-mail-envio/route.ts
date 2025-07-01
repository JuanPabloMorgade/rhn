import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
	try {
		const text = await req.text();
		if (!text)
			return NextResponse.json({ error: 'Body vacío' }, { status: 400 });
		let body;
		try {
			body = JSON.parse(text);
		} catch (err) {
			return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
		}

		const { newSenderEmail, userEmail } = body;

		if (!newSenderEmail || !newSenderEmail.includes('@')) {
			return NextResponse.json({ error: 'Correo inválido' }, { status: 400 });
		}

		if (!userEmail || !userEmail.includes('@')) {
			return NextResponse.json({ error: 'Usuario inválido' }, { status: 400 });
		}

		const docRef = adminDb.doc('configuraciones/MailEnvio');
		const snapshot = await docRef.get();

		const updatePayload = {
			senderEmail: newSenderEmail,
			updatedAt: Timestamp.now(),
			updatedBy: userEmail,
		};

		if (!snapshot.exists) {
			await docRef.set(updatePayload);
		} else {
			const current = snapshot.data()?.senderEmail;
			if (newSenderEmail === current) {
				return NextResponse.json(
					{ error: 'Ya estás usando ese correo' },
					{ status: 400 }
				);
			}
			await docRef.update(updatePayload);
		}

		return NextResponse.json({ message: 'Correo actualizado correctamente' });
	} catch (error) {
		console.error('Error al actualizar senderEmail:', error);
		return NextResponse.json({ error: 'Error interno' }, { status: 500 });
	}
}
