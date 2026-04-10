import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id_actividad, id_estudiante } = await request.json();

    if (!id_actividad || !id_estudiante) {
      return NextResponse.json({ error: 'ID de actividad y estudiante requeridos' }, { status: 400 });
    }

    const reportes = await db.execute(async (prisma) => {
      return await prisma.reporteHoras.findMany({
        where: {
          id_actividad: id_actividad,
          id_estudiante: id_estudiante
        },
        orderBy: {
          reportado_en: 'desc'
        }
      });
    }, 'Error al obtener reportes de actividad');

    return NextResponse.json({ reportes });
  } catch (error) {
    console.error('Error en API de reportes de actividad:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
