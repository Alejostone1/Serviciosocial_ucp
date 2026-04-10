'use client';

import React from 'react';
import { X, Eye, Calendar, User, Share2, ExternalLink, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';

interface NoticiaPreviewModalProps {
    noticia: {
        id: string;
        titulo: string;
        resumen: string;
        contenido: string;
        autor: string;
        publicada: boolean;
        creado_en: string;
        fecha_publicacion?: string | null;
        slug?: string;
        imagenes: Array<{
            id: string;
            url_imagen: string;
            orden: number;
        }>;
    };
    isOpen: boolean;
    onClose: () => void;
    onEdit?: () => void;
}

export function NoticiaPreviewModal({ noticia, isOpen, onClose, onEdit }: NoticiaPreviewModalProps) {
    if (!isOpen) return null;

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Eye className="w-5 h-5 text-blue-700" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-900">Vista Previa</h2>
                                <p className="text-sm text-slate-600">Así verán los usuarios tu noticia</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                noticia.publicada 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                                {noticia.publicada ? 'Publicada' : 'Borrador'}
                            </div>
                            
                            {noticia.publicada && noticia.slug && (
                                <a
                                    href={`/noticias/${noticia.slug}`}
                                    target="_blank"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                    Ver Pública
                                </a>
                            )}
                            
                            {onEdit && (
                                <button
                                    onClick={onEdit}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm"
                                >
                                    <Edit className="w-4 h-4" />
                                    Editar
                                </button>
                            )}
                            
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto">
                    <div className="p-8">
                        {/* Article Header */}
                        <article className="max-w-none">
                            {/* Hero Image */}
                            {noticia.imagenes.length > 0 && (
                                <div className="aspect-video relative overflow-hidden rounded-xl mb-8">
                                    <Image
                                        src={noticia.imagenes[0].url_imagen}
                                        alt={noticia.titulo}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                </div>
                            )}

                            {/* Article Content */}
                            <div className="space-y-6">
                                {/* Category and Meta */}
                                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                                    <div className="flex items-center gap-6 text-sm text-slate-600">
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
                                    
                                    <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                                        <Share2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Title */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 leading-tight">
                                    {noticia.titulo}
                                </h1>

                                {/* Summary */}
                                {noticia.resumen && (
                                    <div className="text-lg text-slate-700 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-[#8B1E1E]">
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
                                    <div className="pt-8 border-t border-slate-200">
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
                                <div className="pt-8 border-t border-slate-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div className="text-sm text-slate-600">
                                            <p>Publicado el {format(new Date(noticia.creado_en), 'dd MMMM yyyy', { locale: es })}</p>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {noticia.publicada && noticia.slug && (
                                                <a
                                                    href={`/noticias/${noticia.slug}`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Vista Pública
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-200 px-6 py-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-amber-100 rounded-lg">
                            <Eye className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-900 text-sm">Vista Previa Administrador</h3>
                            <p className="text-xs text-amber-700 mt-1">
                                Esta es una vista previa de cómo se verá tu noticia para los usuarios finales.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
