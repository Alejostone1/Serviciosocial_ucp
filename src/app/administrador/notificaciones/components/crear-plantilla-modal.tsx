'use client';

import React, { useState } from 'react';
import { X, FileText, Plus, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface CrearPlantillaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: any;
}

const tiposNotificacion = [
    'POSTULACION_RECIBIDA',
    'POSTULACION_ACEPTADA', 
    'POSTULACION_RECHAZADA',
    'REPORTE_ENVIADO',
    'REPORTE_APROBADO',
    'REPORTE_RECHAZADO',
    'REPORTE_AJUSTE',
    'CERTIFICADO_EMITIDO',
    'CONVOCATORIA_PUBLICADA',
    'SISTEMA'
];

export function CrearPlantillaModal({ isOpen, onClose, onSuccess, initialData }: CrearPlantillaModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        nombre: initialData?.nombre || '',
        tipo: (initialData?.tipo || 'SISTEMA') as typeof tiposNotificacion[number],
        asunto_correo: initialData?.asunto_correo || '',
        mensaje_plantilla: initialData?.mensaje_plantilla || '',
        mensaje_whatsapp: initialData?.mensaje_whatsapp || '',
        variables: initialData?.variables || [] as string[]
    });

    // Sincronizar cuando cambia initialData o se abre el modal
    React.useEffect(() => {
        if (isOpen) {
            setFormData({
                nombre: initialData?.nombre || '',
                tipo: (initialData?.tipo || 'SISTEMA') as any,
                asunto_correo: initialData?.asunto_correo || '',
                mensaje_plantilla: initialData?.mensaje_plantilla || '',
                mensaje_whatsapp: initialData?.mensaje_whatsapp || '',
                variables: initialData?.variables || []
            });
        }
    }, [initialData, isOpen]);

    const [nuevaVariable, setNuevaVariable] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const payload = {
                accion: initialData ? 'editar_plantilla' : 'crear_plantilla',
                id: initialData?.id,
                ...formData
            };

            const response = await fetch('/api/admin/notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success('Plantilla creada exitosamente');
                onSuccess();
                handleClose();
            } else {
                console.error('Error response:', responseData);
                toast.error(responseData.error || responseData.detalles?.[0]?.message || 'Error al crear plantilla');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al crear plantilla');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setFormData({
            nombre: '',
            tipo: 'SISTEMA',
            asunto_correo: '',
            mensaje_plantilla: '',
            mensaje_whatsapp: '',
            variables: []
        });
        setNuevaVariable('');
        onClose();
    };

    const agregarVariable = () => {
        if (nuevaVariable.trim() && !formData.variables.includes(nuevaVariable.trim())) {
            setFormData(prev => ({
                ...prev,
                variables: [...prev.variables, nuevaVariable.trim()]
            }));
            setNuevaVariable('');
        }
    };

    const eliminarVariable = (variable: string) => {
        setFormData(prev => ({
            ...prev,
            variables: prev.variables.filter((v: string) => v !== variable)
        }));
    };

    const insertarVariable = (variable: string, target: 'mensaje_plantilla' | 'mensaje_whatsapp') => {
        const textarea = document.getElementById(target) as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = formData[target];
            const newText = text.substring(0, start) + `{{${variable}}}` + text.substring(end);
            
            setFormData(prev => ({
                ...prev,
                [target]: newText
            }));
            
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
            }, 0);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {initialData ? 'Editar Plantilla' : 'Crear Plantilla'}
                        </h2>
                        <p className="text-gray-600 mt-1">
                            {initialData ? 'Modifica los campos de la plantilla' : 'Crea plantillas reutilizables para notificaciones'}
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Información Básica */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre de la Plantilla
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.nombre}
                                    onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Bienvenida Estudiante"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Notificación
                                </label>
                                <select
                                    value={formData.tipo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value as any }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    {tiposNotificacion.map(tipo => (
                                        <option key={tipo} value={tipo}>
                                            {tipo.replace(/_/g, ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Asunto de Correo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Asunto del Correo
                            </label>
                            <input
                                type="text"
                                value={formData.asunto_correo}
                                onChange={(e) => setFormData(prev => ({ ...prev, asunto_correo: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ej: ¡Bienvenido al Sistema de Servicio Social!"
                            />
                        </div>

                        {/* Variables */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Variables Dinámicas
                            </label>
                            <div className="flex gap-2 mb-3">
                                <input
                                    type="text"
                                    value={nuevaVariable}
                                    onChange={(e) => setNuevaVariable(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarVariable())}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: nombre, programa, fecha"
                                />
                                <button
                                    type="button"
                                    onClick={agregarVariable}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                </button>
                            </div>
                            
                            {formData.variables.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {formData.variables.map((variable: string) => (
                                        <span
                                            key={variable}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            {variable}
                                            <button
                                                type="button"
                                                onClick={() => eliminarVariable(variable)}
                                                className="ml-1 hover:text-blue-600"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mensaje Plantilla */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje para Correo/Notificación Interna
                            </label>
                            <textarea
                                id="mensaje_plantilla"
                                required
                                rows={8}
                                value={formData.mensaje_plantilla}
                                onChange={(e) => setFormData(prev => ({ ...prev, mensaje_plantilla: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                placeholder="Escribe el mensaje usando variables como {{nombre}}, {{programa}}, etc..."
                            />
                            {formData.variables.length > 0 && (
                                <div className="mt-2 text-xs text-gray-600">
                                    Variables disponibles: {formData.variables.map((v: string) => `{{${v}}}`).join(', ')}
                                </div>
                            )}
                        </div>

                        {/* Mensaje WhatsApp */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mensaje para WhatsApp
                            </label>
                            <textarea
                                id="mensaje_whatsapp"
                                rows={4}
                                value={formData.mensaje_whatsapp}
                                onChange={(e) => setFormData(prev => ({ ...prev, mensaje_whatsapp: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
                                placeholder="Versión corta para WhatsApp (máximo 1600 caracteres)"
                                maxLength={1600}
                            />
                            <div className="mt-1 text-xs text-gray-600">
                                {formData.mensaje_whatsapp.length}/1600 caracteres
                            </div>
                        </div>

                        {/* Vista Previa */}
                        {(formData.mensaje_plantilla || formData.mensaje_whatsapp) && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Vista Previa</h3>
                                
                                {formData.mensaje_plantilla && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Correo/Interna:</h4>
                                        <div className="bg-white p-3 rounded border text-sm whitespace-pre-wrap">
                                            {formData.mensaje_plantilla}
                                        </div>
                                    </div>
                                )}
                                
                                {formData.mensaje_whatsapp && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">WhatsApp:</h4>
                                        <div className="bg-green-50 p-3 rounded border text-sm whitespace-pre-wrap">
                                            {formData.mensaje_whatsapp}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || !formData.nombre || !formData.mensaje_plantilla}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    {initialData ? 'Guardar Cambios' : 'Crear Plantilla'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
