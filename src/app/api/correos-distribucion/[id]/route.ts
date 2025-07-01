import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { fechaFormateada } from '@/helpers/helpers';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params?.id;
    if (!id)
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });

    const text = await req.text();
    if (!text)
      return NextResponse.json({ error: 'Body vacío' }, { status: 400 });

    let body;
    try {
      body = JSON.parse(text);
    } catch (err) {
      return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
    }

    const { denominacion, email, estado } = body;

    if (!denominacion || !email || estado === undefined) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    const docRef = adminDb.collection('correos-distribucion').doc(id);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      );
    }

    await docRef.update({
      denominacion,
      email,
      estado,
      fechaModificacion: fechaFormateada,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error al actualizar correo:', error?.message);
    return NextResponse.json(
      { error: 'Error interno', detalle: error?.message },
      { status: 500 }
    );
  }
}
