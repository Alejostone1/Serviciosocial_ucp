import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getSession() {
    return await getServerSession(authOptions);
}

// GET: Obtener todos los usuarios con sus programas
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const usuarios = await prisma.usuario.findMany({
            select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                correo: true,
                telefono: true,
                rol: true,
                programa: {
                    select: {
                        id: true,
                        nombre: true,
                        facultad: {
                            select: {
                                id: true,
                                nombre: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                primer_apellido: 'asc',
            },
        });

        return NextResponse.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
