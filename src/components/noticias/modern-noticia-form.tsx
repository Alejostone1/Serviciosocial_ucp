'use client';

import React, { useState, useCallback, useRef } from 'react';
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
    Quote,
    Type,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Heading1,
    Heading2,
    Code,
    Maximize2,
    Grid3x3,
    Sparkles,
    CheckCircle,
    AlertCircle,
    Clock,
    Zap
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

interface ModernNoticiaFormProps {
    noticia?: Noticia;
    isEditing?: boolean;
}

export function ModernNoticiaForm({ noticia, isEditing = false }: ModernNoticiaFormProps) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'images' | 'settings' | 'seo'>('content');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
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

    const [wordCount, setWordCount] = useState(0);
    const [readingTime, setReadingTime] = useState(0);

    // Update word count and reading time
    React.useEffect(() => {
        const words = formData.contenido.split(/\s+/).filter(word => word.length > 0).length;
        setWordCount(words);
        setReadingTime(Math.ceil(words / 200)); // Average reading speed: 200 words per minute
    }, [formData.contenido]);

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
                    toast.success('Imagen agregada', {
                        description: `${file.name} ha sido añadida correctamente`
                    });
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Clear input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [images.length]);

    const removeImage = useCallback((id: string) => {
        setImages(prev => prev.filter(img => img.id !== id));
        toast.success('Imagen eliminada');
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
                isEditing ? '✅ Noticia actualizada correctamente' : '✅ Noticia creada correctamente',
                {
                    description: isEditing ? 'Los cambios han sido guardados' : 'La noticia está lista para publicar'
                }
            );

            router.push('/(sistema)/administrador/noticias');
        } catch (error) {
            console.error('Error al guardar noticia:', error);
            toast.error('❌ Error al guardar la noticia', {
                description: 'Por favor, intenta nuevamente'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderContentTab = () => (
        <div className="space-y-6">
            {/* Title Section */}
            <div className="group">
                <label htmlFor="titulo" className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <Type className="w-5 h-5 text-[#8B1E1E]" />
                    Título de la Noticia
                    <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                    <input
                        type="text"
                        id="titulo"
                        name="titulo"
                        value={formData.titulo}
                        onChange={handleInputChange}
                        required
                        maxLength={200}
                        className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all text-xl font-bold bg-gradient-to-r from-white to-slate-50"
                        placeholder="Ingresa un título claro y atractivo"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 bg-white px-2 py-1 rounded-full border">
                        {formData.titulo.length}/200
                    </div>
                </div>
                {formData.titulo.length > 0 && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span>Título válido</span>
                    </div>
                )}
            </div>

            {/* Summary Section */}
            <div className="group">
                <label htmlFor="resumen" className="block text-sm font-bold text-slate-800 mb-3">
                    Resumen / Descripción
                    <span className="text-red-500">*</span>
                </label>
                <textarea
                    id="resumen"
                    name="resumen"
                    value={formData.resumen}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all resize-none bg-gradient-to-r from-white to-slate-50"
                    placeholder="Breve descripción que aparecerá en listados y vistas previas"
                />
            </div>

            {/* Content Editor */}
            <div className="group">
                <div className="flex items-center justify-between mb-3">
                    <label htmlFor="contenido" className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#8B1E1E]" />
                        Contenido Completo
                        <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Pantalla completa"
                        >
                            <Maximize2 className="w-4 h-4" />
                        </button>
                        <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            {wordCount} palabras • {readingTime} min lectura
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-t-xl p-3 border border-slate-200 border-b-0">
                    <div className="flex flex-wrap gap-1">
                        <div className="flex gap-1 pr-2 border-r border-slate-300">
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('# ')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Título 1"
                            >
                                <Heading1 className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('## ')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Título 2"
                            >
                                <Heading2 className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-1 pr-2 border-r border-slate-300">
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('**texto**')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Negrita"
                            >
                                <Bold className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('*texto*')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Cursiva"
                            >
                                <Italic className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('`texto`')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Código"
                            >
                                <Code className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-1 pr-2 border-r border-slate-300">
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('\n- ')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Lista"
                            >
                                <List className="w-4 h-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('\n> ')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Cita"
                            >
                                <Quote className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => insertTextAtCursor('[texto](url)')}
                                className="p-2 text-slate-600 hover:bg-white rounded transition-colors"
                                title="Enlace"
                            >
                                <LinkIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                <textarea
                    id="contenido"
                    name="contenido"
                    value={formData.contenido}
                    onChange={handleInputChange}
                    required
                    rows={isFullscreen ? 20 : 12}
                    className={`w-full px-5 py-4 border-2 border-slate-200 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all resize-none font-mono text-sm bg-white ${
                        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
                    }`}
                    placeholder="Escribe el contenido completo de la noticia...&#10;&#10;Puedes usar formato Markdown:&#10;# Título&#10;## Subtítulo&#10;**texto en negrita**&#10;*texto en cursiva*&#10;- Elemento de lista&#10;&gt; Cita destacada&#10;`código`&#10;[texto](enlace)"
                />
                
                {isFullscreen && (
                    <div className="fixed top-4 right-4 z-50">
                        <button
                            type="button"
                            onClick={() => setIsFullscreen(false)}
                            className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
                        >
                            Salir de pantalla completa
                        </button>
                    </div>
                )}

                <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <p className="text-sm font-medium text-blue-900">Formato Markdown disponible</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-700">
                        <code className="bg-white px-2 py-1 rounded">**negrita**</code>
                        <code className="bg-white px-2 py-1 rounded">*cursiva*</code>
                        <code className="bg-white px-2 py-1 rounded"># título</code>
                        <code className="bg-white px-2 py-1 rounded">- lista</code>
                        <code className="bg-white px-2 py-1 rounded">&gt; cita</code>
                        <code className="bg-white px-2 py-1 rounded">`código`</code>
                        <code className="bg-white px-2 py-1 rounded">[link](url)</code>
                        <code className="bg-white px-2 py-1 rounded">## subtítulo</code>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderImagesTab = () => (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 hover:border-[#8B1E1E] transition-all bg-gradient-to-br from-slate-50 to-white">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    ref={fileInputRef}
                />
                <label
                    htmlFor="image-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <div className="p-4 bg-gradient-to-br from-[#8B1E1E]/10 to-[#8B1E1E]/20 rounded-full mb-4">
                        <ImageIcon className="w-8 h-8 text-[#8B1E1E]" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        Arrastra y suelta imágenes aquí
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        o haz clic para seleccionar archivos
                    </p>
                    <button
                        type="button"
                        className="px-6 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#731919] text-white rounded-xl hover:from-[#731919] hover:to-[#6a1616] transition-all transform hover:scale-105 shadow-lg"
                    >
                        <Upload className="w-4 h-4 inline mr-2" />
                        Subir Imágenes
                    </button>
                    <p className="text-xs text-slate-500 mt-4">
                        PNG, JPG, GIF, WebP hasta 10MB
                    </p>
                </label>
            </div>

            {/* Images Grid */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Grid3x3 className="w-5 h-5 text-[#8B1E1E]" />
                            Galería de Imágenes ({images.length})
                        </h3>
                        <div className="text-sm text-slate-600">
                            Arrastra para reordenar
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {images.map((image, index) => (
                            <div
                                key={image.id}
                                className="relative group border-2 border-slate-200 rounded-2xl overflow-hidden hover:border-[#8B1E1E] transition-all hover:shadow-lg"
                            >
                                <div className="aspect-video relative">
                                    <img
                                        src={image.url}
                                        alt={`Imagen ${index + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    
                                    {/* Overlay Controls */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute top-3 right-3 flex gap-2">
                                            {index > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(image.id, 'up')}
                                                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-slate-700 hover:bg-white transition-all transform hover:scale-110"
                                                    title="Mover arriba"
                                                >
                                                    <Move className="w-4 h-4" />
                                                </button>
                                            )}
                                            {index < images.length - 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => moveImage(image.id, 'down')}
                                                    className="p-2 bg-white/90 backdrop-blur rounded-lg text-slate-700 hover:bg-white transition-all transform hover:scale-110"
                                                    title="Mover abajo"
                                                >
                                                    <Move className="w-4 h-4 rotate-180" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(image.id)}
                                                className="p-2 bg-red-500/90 backdrop-blur rounded-lg text-white hover:bg-red-600 transition-all transform hover:scale-110"
                                                title="Eliminar imagen"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                        
                                        {/* Image Number Badge */}
                                        <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur rounded-full">
                                            <span className="text-sm font-semibold text-slate-700">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-4 bg-gradient-to-r from-slate-50 to-white">
                                    <p className="text-sm font-semibold text-slate-700">
                                        Imagen {index + 1}
                                    </p>
                                    {index === 0 && (
                                        <div className="flex items-center gap-2 mt-1">
                                            <Zap className="w-3 h-3 text-[#8B1E1E]" />
                                            <span className="text-xs font-medium text-[#8B1E1E]">
                                                Principal
                                            </span>
                                        </div>
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
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200">
                <label htmlFor="autor" className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#8B1E1E]" />
                    Autor de la Noticia
                    <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    id="autor"
                    name="autor"
                    value={formData.autor}
                    onChange={handleInputChange}
                    required
                    maxLength={150}
                    className="w-full px-5 py-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all bg-white"
                    placeholder="Nombre completo del autor"
                />
            </div>

            {/* Publication Settings */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Configuración de Publicación
                </h3>
                
                <div className="space-y-6">
                    <div className="bg-white rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <input
                                    type="checkbox"
                                    id="publicada"
                                    name="publicada"
                                    checked={formData.publicada}
                                    onChange={handleInputChange}
                                    className="w-6 h-6 text-[#8B1E1E] focus:ring-[#8B1E1E] border-slate-300 rounded"
                                />
                                <div>
                                    <label htmlFor="publicada" className="text-base font-semibold text-slate-700 cursor-pointer flex items-center gap-2">
                                        {formData.publicada ? (
                                            <>
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                                Publicar inmediatamente
                                            </>
                                        ) : (
                                            <>
                                                <AlertCircle className="w-5 h-5 text-amber-600" />
                                                Guardar como borrador
                                            </>
                                        )}
                                    </label>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {formData.publicada 
                                            ? 'La noticia será visible para todos los usuarios' 
                                            : 'La noticia no será visible públicamente'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                                formData.publicada 
                                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                            }`}>
                                {formData.publicada ? 'PUBLICADA' : 'BORRADOR'}
                            </div>
                        </div>
                    </div>

                    {formData.publicada && (
                        <div className="bg-white rounded-xl p-6 border border-blue-200">
                            <label htmlFor="fecha_publicacion" className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                Fecha de Publicación
                            </label>
                            <input
                                type="date"
                                id="fecha_publicacion"
                                name="fecha_publicacion"
                                value={formData.fecha_publicacion}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                            />
                            <p className="text-xs text-slate-500 mt-2 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Si no se especifica, usará la fecha actual
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Preview Info */}
            {isEditing && noticia?.slug && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
                    <h4 className="font-bold text-emerald-900 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Información Actual
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="bg-white rounded-lg p-3">
                            <span className="font-semibold text-emerald-700">ID:</span>
                            <span className="text-emerald-600 font-mono text-xs ml-2">{noticia.id}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <span className="font-semibold text-emerald-700">Slug:</span>
                            <span className="text-emerald-600 font-mono text-xs ml-2">{noticia.slug}</span>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <span className="font-semibold text-emerald-700">Estado:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                                noticia.publicada 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-amber-100 text-amber-800'
                            }`}>
                                {noticia.publicada ? 'Publicada' : 'Borrador'}
                            </span>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                            <span className="font-semibold text-emerald-700">Imágenes:</span>
                            <span className="text-emerald-600 ml-2">{images.length}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderSeoTab = () => (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    SEO y Metadatos
                </h3>
                
                <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Slug (URL)</span>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">Auto-generado</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-lg font-mono text-sm text-slate-600">
                            {formData.titulo ? formData.titulo.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : 'generado-del-titulo'}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <span className="text-sm font-semibold text-slate-700">Meta Descripción</span>
                        <div className="mt-2 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
                            {formData.resumen ? formData.resumen.substring(0, 160) + (formData.resumen.length > 160 ? '...' : '') : 'basado-en-el-resumen'}
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                            Caracteres: {formData.resumen.length}/160
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                        <span className="text-sm font-semibold text-slate-700">Estadísticas de contenido</span>
                        <div className="mt-3 grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-[#8B1E1E]">{wordCount}</div>
                                <div className="text-xs text-slate-600">Palabras</div>
                            </div>
                            <div className="text-center p-3 bg-slate-50 rounded-lg">
                                <div className="text-2xl font-bold text-blue-600">{readingTime}</div>
                                <div className="text-xs text-slate-600">Min. lectura</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/(sistema)/administrador/noticias"
                            className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
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
                            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#8B1E1E] to-[#731919] text-white rounded-xl hover:from-[#731919] hover:to-[#6a1616] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                        >
                            <Save className="w-4 h-4" />
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Guardando...
                                </>
                            ) : (
                                isEditing ? 'Actualizar' : 'Crear'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {!isPreviewMode && (
                <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-sm">
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'content', label: 'Contenido', icon: FileText },
                            { id: 'images', label: 'Imágenes', icon: ImageIcon },
                            { id: 'settings', label: 'Configuración', icon: Settings },
                            { id: 'seo', label: 'SEO', icon: Sparkles },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm rounded-xl transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-gradient-to-r from-[#8B1E1E] to-[#731919] text-white shadow-lg'
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
                    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                        <div className="max-w-4xl mx-auto">
                            {/* Admin Preview Header */}
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8 border border-blue-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <Eye className="w-6 h-6 text-blue-700" />
                                        </div>
                                        <div>
                                            <span className="text-lg font-bold text-blue-900">Vista Previa del Administrador</span>
                                            <p className="text-sm text-blue-600 mt-1">Así verán los usuarios tu noticia</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                                            formData.publicada 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {formData.publicada ? 'Publicado' : 'Borrador'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <h1 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">{formData.titulo}</h1>
                            <div className="flex items-center gap-6 text-sm text-slate-600 mb-8">
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    <span>{formData.autor}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(formData.fecha_publicacion).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{readingTime} min de lectura</span>
                                </div>
                            </div>
                            {formData.resumen && (
                                <div className="text-xl text-slate-700 mb-8 p-6 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border-l-4 border-[#8B1E1E]">
                                    {formData.resumen}
                                </div>
                            )}
                            <div className="prose prose-lg max-w-none">
                                <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">{formData.contenido}</div>
                            </div>
                            
                            {/* Preview Images */}
                            {images.length > 0 && (
                                <div className="mt-12">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Galería de Imágenes</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {images.map((image, index) => (
                                            <div key={image.id} className="aspect-video relative overflow-hidden rounded-2xl">
                                                <img
                                                    src={image.url}
                                                    alt={`Imagen ${index + 1}`}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                                />
                                                {index === 0 && (
                                                    <div className="absolute top-4 left-4 px-3 py-1 bg-[#8B1E1E] text-white text-sm rounded-full">
                                                        Imagen Principal
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
                        {activeTab === 'seo' && renderSeoTab()}
                    </>
                )}
            </div>
        </form>
    );
}
