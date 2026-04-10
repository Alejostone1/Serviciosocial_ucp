import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const programas = await prisma.programa.findMany({
      select: {
        id: true,
        nombre: true,
        nivel_formacion: true,
      },
      orderBy: { nombre: 'asc' },
    });
    
    return NextResponse.json(programas);
  } catch (error) {
    console.error('Error fetching programas:', error);
    return NextResponse.json({ error: 'Error al obtener programas' }, { status: 500 });
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
