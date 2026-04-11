import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params;

        if (!slug) {
            return NextResponse.json(
                { error: 'Slug no proporcionado' },
                { status: 400 }
            );
        }

        const noticia = await db.execute(async (prisma) => {
            return await prisma.noticia.findUnique({
                where: { slug },
                include: {
                    imagenes: {
                        select: {
                            id: true,
                            url_imagen: true,
                            orden: true
                        },
                        orderBy: { orden: 'asc' }
                    }
                }
            });
        }, 'Error al obtener noticia por slug');

        if (!noticia) {
            return NextResponse.json(
                { error: 'Noticia no encontrada' },
                { status: 404 }
            );
        }

        // Solo devolver noticias publicadas en el endpoint público
        if (!noticia.publicada) {
            return NextResponse.json(
                { error: 'Noticia no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(noticia);
    } catch (error) {
        console.error('Error en API de noticia por slug:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
