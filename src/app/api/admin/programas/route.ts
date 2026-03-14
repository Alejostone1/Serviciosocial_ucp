import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
    return await getServerSession(authOptions);
}

// GET: Obtener todos los programas
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const programas = await prisma.programa.findMany({
            select: {
                id: true,
                nombre: true,
            },
            orderBy: {
                nombre: 'asc',
            },
        });

        return NextResponse.json(programas);
    } catch (error) {
        console.error('Error al obtener programas:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
