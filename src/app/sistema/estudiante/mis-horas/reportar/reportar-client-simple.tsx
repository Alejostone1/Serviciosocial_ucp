'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Clock, Upload, FileText, Calendar, MapPin, CheckCircle2, Loader2, X, File, ArrowLeft, Target, Info } from 'lucide-react';
import { crearReporteHoras, getActividadesDisponibles, getReportesRecientes } from './actions';

const reporteSchema = z.object({
    id_actividad: z.string().min(1, 'Selecciona una actividad'),
    horas_reportadas: z.number().min(0.5, 'Mínimo 0.5 horas').max(24, 'Máximo 24 horas por reporte'),
    descripcion_trabajo: z.string().min(10, 'Mínimo 10 caracteres').max(1000, 'Máximo 1000 caracteres'),
    fecha_actividad: z.string().optional(),
    notas_estudiante: z.string().max(300, 'Máximo 300 caracteres').optional(),
});

type ReporteForm = z.infer<typeof reporteSchema>;

interface Actividad {
    id: string;
    nombre: string;
    descripcion: string | null;
    tipo_actividad: string;
    horas_estimadas: number;
    horas_maximas: number | null;
    fecha_inicio: string | null;
    fecha_limite: string | null;
    ubicacion: string | null;
    id_convocatoria: string;
    _horasReportadasConvocatoria?: number; // 🔥 Nuevo campo para horas específicas
    convocatoria: {
        titulo: string;
        descripcion: string;
        modalidad: string;
        lugar: string | null;
        horas_totales_ofrecidas: number | null;
        categoria: {
            id: string;
            nombre: string;
            color_hex: string | null;
        } | null;
    };
}

export default function ReportarHorasClient() {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const [actividades, setActividades] = useState<Actividad[]>([]);
    const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [reportesHoy, setReportesHoy] = useState<any[]>([]);
    const [horasHoy, setHorasHoy] = useState(0);

    const form = useForm<ReporteForm>({
        resolver: zodResolver(reporteSchema),
        defaultValues: {
            id_actividad: '',
            horas_reportadas: 0,
            descripcion_trabajo: '',
            fecha_actividad: new Date().toISOString().split('T')[0],
            notas_estudiante: '',
        },
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                setIsLoading(true);
                const [actividadesData, reportesHoyData] = await Promise.all([
                    getActividadesDisponibles(),
                    getReportesRecientes(),
                ]);
                
                setActividades(actividadesData);
                setReportesHoy(reportesHoyData);
                
                const totalHoy = reportesHoyData.reduce((sum: number, reporte: any) => sum + reporte.horas_reportadas, 0);
                setHorasHoy(totalHoy);
                
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar las actividades disponibles');
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatos();
    }, []);

    const handleActividadChange = async (actividadId: string) => {
        const actividad = actividades.find(a => a.id === actividadId);
        if (actividad) {
            setSelectedActividad(actividad);
            
            try {
                const response = await fetch('/api/estudiante/horas-por-convocatoria', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ idConvocatoria: actividad.id_convocatoria })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const horasReportadasConvocatoria = data.horasReportadas || 0;
                    const horasTotalesOfrecidas = Number(actividad.convocatoria?.horas_totales_ofrecidas) || 0;
                    const horasDisponibles = horasTotalesOfrecidas - horasReportadasConvocatoria;
                    
                    const horasDefault = Math.min(
                        Math.max(0.5, Math.min(actividad.horas_estimadas, horasDisponibles)),
                        Math.min(24, Math.min(actividad.horas_estimadas, horasDisponibles))
                    );
                    
                    form.setValue('horas_reportadas', horasDefault);
                    form.setValue('id_actividad', actividadId);
                    
                    setSelectedActividad(prev => ({
                        ...prev!,
                        _horasReportadasConvocatoria: horasReportadasConvocatoria
                    }));
                }
            } catch (error) {
                console.error('Error al obtener horas de convocatoria:', error);
                const horasTotalesOfrecidas = Number(actividad.convocatoria?.horas_totales_ofrecidas) || 0;
                const horasDefault = Math.min(
                    Math.max(0.5, actividad.horas_estimadas),
                    Math.min(24, actividad.horas_estimadas)
                );
                form.setValue('horas_reportadas', horasDefault);
                form.setValue('id_actividad', actividadId);
            }
        }
    };

    const onSubmit = async (data: ReporteForm) => {
        if (!selectedActividad) {
            toast.error('Por favor selecciona una actividad');
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading('Enviando reporte de horas...');

        try {
            const formData = new FormData();
            formData.append('id_actividad', data.id_actividad);
            formData.append('horas_reportadas', data.horas_reportadas.toString());
            formData.append('descripcion_trabajo', data.descripcion_trabajo);
            formData.append('fecha_actividad', data.fecha_actividad || new Date().toISOString().split('T')[0]);
            if (data.notas_estudiante) {
                formData.append('notas_estudiante', data.notas_estudiante);
            }

            selectedFiles.forEach((file, index) => {
                formData.append(`archivos`, file);
            });

            await crearReporteHoras(formData);
            
            toast.success('✅ Reporte enviado correctamente', {
                id: toastId,
                description: 'Tu reporte ha sido enviado y está pendiente de revisión.'
            });

            setTimeout(() => {
                router.push('/sistema/estudiante/mis-horas');
            }, 2000);

        } catch (error: any) {
            console.error('Error al enviar reporte:', error);
            toast.error('Error al enviar reporte', {
                id: toastId,
                description: error.message || 'No se pudo enviar el reporte. Inténtalo de nuevo.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setSelectedFiles(prev => [...prev, ...files]);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 animate-spin text-[#8B1E1E] mx-auto mb-4" />
                            <p className="text-slate-600">Cargando actividades...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // 🔥 Si no hay actividades disponibles (todas las convocatorias completadas)
    if (actividades.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="mb-8">
                        <Link href="/sistema/estudiante/mis-horas" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Mis Horas
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 mb-2">Reportar Horas de Servicio Social</h1>
                        <p className="text-slate-600">Registra las horas que has dedicado a tu actividad de servicio social</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">¡Has completado todas tus convocatorias!</h2>
                        <p className="text-slate-600 mb-6">
                            No tienes actividades pendientes de reportar. Todas tus convocatorias han sido completadas exitosamente.
                        </p>
                        <Link
                            href="/sistema/estudiante/mis-horas"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors font-medium"
                        >
                            Ver mis horas reportadas
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <Link href="/sistema/estudiante/mis-horas" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Mis Horas
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Reportar Horas de Servicio Social</h1>
                    <p className="text-slate-600">Registra las horas que has dedicado a tu actividad de servicio social</p>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Estado Actual</h2>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Horas reportadas hoy</p>
                            <p className="text-2xl font-bold text-[#8B1E1E]">{horasHoy}</p>
                        </div>
                    </div>
                    
                    {reportesHoy.length > 0 && (
                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-sm font-medium text-slate-700 mb-2">Reportes recientes hoy:</p>
                            <div className="space-y-2">
                                {reportesHoy.map((reporte: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between text-sm bg-slate-50 rounded-lg p-3">
                                        <span className="text-slate-700">{reporte.descripcion_trabajo.substring(0, 50)}...</span>
                                        <span className="font-medium text-[#8B1E1E]">{reporte.horas_reportadas}h</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Selecciona una Actividad</h2>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Actividad *
                                </label>
                                <select
                                    {...form.register('id_actividad')}
                                    onChange={(e) => handleActividadChange(e.target.value)}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                >
                                    <option value="">Selecciona una actividad...</option>
                                    {actividades.map((actividad) => (
                                        <option key={actividad.id} value={actividad.id}>
                                            {actividad.nombre} - {actividad.convocatoria.titulo}
                                        </option>
                                    ))}
                                </select>
                                {form.formState.errors.id_actividad && (
                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.id_actividad.message}</p>
                                )}
                            </div>

                            {selectedActividad && (
                                <div className="bg-gradient-to-r from-[#8B1E1E]/5 to-[#8B1E1E]/10 border border-[#8B1E1E]/20 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <Info className="w-5 h-5 text-[#8B1E1E] mt-0.5 flex-shrink-0" />
                                        <div className="space-y-3">
                                            <h3 className="font-semibold text-slate-900">{selectedActividad.nombre}</h3>
                                            <p className="text-sm text-slate-600">{selectedActividad.descripcion}</p>
                                            
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-[#8B1E1E]" />
                                                    <span className="text-slate-700">
                                                        <strong>Horas actividad:</strong> {selectedActividad.horas_estimadas}h
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-[#8B1E1E]" />
                                                    <span className="text-slate-700">
                                                        <strong>Convocatoria:</strong> {selectedActividad.convocatoria.titulo}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-[#8B1E1E]" />
                                                    <span className="text-slate-700">
                                                        <strong>Fecha límite:</strong> {selectedActividad.fecha_limite ? new Date(selectedActividad.fecha_limite).toLocaleDateString() : 'No definida'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="bg-white/50 rounded-lg p-3 border border-[#8B1E1E]/20">
                                                <div className="text-sm font-medium text-slate-800 mb-2 flex items-center gap-2">
                                                    <Target className="w-4 h-4 text-[#8B1E1E]" />
                                                    Estado de horas en esta convocatoria
                                                </div>
                                                <div className="grid grid-cols-3 gap-4 text-xs">
                                                    <div className="text-center">
                                                        <p className="text-slate-500">Ofrecidas</p>
                                                        <p className="font-bold text-slate-900">{selectedActividad.convocatoria?.horas_totales_ofrecidas || 0}h</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-500">Reportadas</p>
                                                        <p className="font-bold text-blue-600">{selectedActividad._horasReportadasConvocatoria || 0}h</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-slate-500">Disponibles</p>
                                                        <p className="font-bold text-green-600">
                                                            {Math.max(0, (Number(selectedActividad.convocatoria?.horas_totales_ofrecidas) || 0) - (selectedActividad._horasReportadasConvocatoria || 0))}h
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mt-3">
                                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                                        {(() => {
                                                            const horasTotales = Number(selectedActividad.convocatoria?.horas_totales_ofrecidas || 0);
                                                            const horasReportadas = selectedActividad._horasReportadasConvocatoria || 0;
                                                            const porcentaje = horasTotales > 0 ? Math.min(100, (horasReportadas / horasTotales) * 100) : 0;
                                                            return (
                                                                <div 
                                                                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                                                                    style={{ width: `${porcentaje}%` }}
                                                                />
                                                            );
                                                        })()}
                                                    </div>
                                                    <p className="text-xs text-slate-600 mt-1 text-center">
                                                        {(() => {
                                                            const horasTotales = Number(selectedActividad.convocatoria?.horas_totales_ofrecidas || 0);
                                                            const horasReportadas = selectedActividad._horasReportadasConvocatoria || 0;
                                                            return horasTotales > 0 
                                                                ? `${Math.round((horasReportadas / horasTotales) * 100)}% completado`
                                                                : '0% completado';
                                                        })()}
                                                    </p>
                                                </div>

                                                <div className="mt-3 pt-3 border-t border-slate-200">
                                                    <p className="text-xs font-medium text-slate-700 mb-1">
                                                        Esta actividad ({selectedActividad.nombre}):
                                                    </p>
                                                    <div className="flex justify-between text-xs">
                                                        <span className="text-slate-600">Requeridas: {selectedActividad.horas_estimadas}h</span>
                                                        <span className="text-slate-600">Disponibles: {Math.max(0, selectedActividad.horas_estimadas - (selectedActividad._horasReportadasConvocatoria || 0))}h</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {selectedActividad.ubicacion && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-[#8B1E1E]" />
                                                    <span className="text-slate-700">
                                                        <strong>Ubicación:</strong> {selectedActividad.ubicacion}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Detalles del Reporte</h2>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Horas reportadas *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="24"
                                        {...form.register('horas_reportadas', { valueAsNumber: true })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                        placeholder="0.5"
                                    />
                                    {form.formState.errors.horas_reportadas && (
                                        <p className="text-red-500 text-sm mt-1">{form.formState.errors.horas_reportadas.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Fecha de la actividad
                                    </label>
                                    <input
                                        type="date"
                                        {...form.register('fecha_actividad')}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Descripción del trabajo realizado *
                                </label>
                                <textarea
                                    {...form.register('descripcion_trabajo')}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                    placeholder="Describe detalladamente las actividades que realizaste..."
                                />
                                {form.formState.errors.descripcion_trabajo && (
                                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.descripcion_trabajo.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Notas adicionales (opcional)
                                </label>
                                <textarea
                                    {...form.register('notas_estudiante')}
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E]"
                                    placeholder="Comentarios adicionales sobre tu experiencia..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Archivos de Soporte (Opcional)</h2>
                        
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                isDragOver
                                    ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
                                    : 'border-slate-300 hover:border-slate-400'
                            }`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 mb-2">
                                Arrastra archivos aquí o{' '}
                                <label className="text-[#8B1E1E] hover:text-[#731919] cursor-pointer">
                                    haz clic para seleccionar
                                </label>
                            </p>
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            />
                            <p className="text-xs text-slate-500">
                                PDF, JPG, PNG, DOC, DOCX (máx. 10MB por archivo)
                            </p>
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium text-slate-700">Archivos seleccionados:</p>
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center gap-2">
                                            <File className="w-4 h-4 text-slate-400" />
                                            <span className="text-sm text-slate-700">{file.name}</span>
                                            <span className="text-xs text-slate-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeFile(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/sistema/estudiante/mis-horas"
                            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors text-center font-medium"
                        >
                            Cancelar
                        </Link>
                        <button
                            type="submit"
                            disabled={isSubmitting || !selectedActividad}
                            className="px-6 py-3 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-4 h-4" />
                                    Enviar Reporte
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
