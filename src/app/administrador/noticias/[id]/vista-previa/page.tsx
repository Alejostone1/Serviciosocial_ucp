import React from 'react';
export const dynamic = 'force-dynamic';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { redirect, notFound } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Edit, Calendar, User, Share2, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';

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
    title: 'Vista Previa de Noticia | Administrador',
};

interface VistaPreviaNoticiaPageProps {
    params: {
        id: string;
    };
}

export default async function VistaPreviaNoticiaPage({ params }: VistaPreviaNoticiaPageProps) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        redirect('/login');
    }

    const noticia = await getNoticia(params.id);

    if (!noticia) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Admin Header Bar */}
            <div className="bg-gradient-to-r from-[#8B1E1E] to-[#731919] text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/administrador/noticias"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver a Noticias
                            </Link>
                            <div className="h-6 w-px bg-white/20"></div>
                            <div>
                                <h1 className="text-lg font-semibold">Vista Previa</h1>
                                <p className="text-xs text-white/80">Así verán los usuarios tu noticia</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                noticia.publicada 
                                    ? 'bg-emerald-500 text-white' 
                                    : 'bg-amber-500 text-white'
                            }`}>
                                {noticia.publicada ? 'Publicada' : 'Borrador'}
                            </div>
                            {noticia.publicada && (
                                <Link
                                    href={`/noticias/${noticia.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ver Pública
                                </Link>
                            )}
                            <Link
                                href={`/administrador/noticias/${noticia.id}/editar`}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-[#8B1E1E] hover:bg-white/90 rounded-lg transition-colors text-sm font-medium"
                            >
                                <Edit className="w-4 h-4" />
                                Editar
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview Content */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Article Header */}
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Hero Image */}
                    {noticia.imagenes.length > 0 && (
                        <div className="aspect-video relative overflow-hidden">
                            <Image
                                src={noticia.imagenes[0].url_imagen}
                                alt={noticia.titulo}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                        </div>
                    )}

                    {/* Article Content */}
                    <div className="p-8 lg:p-12">
                        {/* Category and Meta */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{noticia.autor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>
                                        {format(new Date(noticia.fecha_publicacion || noticia.creado_en), 'dd MMMM yyyy', { locale: es })}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-slate-600 hover:text-slate-900 transition-colors">
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                            {noticia.titulo}
                        </h1>

                        {/* Summary */}
                        {noticia.resumen && (
                            <div className="text-lg text-slate-700 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-[#8B1E1E]">
                                {noticia.resumen}
                            </div>
                        )}

                        {/* Content */}
                        <div className="prose prose-lg max-w-none">
                            <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                                {noticia.contenido}
                            </div>
                        </div>

                        {/* Image Gallery */}
                        {noticia.imagenes.length > 1 && (
                            <div className="mt-12">
                                <h3 className="text-xl font-semibold text-slate-900 mb-6">Galería de Imágenes</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {noticia.imagenes.slice(1).map((imagen, index) => (
                                        <div key={imagen.id} className="aspect-video relative overflow-hidden rounded-lg">
                                            <Image
                                                src={imagen.url_imagen}
                                                alt={`Imagen ${index + 2}`}
                                                fill
                                                className="object-cover hover:scale-105 transition-transform duration-300"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Article Footer */}
                        <div className="mt-12 pt-8 border-t border-slate-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="text-sm text-slate-600">
                                    <p>Publicado el {format(new Date(noticia.creado_en), 'dd MMMM yyyy', { locale: es })}</p>
                                    {noticia.actualizado_en !== noticia.creado_en && (
                                        <p>Actualizado el {format(new Date(noticia.actualizado_en), 'dd MMMM yyyy', { locale: es })}</p>
                                    )}
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <button className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm">
                                        <Eye className="w-4 h-4" />
                                        Vista Previa
                                    </button>
                                    {noticia.publicada && (
                                        <Link
                                            href={`/noticias/${noticia.slug}`}
                                            target="_blank"
                                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors text-sm"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            Vista Pública
                                        </Link>
                                    )}
                                    <Link
                                        href={`/administrador/noticias/${noticia.id}/editar`}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar Noticia
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Admin Info Panel */}
                <div className="mt-8 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                    <div className="flex items-start gap-4">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Eye className="w-5 h-5 text-amber-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 mb-2">Modo Vista Previa Administrador</h3>
                            <p className="text-sm text-amber-700 mb-3">
                                Estás viendo cómo se verá esta noticia para los usuarios finales. 
                                Los enlaces y acciones te mantienen dentro del panel de administración.
                            </p>
                            <div className="flex flex-wrap gap-4 text-xs text-amber-600">
                                <span><strong>ID:</strong> {noticia.id}</span>
                                <span><strong>Slug:</strong> {noticia.slug}</span>
                                <span><strong>Estado:</strong> {noticia.publicada ? 'Publicada' : 'Borrador'}</span>
                                <span><strong>Imágenes:</strong> {noticia.imagenes.length}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
