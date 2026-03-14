import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const convocatorias = await db.execute(async (prisma) => {
            return await prisma.convocatoria.findMany({
                where: {
                    estado: 'PUBLICADA',
                    fecha_cierre_postulacion: {
                        gte: new Date()
                    }
                },
                select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    horas_totales_ofrecidas: true,
                    modalidad: true,
                    lugar: true,
                    fecha_inicio: true,
                    fecha_fin: true,
                    programa: {
                        select: {
                            nombre: true
                        }
                    },
                    categoria: {
                        select: {
                            nombre: true,
                            color_hex: true
                        }
                    }
                },
                orderBy: {
                    fecha_inicio: 'desc'
                },
                take: 6
            });
        }, 'Error al obtener convocatorias públicas');

        return NextResponse.json(convocatorias);
    } catch (error) {
        console.error('Error en API de convocatorias públicas:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
