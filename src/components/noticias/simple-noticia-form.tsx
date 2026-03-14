'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Save, ArrowLeft, Eye, EyeOff, Calendar, User, FileText, Settings, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

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

interface SimpleNoticiaFormProps {
    noticia?: Noticia;
    isEditing?: boolean;
}

export function SimpleNoticiaForm({ noticia, isEditing = false }: SimpleNoticiaFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'images' | 'settings'>('content');
    
    const [formData, setFormData] = useState({
        titulo: noticia?.titulo || '',
        resumen: noticia?.resumen || '',
        contenido: noticia?.contenido || '',
        autor: noticia?.autor || '',
        publicada: noticia?.publicada || false,
        fecha_publicacion: noticia?.fecha_publicacion 
            ? new Date(noticia.fecha_publicacion).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
                isEditing ? '✅ Noticia actualizada correctamente' : '✅ Noticia creada correctamente'
            );

            router.push('/administrador/noticias');
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            toast.error('❌ Error al guardar la noticia');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContentTab = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="titulo" className="block text-sm font-semibold text-slate-700 mb-2">
                    Título de la Noticia <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                    placeholder="Ingresa un título claro y atractivo"
                />
            </div>

            <div>
                <label htmlFor="resumen" className="block text-sm font-semibold text-slate-700 mb-2">
                    Resumen <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="resumen"
                    name="resumen"
                    value={formData.resumen}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all resize-none"
                    placeholder="Breve descripción que aparecerá en listados y vistas previas"
                />
            </div>

            <div>
                <label htmlFor="contenido" className="block text-sm font-semibold text-slate-700 mb-2">
                    Contenido Completo <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="contenido"
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleInputChange}
                    required
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all resize-none font-mono text-sm"
                    placeholder="Escribe el contenido completo de la noticia..."
                />
            </div>
        </div>
    );

    const renderImagesTab = () => (
        <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center">
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-700 mb-2">
                    Gestión de Imágenes
                </h3>
                <p className="text-slate-600 mb-4">
                    Próximamente podrás subir y gestionar imágenes para tus noticias
                </p>
                <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-slate-600">
                        Formatos soportados: PNG, JPG, GIF hasta 10MB
                    </p>
                </div>
            </div>
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            <div>
                <label htmlFor="autor" className="block text-sm font-semibold text-slate-700 mb-2">
                    Autor de la Noticia <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="autor"
                    name="autor"
                    value={formData.autor}
                    onChange={handleInputChange}
                    required
                    maxLength={150}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                    placeholder="Nombre completo del autor"
                />
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Configuración de Publicación
                </h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-200">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="publicada"
                                name="publicada"
                                checked={formData.publicada}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-[#8B1E1E] focus:ring-[#8B1E1E] border-slate-300 rounded"
                            />
                            <div>
                                <label htmlFor="publicada" className="text-sm font-medium text-slate-700 cursor-pointer">
                                    Publicar inmediatamente
                                </label>
                                <p className="text-xs text-slate-500 mt-1">
                                    {formData.publicada 
                                        ? 'La noticia será visible para todos los usuarios' 
                                        : 'La noticia se guardará como borrador'}
                                </p>
                            </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            formData.publicada 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                        }`}>
                            {formData.publicada ? 'Publicada' : 'Borrador'}
                        </div>
                    </div>

                    {formData.publicada && (
                        <div className="p-4 bg-white rounded-lg border border-blue-200">
                            <label htmlFor="fecha_publicacion" className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Fecha de Publicación
                            </label>
                            <input
                                type="date"
                                id="fecha_publicacion"
                                name="fecha_publicacion"
                                value={formData.fecha_publicacion}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/administrador/noticias"
                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {isEditing ? '✏️ Editar Noticia' : '📝 Crear Nueva Noticia'}
                            </h1>
                            <p className="text-slate-600 mt-1">
                                {isEditing ? 'Modifica los datos de la noticia existente' : 'Crea una nueva noticia institucional'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all"
                        >
                            {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            {isPreviewMode ? 'Editar' : 'Vista Previa'}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2 px-6 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {!isPreviewMode && (
                <div className="bg-white rounded-xl border border-slate-200 p-2">
                    <div className="flex gap-2">
                        {[
                            { id: 'content', label: 'Contenido', icon: FileText },
                            { id: 'images', label: 'Imágenes', icon: ImageIcon },
                            { id: 'settings', label: 'Configuración', icon: Settings },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-lg transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-[#8B1E1E] text-white'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {isPreviewMode ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8">
                        <div className="max-w-4xl mx-auto">
                            <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-200">
                                <div className="flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-blue-700" />
                                    <span className="text-sm font-semibold text-blue-900">Vista Previa del Administrador</span>
                                </div>
                            </div>
                            
                            <h1 className="text-3xl font-bold text-slate-900 mb-4">{formData.titulo}</h1>
                            <div className="flex items-center gap-4 text-sm text-slate-600 mb-6">
                                <span>Por: {formData.autor}</span>
                                <span>•</span>
                                <span>{new Date(formData.fecha_publicacion).toLocaleDateString('es-CO')}</span>
                                <span>•</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    formData.publicada 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {formData.publicada ? 'Publicado' : 'Borrador'}
                                </span>
                            </div>
                            {formData.resumen && (
                                <div className="text-lg text-slate-700 mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-[#8B1E1E]">
                                    {formData.resumen}
                                </div>
                            )}
                            <div className="prose prose-lg max-w-none">
                                <div className="whitespace-pre-wrap text-slate-800">{formData.contenido}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        {activeTab === 'content' && renderContentTab()}
                        {activeTab === 'images' && renderImagesTab()}
                        {activeTab === 'settings' && renderSettingsTab()}
                    </>
                )}
            </div>
        </form>
    );
}
