import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const convocatoria = await db.execute(async (prisma) => {
      return await prisma.convocatoria.findUnique({
        where: { id },
        select: {
          id: true,
          titulo: true,
          descripcion: true,
          objetivo: true,
          modalidad: true,
          lugar: true,
          fecha_inicio: true,
          fecha_fin: true,
          fecha_cierre_postulacion: true,
          cupo_maximo: true,
          cupo_disponible: true,
          horas_totales_ofrecidas: true,
          requiere_entrevista: true,
          categoria: {
            select: {
              nombre: true,
              color_hex: true,
            },
          },
          programa: {
            select: {
              nombre: true,
            },
          },
          publicador: {
            select: {
              primer_nombre: true,
              primer_apellido: true,
            },
          },
        },
      });
    }, 'Error al obtener convocatoria');

    if (!convocatoria) {
      return NextResponse.json(
        { error: 'Convocatoria no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json(transformDecimalsToNumbers(convocatoria));
  } catch (error) {
    console.error('Error en API de convocatoria:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'POST', body });
}

export async function PUT(request: Request) {
  const body = await request.json();
  return NextResponse.json({ message: 'PUT', body });
}

export async function DELETE() {
  return NextResponse.json({ message: 'DELETE' });
}
