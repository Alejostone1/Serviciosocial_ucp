'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { 
    Clock, 
    Upload, 
    FileText, 
    Calendar, 
    MapPin, 
    Users, 
    AlertCircle,
    CheckCircle,
    Loader2,
    Plus,
    X,
    File
} from 'lucide-react';
import { crearReporteHoras, getActividadesDisponibles, getReportesRecientes } from './actions';

// Schema de validación
const reporteSchema = z.object({
    id_actividad: z.string().min(1, 'Selecciona una actividad'),
    horas_reportadas: z.number().min(0.5, 'Mínimo 0.5 horas').max(8, 'Máximo 8 horas'),
    descripcion_trabajo: z.string().min(10, 'Mínimo 10 caracteres').max(500, 'Máximo 500 caracteres'),
    notas_estudiante: z.string().max(300, 'Máximo 300 caracteres').optional(),
});

type ReporteForm = z.infer<typeof reporteSchema>;

interface Actividad {
    id: string;
    nombre: string;
    descripcion: string;
    tipo_actividad: string;
    horas_estimadas: number;
    horas_maximas: number | null;
    fecha_inicio: string | null;
    fecha_limite: string | null;
    ubicacion: string | null;
    materiales_requeridos: string[];
    esta_activa: boolean;
    id_convocatoria: string;
    convocatoria: {
        id: string;
        titulo: string;
        descripcion: string;
        modalidad: string;
        lugar: string | null;
        categoria: {
            id: string;
            nombre: string;
            color_hex: string | null;
        } | null;
    };
}

interface ReporteReciente {
    id: string;
    horas_reportadas: number;
    descripcion_trabajo: string | null;
    estado: string;
    reportado_en: string;
    actividad: {
        nombre: string;
        fecha_limite: string | null;
    };
}

export default function ReportarHorasClient() {
    const router = useRouter();
    const { data: session } = useSession();
    const user = session?.user;
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
    const [actividadesDisponibles, setActividadesDisponibles] = useState<Actividad[]>([]);
    const [cargandoActividades, setCargandoActividades] = useState(false);
    const [mostrarSelectorActividad, setMostrarSelectorActividad] = useState(false);

    // Cargar actividades disponibles al montar
    useEffect(() => {
        const cargarActividadesDisponibles = async () => {
            try {
                setCargandoActividades(true);
                
                const response = await fetch('/api/actividades', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        convocatoria_ids: [], // Obtener todas las actividades activas
                        id_estudiante: user?.id || ''
                    }),
                });

                if (!response.ok) {
                    throw new Error('Error al cargar actividades');
                }

                const data = await response.json();
                setActividadesDisponibles(data.actividades || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setCargandoActividades(false);
            }
        };

        cargarActividadesDisponibles();
    }, [user?.id]);

    // Filtrar actividades basadas en la convocatoria seleccionada
    const actividadesFiltradas = actividadesDisponibles.filter(actividad => 
        !actividadSeleccionada || actividad.id_convocatoria === actividadSeleccionada.id_convocatoria
    );

    const seleccionarActividad = (actividad: Actividad) => {
        setActividadSeleccionada(actividad);
        setMostrarSelectorActividad(false);
        setValue('id_actividad', actividad.id);
        setValue('horas_reportadas', Math.min(actividad.horas_estimadas, actividad.horas_maximas || actividad.horas_estimadas));
    };

    const [reportesRecientes, setReportesRecientes] = useState<ReporteReciente[]>([]);
    const [archivos, setArchivos] = useState<File[]>([]);
    const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
        reset
    } = useForm<ReporteForm>({
        resolver: zodResolver(reporteSchema),
        defaultValues: {
            horas_reportadas: 1,
            descripcion_trabajo: '',
            notas_estudiante: '',
        }
    });

    const watchedActividad = watch('id_actividad');
    const watchedHoras = watch('horas_reportadas');

    // Cargar datos iniciales
    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [actividadesData, reportesData] = await Promise.all([
                    getActividadesDisponibles(),
                    getReportesRecientes()
                ]);

                // Convertir Decimal a number para las actividades
                const actividadesNormalizadas = actividadesData.map(act => ({
                    ...act,
                    descripcion: act.descripcion || '',
                    horas_estimadas: Number(act.horas_estimadas),
                    horas_maximas: act.horas_maximas ? Number(act.horas_maximas) : null,
                    fecha_inicio: act.fecha_inicio?.toString() || null,
                    fecha_limite: act.fecha_limite?.toString() || null,
                    creado_en: act.creado_en.toString(),
                    actualizado_en: act.actualizado_en.toString(),
                    convocatoria: act.convocatoria ? {
                        ...act.convocatoria,
                        modalidad: act.convocatoria.modalidad.toString(),
                    } : null,
                }));

                // Convertir Decimal a number para los reportes
                const reportesNormalizados = reportesData.map(rep => ({
                    ...rep,
                    horas_reportadas: Number(rep.horas_reportadas),
                    reportado_en: rep.reportado_en.toString(),
                    revisado_en: rep.revisado_en?.toString() || null,
                    actividad: {
                        ...rep.actividad,
                        fecha_limite: rep.actividad.fecha_limite?.toString() || null,
                    }
                }));

                setActividadesDisponibles(actividadesNormalizadas as unknown as Actividad[]);
                setReportesRecientes(reportesNormalizados);
            } catch (error) {
                console.error('Error cargando datos:', error);
                toast.error('Error al cargar las actividades disponibles');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []);

    // Actualizar actividad seleccionada
    useEffect(() => {
        if (watchedActividad) {
            const actividad = actividadesDisponibles.find(a => a.id === watchedActividad);
            setSelectedActividad(actividad || null);
            
            // Establecer horas recomendadas
            if (actividad) {
                const horasRecomendadas = Math.min(
                    Number(actividad.horas_estimadas),
                    8
                );
                setValue('horas_reportadas', horasRecomendadas);
            }
        }
    }, [watchedActividad, actividadesDisponibles, setValue]);

    // Manejo de archivos
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const validFiles = files.filter(file => {
            const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
            const isValidType = validTypes.includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

            if (!isValidType) {
                toast.error(`El archivo ${file.name} no es válido (solo PDF, JPG, PNG)`);
                return false;
            }
            if (!isValidSize) {
                toast.error(`El archivo ${file.name} es demasiado grande (máximo 5MB)`);
                return false;
            }
            return true;
        });

        setArchivos(prev => [...prev, ...validFiles]);
    };

    const removeFile = (index: number) => {
        setArchivos(prev => prev.filter((_, i) => i !== index));
    };

    // Envío del formulario
    const onSubmit = async (data: ReporteForm) => {
        if (!selectedActividad) {
            toast.error('Selecciona una actividad válida');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('id_actividad', data.id_actividad);
            formData.append('horas_reportadas', data.horas_reportadas.toString());
            formData.append('descripcion_trabajo', data.descripcion_trabajo);
            if (data.notas_estudiante) {
                formData.append('notas_estudiante', data.notas_estudiante);
            }

            // Agregar archivos
            archivos.forEach(file => {
                formData.append('archivos', file);
            });

            const resultado = await crearReporteHoras(formData);

            if (resultado.success) {
                toast.success(resultado.message);
                reset();
                setArchivos([]);
                setSelectedActividad(null);
                
                // Recargar reportes recientes
                const reportesData = await getReportesRecientes();
                const reportesNormalizados = reportesData.map(rep => ({
                    ...rep,
                    horas_reportadas: Number(rep.horas_reportadas),
                    reportado_en: rep.reportado_en.toString(),
                    revisado_en: rep.revisado_en?.toString() || null,
                    actividad: {
                        ...rep.actividad,
                        fecha_limite: rep.actividad.fecha_limite?.toString() || null,
                    }
                }));
                setReportesRecientes(reportesNormalizados);
                
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    router.push('/estudiante/mis-horas');
                }, 2000);
            }
        } catch (error) {
            console.error('Error enviando reporte:', error);
            toast.error(error instanceof Error ? error.message : 'Error al enviar el reporte');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-[#8B1E1E] mx-auto mb-4" />
                    <p className="text-gray-600">Cargando actividades disponibles...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-[#8B1E1E]/10 rounded-lg">
                                <Clock className="w-5 h-5 text-[#8B1E1E]" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Reportar Horas</h1>
                                <p className="text-sm text-gray-600">Registra las horas de servicio social realizadas</p>
                            </div>
                        </div>
                        <Link
                            href="/estudiante/mis-horas"
                            className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            ← Volver a Mis Horas
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario Principal */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Selección de Actividad */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Actividad Realizada *
                                    </label>
                                    <select
                                        {...register('id_actividad')}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
                                        disabled={submitting}
                                    >
                                        <option value="">Selecciona una actividad...</option>
                                        {actividadesDisponibles.map((actividad: Actividad) => (
                                            <option key={actividad.id} value={actividad.id}>
                                                {actividad.nombre} - {actividad.convocatoria.titulo}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.id_actividad && (
                                        <p className="mt-1 text-sm text-red-600">{errors.id_actividad.message}</p>
                                    )}
                                </div>

                                {/* Información de la Actividad Seleccionada */}
                                {selectedActividad && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-blue-900 mb-2">Información de la Actividad</h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <FileText className="w-4 h-4 text-blue-600" />
                                                <span className="text-blue-800">
                                                    <strong>Convocatoria:</strong> {selectedActividad.convocatoria.titulo}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-blue-600" />
                                                <span className="text-blue-800">
                                                    <strong>Modalidad:</strong> {selectedActividad.convocatoria.modalidad}
                                                </span>
                                            </div>
                                            {selectedActividad.convocatoria.lugar && (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4 text-blue-600" />
                                                    <span className="text-blue-800">
                                                        <strong>Lugar:</strong> {selectedActividad.convocatoria.lugar}
                                                    </span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-blue-600" />
                                                <span className="text-blue-800">
                                                    <strong>Horas estimadas:</strong> {selectedActividad.horas_estimadas}h
                                                    {selectedActividad.horas_maximas && ` (máximo ${selectedActividad.horas_maximas}h)`}
                                                </span>
                                            </div>
                                            {selectedActividad.descripcion && (
                                                <p className="text-blue-800 mt-2">
                                                    <strong>Descripción:</strong> {selectedActividad.descripcion}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Horas Reportadas */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Horas Reportadas *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="8"
                                        {...register('horas_reportadas', { valueAsNumber: true })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent"
                                        disabled={submitting}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        Mínimo 0.5 horas, máximo 8 horas por día
                                    </p>
                                    {errors.horas_reportadas && (
                                        <p className="mt-1 text-sm text-red-600">{errors.horas_reportadas.message}</p>
                                    )}
                                </div>

                                {/* Descripción del Trabajo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción del Trabajo Realizado *
                                    </label>
                                    <textarea
                                        {...register('descripcion_trabajo')}
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent resize-none"
                                        placeholder="Describe detalladamente las actividades que realizaste..."
                                        disabled={submitting}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {watch('descripcion_trabajo')?.length || 0}/500 caracteres
                                    </p>
                                    {errors.descripcion_trabajo && (
                                        <p className="mt-1 text-sm text-red-600">{errors.descripcion_trabajo.message}</p>
                                    )}
                                </div>

                                {/* Archivos Adjuntos */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Archivos de Soporte (Opcional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                        <input
                                            type="file"
                                            multiple
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="archivos"
                                            disabled={submitting}
                                        />
                                        <label
                                            htmlFor="archivos"
                                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            <Upload className="w-4 h-4" />
                                            Seleccionar Archivos
                                        </label>
                                        <p className="mt-2 text-sm text-gray-500">
                                            PDF, JPG, PNG (máximo 5MB por archivo)
                                        </p>
                                    </div>

                                    {/* Lista de archivos seleccionados */}
                                    {archivos.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            {archivos.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <File className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-700">{file.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                        disabled={submitting}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Notas Adicionales */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas Adicionales (Opcional)
                                    </label>
                                    <textarea
                                        {...register('notas_estudiante')}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1E] focus:border-transparent resize-none"
                                        placeholder="Comentarios adicionales sobre tu trabajo..."
                                        disabled={submitting}
                                    />
                                    <p className="mt-1 text-sm text-gray-500">
                                        {watch('notas_estudiante')?.length || 0}/300 caracteres
                                    </p>
                                    {errors.notas_estudiante && (
                                        <p className="mt-1 text-sm text-red-600">{errors.notas_estudiante.message}</p>
                                    )}
                                </div>

                                {/* Botones de Acción */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        disabled={submitting || !selectedActividad}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1E1E] text-white rounded-lg font-medium hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Enviar Reporte
                                            </>
                                        )}
                                    </button>
                                    <Link
                                        href="/estudiante/mis-horas"
                                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Estadísticas Rápidas */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Resumen de Reportes</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Reportes este mes</span>
                                    <span className="font-semibold text-gray-900">{reportesRecientes.length}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total horas reportadas</span>
                                    <span className="font-semibold text-gray-900">
                                        {reportesRecientes.reduce((sum, r) => sum + r.horas_reportadas, 0)}h
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Reportes Recientes */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                            <h3 className="font-semibold text-gray-900 mb-4">Reportes Recientes</h3>
                            {reportesRecientes.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    No tienes reportes recientes
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {reportesRecientes.slice(0, 5).map((reporte) => (
                                        <div key={reporte.id} className="border-b border-gray-100 pb-3 last:border-0">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {reporte.actividad.nombre}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(reporte.reportado_en).toLocaleDateString('es-PE')}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        {reporte.horas_reportadas}h
                                                    </span>
                                                    <div className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                                        reporte.estado === 'APROBADO' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : reporte.estado === 'REPORTADO'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}>
                                                        {reporte.estado}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Guía Rápida */}
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-semibold text-blue-900 mb-3">Guía de Reporte</h3>
                            <div className="space-y-2 text-sm text-blue-800">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Selecciona la actividad realizada</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Describe detalladamente tu trabajo</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Adjunta archivos de soporte si es necesario</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>Revisa antes de enviar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
