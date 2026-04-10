import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const programas = await prisma.programa.findMany({
      where: { esta_activo: true },
      include: {
        facultad: {
          select: {
            nombre: true
          }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(programas);
  } catch (error) {
    console.error('Error al obtener programas:', error);
    return NextResponse.json(
      { error: 'Error al obtener programas' },
      { status: 500 }
    );
  }
}
