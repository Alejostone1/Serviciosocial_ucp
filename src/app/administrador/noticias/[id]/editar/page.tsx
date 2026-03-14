import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { ProfessionalNoticiaForm } from '@/components/noticias/professional-noticia-form';

async function getNoticia(id: string) {
    try {
        const noticia = await db.execute(async (prisma) => {
            return await prisma.noticia.findUnique({
                where: { id },
                include: {
                    imagenes: {
                        orderBy: { orden: 'asc' }
                    }
                }
            });
        }, 'Error al obtener noticia');

        if (!noticia) {
            return null;
        }

        // Convert dates to strings for the form
        return {
            ...noticia,
            fecha_publicacion: noticia.fecha_publicacion ? noticia.fecha_publicacion.toISOString() : null,
            creado_en: noticia.creado_en.toISOString(),
            actualizado_en: noticia.actualizado_en.toISOString(),
        };
    } catch (error) {
        console.error('Error al obtener noticia:', error);
        return null;
    }
}

export const metadata = {
    title: 'Editar Noticia | Administrador',
};

interface EditNoticiaPageProps {
    params: {
        id: string;
    };
}

export default async function EditNoticiaPage({ params }: EditNoticiaPageProps) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        redirect('/login');
    }

    const noticia = await getNoticia(params.id);

    if (!noticia) {
        notFound();
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Editar Noticia</h1>
                    <p className="text-slate-600 mt-1">Modifica los datos de la noticia existente</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <ProfessionalNoticiaForm 
                    noticia={noticia}
                    isEditing={true}
                />
            </div>
        </div>
    );
}
