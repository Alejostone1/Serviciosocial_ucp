'use client';

import React, { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
    Save, 
    ArrowLeft, 
    Upload, 
    X, 
    Image as ImageIcon, 
    Move, 
    Eye, 
    EyeOff,
    Calendar,
    User,
    FileText,
    Settings,
    Bold,
    Italic,
    Link as LinkIcon,
    List,
    Quote
} from 'lucide-react';
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

interface ImageFile {
    id: string;
    url: string;
    file?: File;
    orden: number;
    isNew?: boolean;
}

interface EnhancedNoticiaFormProps {
    noticia?: Noticia;
    isEditing?: boolean;
}

export function EnhancedNoticiaForm({ noticia, isEditing = false }: EnhancedNoticiaFormProps) {
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

    const [images, setImages] = useState<ImageFile[]>(() => {
        if (noticia?.imagenes) {
            return noticia.imagenes.map(img => ({
                id: img.id,
                url: img.url_imagen,
                orden: img.orden,
                isNew: false
            }));
        }
        return [];
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        files.forEach((file, index) => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const newImage: ImageFile = {
                        id: `temp-${Date.now()}-${index}`,
                        url: event.target?.result as string,
                        file,
                        orden: images.length + index,
                        isNew: true
                    };
                    setImages(prev => [...prev, newImage]);
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Clear input
        e.target.value = '';
    }, [images.length]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
    }, []);

    const moveImage = useCallback((id: string, direction: 'up' | 'down') => {
        setImages(prev => {
            const index = prev.findIndex(img => img.id === id);
            if (index === -1) return prev;
            
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            if (newIndex < 0 || newIndex >= prev.length) return prev;
            
            const newImages = [...prev];
            [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
            
            return newImages.map((img, idx) => ({ ...img, orden: idx }));
        });
    }, []);

    const insertTextAtCursor = (text: string) => {
        const textarea = document.getElementById('contenido') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const value = textarea.value;
            
            const newValue = value.substring(0, start) + text + value.substring(end);
            setFormData(prev => ({ ...prev, contenido: newValue }));
            
            // Restore cursor position
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + text.length;
                textarea.focus();
            }, 0);
        }
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
            const noticiaId = result.id;

            // Handle image uploads
            for (const image of images) {
                if (image.isNew && image.file) {
                    const formData = new FormData();
                    formData.append('file', image.file);
                    formData.append('noticiaId', noticiaId);
                    formData.append('orden', image.orden.toString());

                    try {
                        const uploadResponse = await fetch('/api/noticias/upload-image', {
                            method: 'POST',
                            body: formData,
                        });

                        if (!uploadResponse.ok) {
                            console.error('Error al subir imagen:', image.id);
                        }
                    } catch (error) {
                        console.error('Error uploading image:', error);
                    }
                }
            }

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

    const renderContentTab = () => (
        <div className="space-y-6">
            {/* Title */}
            <div className="group">
                <label htmlFor="titulo" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Título de la Noticia
                </label>
                <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    maxLength={200}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all text-lg font-medium"
                    placeholder="Ingresa un título claro y atractivo"
                />
                <div className="flex justify-between mt-1">
                    <p className="text-xs text-slate-500">
                        Máximo 200 caracteres
                    </p>
                    <p className="text-xs text-slate-500">
                        {formData.titulo.length}/200
                    </p>
                </div>
            </div>

            {/* Summary */}
            <div className="group">
                <label htmlFor="resumen" className="block text-sm font-semibold text-slate-700 mb-2">
                    Resumen
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

            {/* Content Editor */}
            <div className="group">
                <div className="flex items-center justify-between mb-2">
                    <label htmlFor="contenido" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Contenido Completo
                    </label>
                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => insertTextAtCursor('**texto en negrita**')}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Negrita"
                        >
                            <Bold className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTextAtCursor('*texto en cursiva*')}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Cursiva"
                        >
                            <Italic className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTextAtCursor('\n- Elemento de lista')}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Lista"
                        >
                            <List className="w-4 h-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => insertTextAtCursor('\n> Cita destacada')}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                            title="Cita"
                        >
                            <Quote className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                <textarea
                    id="contenido"
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleInputChange}
                    required
                    rows={12}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all resize-none font-mono text-sm"
                    placeholder="Escribe el contenido completo de la noticia...&#10;&#10;Puedes usar formato Markdown:&#10;**texto en negrita**&#10;*texto en cursiva*&#10;- Elemento de lista&#10;> Cita destacada"
                />
                <div className="mt-2 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600 font-medium">Formato Markdown disponible:</p>
                    <p className="text-xs text-slate-500 mt-1">**negrita** *cursiva* -lista &gt;cita</p>
                </div>
            </div>
        </div>
    );

    const renderImagesTab = () => (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 hover:border-[#8B1E1E] transition-colors">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                />
                <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <ImageIcon className="w-12 h-12 text-slate-400 mb-4" />
                    <p className="text-lg font-medium text-slate-700 mb-2">
                        Arrastra y suelta imágenes aquí
                    </p>
                    <p className="text-sm text-slate-500 mb-4">
                        o haz clic para seleccionar
                    </p>
                    <button
                        type="button"
                        className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
                    >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Subir Imágenes
                    </button>
                    <p className="text-xs text-slate-500 mt-4">
                        PNG, JPG, GIF hasta 10MB
                    </p>
                </label>
            </div>

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Imágenes Cargadas ({images.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative group border-2 border-slate-200 rounded-xl overflow-hidden hover:border-[#8B1E1E] transition-all"
                            >
                                <div className="aspect-square relative">
                                    <Image
                                        src={image.url}
                                        alt={`Imagen ${index + 1}`}
                                        fill
                                        unoptimized
                                        className="object-cover"
                                    />
                                    
                                    {/* Overlay Controls */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute top-2 right-2 flex gap-1">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(image.id, 'up')}
                                                    className="p-2 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-colors"
                                                    title="Mover arriba"
                                                >
                                                    <Move className="w-4 h-4" />
                                                </button>
                                            )}
                                            {index < images.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(image.id, 'down')}
                                                    className="p-2 bg-white/90 rounded-lg text-slate-700 hover:bg-white transition-colors"
                                                    title="Mover abajo"
                                                >
                                                    <Move className="w-4 h-4 rotate-180" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(image.id)}
                                                className="p-2 bg-red-500/90 rounded-lg text-white hover:bg-red-600 transition-colors"
                                                title="Eliminar imagen"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-gradient-to-r from-slate-50 to-slate-100">
                                    <p className="text-sm font-medium text-slate-700">
                                        Imagen {index + 1}
                                    </p>
                                    {index === 0 && (
                                        <span className="inline-block px-2 py-1 bg-[#8B1E1E] text-white text-xs rounded-full mt-1">
                                            Principal
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-6">
            {/* Author */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                <label htmlFor="autor" className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Autor de la Noticia
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

            {/* Publication Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
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
                            <p className="text-xs text-slate-500 mt-1">
                                Si no se especifica, usará la fecha actual
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Info */}
            {isEditing && noticia?.slug && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                    <h4 className="font-semibold text-emerald-900 mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Información Actual
                    </h4>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="font-medium text-emerald-700">Slug:</span>
                            <span className="text-emerald-600 font-mono text-xs">{noticia.slug}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-emerald-700">Estado:</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                noticia.publicada 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                                {noticia.publicada ? 'Publicada' : 'Borrador'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="font-medium text-emerald-700">Imágenes:</span>
                            <span className="text-emerald-600">{images.length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-4">
                    <Link
                        href="/(sistema)/administrador/noticias"
                        className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            {isEditing ? 'Editar Noticia' : 'Crear Nueva Noticia'}
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
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        {isPreviewMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {isPreviewMode ? 'Editar' : 'Vista Previa'}
                    </button>
                    
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            {!isPreviewMode && (
                <div className="flex border-b border-slate-200">
                    <button
                        type="button"
                        onClick={() => setActiveTab('content')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'content'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Contenido
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('images')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'images'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Imágenes
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('settings')}
                        className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                            activeTab === 'settings'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Configuración
                    </button>
                </div>
            )}

            {/* Tab Content */}
            <div className="min-h-[600px]">
                {isPreviewMode ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-8">
                        <div className="max-w-4xl mx-auto">
                            {/* Admin Preview Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="w-5 h-5 text-blue-700" />
                                        <span className="text-sm font-semibold text-blue-900">Vista Previa del Administrador</span>
                                    </div>
                                    <span className="text-xs text-blue-600">Así verán los usuarios tu noticia</span>
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
                            
                            {/* Preview Images */}
                            {images.length > 0 && (
                                <div className="mt-8">
                                    <h3 className="text-xl font-semibold text-slate-900 mb-4">Imágenes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {images.map((image, index) => (
                                            <div key={image.id} className="aspect-video relative overflow-hidden rounded-lg">
                                                <Image
                                                    src={image.url}
                                                    alt={`Imagen ${index + 1}`}
                                                    fill
                                                    unoptimized
                                                    className="object-cover"
                                                />
                                                {index === 0 && (
                                                    <div className="absolute top-2 left-2 px-2 py-1 bg-[#8B1E1E] text-white text-xs rounded-full">
                                                        Principal
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
