'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Types
interface Noticia {
    id?: string;
    titulo: string;
    slug?: string;
    resumen: string;
    contenido: string;
    autor: string;
    publicada: boolean;
    fecha_publicacion?: string | null;
    imagenes?: Array<{
        id: string;
        url_imagen: string;
        public_id_cloudinary: string;
        orden: number;
    }>;
}

interface NoticiaFormProps {
    noticia?: Noticia;
    isEditing?: boolean;
}

export function NoticiaForm({ noticia, isEditing = false }: NoticiaFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [formData, setFormData] = useState({
        titulo: noticia?.titulo || '',
        resumen: noticia?.resumen || '',
        contenido: noticia?.contenido || '',
        autor: noticia?.autor || '',
        publicada: noticia?.publicada || false,
        fecha_publicacion: noticia?.fecha_publicacion 
            ? new Date(noticia.fecha_publicacion).toISOString().split('T')[0]
            : '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const url = isEditing && noticia?.id 
                ? `/api/noticias/${noticia.id}`
                : '/api/noticias';
            
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(isEditing ? 'Error al actualizar la noticia' : 'Error al crear la noticia');
            }

            const result = await response.json();

            toast.success(
                isEditing ? 'Noticia actualizada correctamente' : 'Noticia creada correctamente'
            );

            router.push('/(sistema)/administrador/noticias');
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            toast.error('Error al guardar la noticia');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header Actions */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                <Link
                    href="/(sistema)/administrador/noticias"
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Volver a noticias
                </Link>
                
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar Noticia' : 'Crear Noticia'}
                    </button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Título */}
                    <div>
                        <label htmlFor="titulo" className="block text-sm font-medium text-slate-700 mb-2">
                            Título de la Noticia
                        </label>
                        <input
                            type="text"
                            id="titulo"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            required
                            maxLength={200}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                            placeholder="Ingresa un título claro y atractivo"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                            Máximo 200 caracteres
                        </p>
                    </div>

                    {/* Resumen */}
                    <div>
                        <label htmlFor="resumen" className="block text-sm font-medium text-slate-700 mb-2">
                            Resumen
                        </label>
                        <textarea
                            id="resumen"
                            name="resumen"
                            value={formData.resumen}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] resize-none"
                            placeholder="Breve descripción que aparecerá en listados y vistas previas"
                        />
                    </div>

                    {/* Contenido */}
                    <div>
                        <label htmlFor="contenido" className="block text-sm font-medium text-slate-700 mb-2">
                            Contenido Completo
                        </label>
                        <textarea
                            id="contenido"
                            name="contenido"
                            value={formData.contenido}
                            onChange={handleChange}
                            required
                            rows={12}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] resize-none"
                            placeholder="Escribe el contenido completo de la noticia..."
                        />
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Publicación Settings */}
                    <div className="bg-slate-50 rounded-lg p-4 space-y-4">
                        <h3 className="font-medium text-slate-900">Configuración de Publicación</h3>
                        
                        {/* Autor */}
                        <div>
                            <label htmlFor="autor" className="block text-sm font-medium text-slate-700 mb-2">
                                Autor
                            </label>
                            <input
                                type="text"
                                id="autor"
                                name="autor"
                                value={formData.autor}
                                onChange={handleChange}
                                required
                                maxLength={150}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                placeholder="Nombre del autor"
                            />
                        </div>

                        {/* Estado Publicación */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    id="publicada"
                                    name="publicada"
                                    checked={formData.publicada}
                                    onChange={handleChange}
                                    className="w-4 h-4 text-[#8B1E1E] focus:ring-[#8B1E1E] border-slate-300 rounded"
                                />
                                <span className="text-sm font-medium text-slate-700">
                                    Publicar inmediatamente
                                </span>
                            </label>
                            <p className="text-xs text-slate-500 mt-1">
                                {formData.publicada 
                                    ? 'La noticia será visible para todos los usuarios' 
                                    : 'La noticia se guardará como borrador'}
                            </p>
                        </div>

                        {/* Fecha Publicación */}
                        {formData.publicada && (
                            <div>
                                <label htmlFor="fecha_publicacion" className="block text-sm font-medium text-slate-700 mb-2">
                                    Fecha de Publicación
                                </label>
                                <input
                                    type="date"
                                    id="fecha_publicacion"
                                    name="fecha_publicacion"
                                    value={formData.fecha_publicacion}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    Si no se especifica, usará la fecha actual
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Preview Info */}
                    {isEditing && noticia?.slug && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Información Actual</h4>
                            <div className="space-y-1 text-sm">
                                <p className="text-blue-700">
                                    <span className="font-medium">Slug:</span> {noticia.slug}
                                </p>
                                <p className="text-blue-700">
                                    <span className="font-medium">Estado:</span> {noticia.publicada ? 'Publicada' : 'Borrador'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </form>
    );
}
