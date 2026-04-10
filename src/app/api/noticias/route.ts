import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const publicadas = searchParams.get('publicadas');

        const whereClause = publicadas === 'true'
            ? { publicada: true }
            : {};

        const noticias = await db.execute(async (prisma) => {
            return await prisma.noticia.findMany({
                where: whereClause,
                select: {
                    id: true,
                    titulo: true,
                    resumen: true,
                    autor: true,
                    slug: true,
                    fecha_publicacion: true,
                    creado_en: true,
                    imagenes: {
                        select: {
                            id: true,
                            url_imagen: true,
                            orden: true
                        },
                        orderBy: { orden: 'asc' }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                },
                take: publicadas === 'true' ? 3 : undefined
            });
        }, 'Error al obtener noticias');

        return NextResponse.json(noticias);
    } catch (error) {
        console.error('Error en API de noticias:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { titulo, resumen, contenido, autor, publicada, fecha_publicacion } = body;

        // Generate slug
        const baseSlug = slugify(titulo);
        const slug = await generateUniqueSlug(baseSlug);

        const noticia = await db.execute(async (prisma) => {
            const resultActual = await prisma.noticia.create({
                data: {
                    titulo,
                    slug,
                    resumen,
                    contenido,
                    autor,
                    publicada: publicada || false,
                    fecha_publicacion: publicada && fecha_publicacion ? new Date(fecha_publicacion) : null,
                }
            });

            // Registrar log de auditoría
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'CREAR_NOTICIA',
                    entidad: 'Noticia',
                    id_entidad: resultActual.id,
                    descripcion: `Noticia '${resultActual.titulo}' creada y ${resultActual.publicada ? 'publicada' : 'guardada como borrador'}`,
                    resultado: 'EXITOSO',
                }
            });

            return resultActual;
        }, 'Error al crear noticia');

        return NextResponse.json(noticia, { status: 201 });
    } catch (error) {
        console.error('Error al crear noticia:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

async function generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
        try {
            const existing = await db.execute(async (prisma) => {
                return await prisma.noticia.findUnique({
                    where: { slug },
                    select: { id: true }
                });
            }, 'Error al verificar slug');

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        } catch (error) {
            break;
        }
    }

    return slug;
}
