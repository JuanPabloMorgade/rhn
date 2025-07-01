// src/app/api/correos-distribucion/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { DatosPagina } from '@/interfaces/correoDistribucion';
import { fechaAhora } from '@/helpers/helpers';

const fechaFormateada = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
}).format(fechaAhora);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const offset = (page - 1) * limit;
    const allSnap = await adminDb.collection('correos-distribucion').get();
    const total = allSnap.size;

    const pageSnap = await adminDb
      .collection('correos-distribucion')
      .orderBy('fechaCreacion', 'desc')
      .offset(offset)
      .limit(limit)
      .get();

    const correos = pageSnap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<
        import('@/interfaces/correoDistribucion').CorreoDistribucion,
        'id'
      >),
    }));

    const datosPagina: DatosPagina = {
      datos: total,
      sigPaginado: page * limit < total,
      antPaginado: page > 1,
      totalDatos: total,
    };

    return NextResponse.json({
      correoDistribucion: correos,
      datosPagina,
    });
  } catch (error) {
    console.error('Error al obtener correos paginados:', error);
    return NextResponse.json(
      { error: 'Error al obtener correos' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type inválido' },
        { status: 400 }
      );
    }

    const text = await req.text();
    if (!text) {
      return NextResponse.json({ error: 'Body vacío' }, { status: 400 });
    }

    let body;
    try {
      body = JSON.parse(text);
    } catch (e) {
      console.error('Body inválido:', text);
      return NextResponse.json({ error: 'JSON malformado' }, { status: 400 });
    }

    const { denominacion, email, estado, usuarioCreacion } = body;
    
    if (
      !denominacion ||
      !email ||
      estado === undefined ||
      typeof usuarioCreacion !== 'object' ||
      !usuarioCreacion.uid
    ) {
      return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
    }

    const nuevoDoc = {
      denominacion,
      email,
      estado,
      usuarioCreacion,
      fechaCreacion: fechaFormateada,
    };

    await adminDb.collection('correos-distribucion').add(nuevoDoc);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al agregar correo:', error);
    return NextResponse.json(
      { error: 'Error al agregar correo' },
      { status: 500 }
    );
  }
}
