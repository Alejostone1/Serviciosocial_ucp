import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { NewsAdminDashboardLight } from '@/components/noticias/news-admin-dashboard-light';

async function getNoticias() {
    const noticias = await db.execute(async (prisma) => {
        return await prisma.noticia.findMany({
            include: {
                imagenes: {
                    where: { orden: 0 },
                    take: 1
                }
            },
            orderBy: {
                creado_en: 'desc'
            }
        });
    }, 'Error al obtener noticias');

    return noticias;
}

export const metadata = {
    title: 'Gestión de Noticias | Administrador',
};

export default async function NoticiasPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        redirect('/login');
    }

    const noticias = await getNoticias();

    // Convertir fechas a strings para el cliente
    const noticiasFormatted = noticias.map(noticia => ({
        ...noticia,
        creado_en: noticia.creado_en.toISOString(),
        fecha_publicacion: noticia.fecha_publicacion ? noticia.fecha_publicacion.toISOString() : null,
        actualizado_en: noticia.actualizado_en.toISOString(),
    }));

    return <NewsAdminDashboardLight noticias={noticiasFormatted} />;
}
