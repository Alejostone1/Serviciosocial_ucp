'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
    Save, 
    ArrowLeft, 
    Eye, 
    EyeOff, 
    Calendar, 
    User, 
    FileText, 
    Settings, 
    Image as ImageIcon,
    Upload,
    Link2,
    Cloud,
    Trash2,
    GripVertical,
    Plus,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface ProfessionalNoticiaFormProps {
    noticia?: Noticia;
    isEditing?: boolean;
}

interface NoticiaImage {
    id?: string;
    url: string;
    public_id?: string;
    type: 'url' | 'file' | 'cloudinary';
    isMain: boolean;
    file?: File;
}

export function ProfessionalNoticiaForm({ noticia, isEditing = false }: ProfessionalNoticiaFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'images' | 'settings'>('content');
    const [draggedImage, setDraggedImage] = useState<number | null>(null);
    
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

    const [images, setImages] = useState<NoticiaImage[]>(() => {
        if (noticia?.imagenes) {
            return noticia.imagenes.map((img, index) => ({
                id: img.id,
                url: img.url_imagen,
                public_id: img.public_id_cloudinary,
                type: 'cloudinary' as const,
                isMain: index === 0
            }));
        }
        return [];
    });

    const [newImageUrl, setNewImageUrl] = useState('');
    const [isUploading, setIsUploading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        
        setIsUploading(true);
        
        try {
            const file = files[0];
            
            // Validar archivo
            if (!file.type.startsWith('image/')) {
                toast.error('❌ El archivo debe ser una imagen');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) { // 10MB
                toast.error('❌ La imagen no puede superar 10MB');
                return;
            }
            
            // Crear preview temporal
            const imageUrl = URL.createObjectURL(file);
            
            const newImage: NoticiaImage = {
                url: imageUrl,
                type: 'file',
                isMain: images.length === 0,
                file
            };
            
            setImages(prev => [...prev, newImage]);
            toast.success('✅ Imagen agregada correctamente');
            
        } catch (error) {
            console.error('Error al subir imagen:', error);
            toast.error('❌ Error al subir la imagen');
        } finally {
            setIsUploading(false);
        }
    };

    const handleAddImageUrl = () => {
        if (!newImageUrl.trim()) {
            toast.error('❌ Ingresa una URL válida');
            return;
        }
        
        try {
            new URL(newImageUrl); // Validar URL
            
            const newImage: NoticiaImage = {
                url: newImageUrl.trim(),
                type: 'url',
                isMain: images.length === 0
            };
            
            setImages(prev => [...prev, newImage]);
            setNewImageUrl('');
            toast.success('✅ Imagen agregada desde URL');
            
        } catch (error) {
            toast.error('❌ La URL no es válida');
        }
    };

    const handleRemoveImage = (index: number) => {
        setImages(prev => {
            const newImages = prev.filter((_, i) => i !== index);
            // Si se elimina la imagen principal, hacer principal la primera
            if (prev[index].isMain && newImages.length > 0) {
                newImages[0].isMain = true;
            }
            return newImages;
        });
        toast.success('✅ Imagen eliminada');
    };

    const handleSetMainImage = (index: number) => {
        setImages(prev => prev.map((img, i) => ({
            ...img,
            isMain: i === index
        })));
        toast.success('✅ Imagen principal actualizada');
    };

    const handleDragStart = (index: number) => {
        setDraggedImage(index);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedImage === null) return;
        
        setImages(prev => {
            const newImages = [...prev];
            const [draggedItem] = newImages.splice(draggedImage, 1);
            newImages.splice(dropIndex, 0, draggedItem);
            return newImages;
        });
        
        setDraggedImage(null);
        toast.success('✅ Imágenes reordenadas');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Validaciones básicas
            if (!formData.titulo.trim()) {
                toast.error('❌ El título es requerido');
                return;
            }
            
            if (!formData.resumen.trim()) {
                toast.error('❌ El resumen es requerido');
                return;
            }
            
            if (!formData.contenido.trim()) {
                toast.error('❌ El contenido es requerido');
                return;
            }
            
            if (!formData.autor.trim()) {
                toast.error('❌ El autor es requerido');
                return;
            }

            // Preparar datos para enviar
            const submissionData = {
                ...formData,
                imagenes: images.map((img, index) => ({
                    url_imagen: img.url,
                    public_id_cloudinary: img.public_id || '',
                    orden: index
                }))
            };

            const url = isEditing && noticia?.id 
                ? `/api/noticias/${noticia.id}`
                : '/api/noticias';
            
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(submissionData),
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
        <div className="space-y-8">
            {/* Título */}
            <div className="space-y-2">
                <label htmlFor="titulo" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4" />
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
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all text-lg"
                    placeholder="Ingresa un título claro y atractivo"
                />
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Usa un título descriptivo y atractivo</span>
                    <span>{formData.titulo.length}/200</span>
                </div>
            </div>

            {/* Resumen */}
            <div className="space-y-2">
                <label htmlFor="resumen" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4" />
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
                <p className="text-xs text-slate-500">
                    Este resumen se mostrará en la lista de noticias y redes sociales
                </p>
            </div>

            {/* Contenido */}
            <div className="space-y-2">
                <label htmlFor="contenido" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="w-4 h-4" />
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
                <p className="text-xs text-slate-500">
                    Puedes usar formato de texto, párrafos y saltos de línea
                </p>
            </div>
        </div>
    );

    const renderImagesTab = () => (
        <div className="space-y-8">
            {/* Opciones de agregación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Subir archivo */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#8B1E1E]/50 transition-colors">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e.target.files)}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="w-full"
                    >
                        <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Subir Archivo</h3>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF hasta 10MB</p>
                        {isUploading && (
                            <p className="text-xs text-[#8B1E1E] mt-2">Subiendo...</p>
                        )}
                    </button>
                </div>

                {/* Agregar URL */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#8B1E1E]/50 transition-colors">
                    <Link2 className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">URL Externa</h3>
                    <p className="text-xs text-slate-500 mb-3">Desde cualquier sitio web</p>
                    <div className="flex gap-2">
                        <input
                            type="url"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="https://..."
                            className="flex-1 px-2 py-1 text-xs border border-slate-200 rounded"
                        />
                        <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-2 py-1 bg-[#8B1E1E] text-white text-xs rounded hover:bg-[#731919]"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    </div>
                </div>

                {/* Cloudinary */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-[#8B1E1E]/50 transition-colors opacity-50">
                    <Cloud className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Cloudinary</h3>
                    <p className="text-xs text-slate-500">Próximamente</p>
                </div>
            </div>

            {/* Lista de imágenes */}
            {images.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Imágenes Agregadas ({images.length})
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {images.map((image, index) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`relative group bg-white border-2 ${
                                    image.isMain ? 'border-[#8B1E1E] rounded-xl' : 'border-slate-200 rounded-lg'
                                } overflow-hidden transition-all hover:shadow-lg cursor-move`}
                            >
                                {/* Imagen */}
                                <div className="aspect-video relative overflow-hidden">
                                    <img
                                        src={image.url}
                                        alt={`Imagen ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    
                                    {/* Badge de principal */}
                                    {image.isMain && (
                                        <div className="absolute top-2 left-2 bg-[#8B1E1E] text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                            <Check className="w-3 h-3" />
                                            Principal
                                        </div>
                                    )}
                                    
                                    {/* Controles */}
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => handleSetMainImage(index)}
                                            disabled={image.isMain}
                                            className="p-2 bg-white rounded-full hover:bg-slate-100 transition-colors disabled:opacity-50"
                                            title="Marcar como principal"
                                        >
                                            <Check className="w-4 h-4 text-slate-700" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveImage(index)}
                                            className="p-2 bg-white rounded-full hover:bg-red-50 transition-colors"
                                            title="Eliminar imagen"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-600" />
                                        </button>
                                    </div>
                                    
                                    {/* Drag indicator */}
                                    <div className="absolute top-2 right-2 p-1 bg-white/90 rounded">
                                        <GripVertical className="w-4 h-4 text-slate-600" />
                                    </div>
                                </div>
                                
                                {/* Info */}
                                <div className="p-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-500">
                                            {image.type === 'file' ? 'Archivo local' : image.type === 'url' ? 'URL externa' : 'Cloudinary'}
                                        </span>
                                        <span className="text-xs text-slate-400">#{index + 1}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <p className="text-xs text-slate-500 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Arrastra las imágenes para reordenarlas. La primera imagen será la principal.
                    </p>
                </div>
            )}
            
            {images.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-700 mb-2">Sin imágenes aún</h3>
                    <p className="text-slate-600 mb-4">
                        Agrega imágenes usando las opciones de arriba
                    </p>
                </div>
            )}
        </div>
    );

    const renderSettingsTab = () => (
        <div className="space-y-8">
            {/* Autor */}
            <div className="space-y-2">
                <label htmlFor="autor" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <User className="w-4 h-4" />
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

            {/* Configuración de publicación */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-blue-600" />
                    Configuración de Publicación
                </h3>
                
                <div className="space-y-6">
                    {/* Estado de publicación */}
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
                                    <label htmlFor="publicada" className="text-lg font-medium text-slate-700 cursor-pointer flex items-center gap-2">
                                        {formData.publicada ? (
                                            <>
                                                <Eye className="w-5 h-5 text-green-600" />
                                                Publicar inmediatamente
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-5 h-5 text-amber-600" />
                                                Guardar como borrador
                                            </>
                                        )}
                                    </label>
                                    <p className="text-sm text-slate-500 mt-1">
                                        {formData.publicada 
                                            ? 'La noticia será visible para todos los usuarios del sitio público' 
                                            : 'La noticia se guardará pero no será visible públicamente'}
                                    </p>
                                </div>
                            </div>
                            <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                                formData.publicada 
                                    ? 'bg-green-100 text-green-800 border border-green-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                                {formData.publicada ? '📢 Publicada' : '📝 Borrador'}
                            </div>
                        </div>
                    </div>

                    {/* Fecha de publicación */}
                    {formData.publicada && (
                        <div className="bg-white rounded-xl p-6 border border-blue-200">
                            <label htmlFor="fecha_publicacion" className="block text-lg font-medium text-slate-700 mb-3 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Fecha de Publicación
                            </label>
                            <input
                                type="date"
                                id="fecha_publicacion"
                                name="fecha_publicacion"
                                value={formData.fecha_publicacion}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all text-lg"
                            />
                            <p className="text-sm text-slate-500 mt-2">
                                La noticia se mostrará a partir de esta fecha
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Vista previa del estado */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-700 mb-4">Vista previa del estado</h4>
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-slate-700">Estado actual:</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            formData.publicada 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-amber-100 text-amber-800'
                        }`}>
                            {formData.publicada ? 'Publicada' : 'Borrador'}
                        </span>
                    </div>
                    {formData.publicada && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Fecha de publicación:</span>
                            <span className="text-sm font-medium text-slate-700">
                                {format(new Date(formData.fecha_publicacion), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderPreview = () => (
        <div className="space-y-8">
            {/* Header de preview */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-center gap-3">
                    <Eye className="w-6 h-6 text-blue-700" />
                    <div>
                        <h2 className="text-xl font-bold text-blue-900">Vista Previa de la Noticia</h2>
                        <p className="text-blue-700">Así se verá tu noticia en el sitio público</p>
                    </div>
                </div>
            </div>

            {/* Preview de la tarjeta */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="aspect-video relative bg-gradient-to-br from-[#8B1E1E] to-[#C0392B]">
                    {images.length > 0 && (
                        <img
                            src={images.find(img => img.isMain)?.url || images[0].url}
                            alt={formData.titulo}
                            className="w-full h-full object-cover"
                        />
                    )}
                    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(formData.fecha_publicacion), 'dd MMM yyyy', { locale: es })}
                        </div>
                    </div>
                </div>
                
                <div className="p-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 line-clamp-2">
                        {formData.titulo || 'Título de la noticia'}
                    </h3>
                    
                    <p className="text-slate-600 leading-relaxed mb-4 line-clamp-3">
                        {formData.resumen || 'Resumen de la noticia que aparecerá en la vista previa...'}
                    </p>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <User className="w-4 h-4" />
                            <span>{formData.autor || 'Nombre del autor'}</span>
                        </div>
                        
                        <button className="inline-flex items-center gap-2 text-sm font-semibold text-[#8B1E1E] hover:text-[#731919] transition-colors">
                            Leer más
                            <ArrowLeft className="w-4 h-4 rotate-180" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview del contenido completo */}
            <div className="bg-white rounded-xl border border-slate-200 p-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-6">
                    {formData.titulo || 'Título de la noticia'}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-1.5">
                        <User className="w-4 h-4" />
                        <span>{formData.autor || 'Nombre del autor'}</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(formData.fecha_publicacion), 'dd MMM yyyy', { locale: es })}</span>
                    </div>
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
                    <div className="text-lg text-slate-700 mb-8 p-6 bg-slate-50 rounded-xl border-l-4 border-[#8B1E1E]">
                        {formData.resumen}
                    </div>
                )}
                
                <div className="prose prose-lg max-w-none">
                    <div className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                        {formData.contenido || 'El contenido completo de la noticia aparecerá aquí...'}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 p-6">
                    <div className="flex items-center gap-6">
                        <Link
                            href="/administrador/noticias"
                            className="inline-flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all font-medium"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver a Noticias
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                {isEditing ? '✏️ Editar Noticia' : '📝 Crear Nueva Noticia'}
                            </h1>
                            <p className="text-slate-600 mt-2 text-lg">
                                {isEditing ? 'Modifica los datos de la noticia existente' : 'Crea una nueva noticia institucional'}
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsPreviewMode(!isPreviewMode)}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                        >
                            {isPreviewMode ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            {isPreviewMode ? 'Editar' : 'Vista Previa'}
                        </button>
                        
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-2.5 px-6 py-2.5 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                        >
                            <Save className="w-5 h-5" />
                            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar Noticia' : 'Crear Noticia')}
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            {!isPreviewMode && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2">
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
                                    className={`flex items-center gap-3 px-5 py-3 font-semibold text-sm rounded-xl transition-all ${
                                        activeTab === tab.id
                                            ? 'bg-[#8B1E1E] text-white shadow-md'
                                            : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
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
                    renderPreview()
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
