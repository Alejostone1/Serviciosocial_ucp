import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { slugify } from '@/lib/utils';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const noticia = await db.execute(async (prisma) => {
            return await prisma.noticia.findUnique({
                where: { id: params.id },
                include: {
                    imagenes: {
                        orderBy: { orden: 'asc' }
                    }
                }
            });
        }, 'Error al obtener noticia');

        if (!noticia) {
            return NextResponse.json(
                { error: 'Noticia no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(noticia);
    } catch (error) {
        console.error('Error al obtener noticia:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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

        // Check if news exists
        const existingNoticia = await db.execute(async (prisma) => {
            return await prisma.noticia.findUnique({
                where: { id: params.id },
                select: { id: true, titulo: true, slug: true }
            });
        }, 'Error al verificar noticia');

        if (!existingNoticia) {
            return NextResponse.json(
                { error: 'Noticia no encontrada' },
                { status: 404 }
            );
        }

        // Generate new slug if title changed
        let slug = existingNoticia.slug;
        if (titulo !== existingNoticia.titulo) {
            const baseSlug = slugify(titulo);
            slug = await generateUniqueSlug(baseSlug, params.id);
        }

        const noticia = await db.execute(async (prisma) => {
            const updated = await prisma.noticia.update({
                where: { id: params.id },
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
                    accion: 'ACTUALIZAR_NOTICIA',
                    entidad: 'Noticia',
                    id_entidad: params.id,
                    descripcion: `Noticia '${updated.titulo}' actualizada`,
                    resultado: 'EXITOSO',
                }
            });

            return updated;
        }, 'Error al actualizar noticia');

        return NextResponse.json(noticia);
    } catch (error) {
        console.error('Error al actualizar noticia:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Check if news exists
        const existingNoticia = await db.execute(async (prisma) => {
            return await prisma.noticia.findUnique({
                where: { id: params.id },
                select: { id: true, titulo: true }
            });
        }, 'Error al verificar noticia');

        if (!existingNoticia) {
            return NextResponse.json(
                { error: 'Noticia no encontrada' },
                { status: 404 }
            );
        }

        await db.execute(async (prisma) => {
            await prisma.noticia.delete({
                where: { id: params.id }
            });

            // Registrar log de auditoría
            await prisma.logActividad.create({
                data: {
                    id_usuario: session.user.id,
                    accion: 'ELIMINAR_NOTICIA',
                    entidad: 'Noticia',
                    id_entidad: params.id,
                    descripcion: `Noticia '${existingNoticia.titulo}' eliminada permanentemente`,
                    resultado: 'EXITOSO',
                }
            });
        }, 'Error al eliminar noticia');

        return NextResponse.json({ message: 'Noticia eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar noticia:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}

async function generateUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
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
            
            if (!existing || (excludeId && existing.id === excludeId)) {
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
