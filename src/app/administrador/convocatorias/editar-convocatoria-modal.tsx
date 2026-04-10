'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { actualizarConvocatoria, getOpcionesConvocatoria, getConvocatoriaById } from './convocatorias-actions';
import { Calendar, MapPin, Users, Clock, Globe, FileText, Award, Target } from 'lucide-react';

const schema = z.object({
    titulo: z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
    descripcion: z.string().min(10, 'Mínimo 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
    objetivo: z.string().optional(),
    id_categoria: z.string().optional(),
    id_programa: z.string().optional(),
    modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA']),
    lugar: z.string().optional(),
    url_convocatoria_externa: z.string().url('URL inválida').optional().or(z.literal('')),
    competencias_requeridas: z.array(z.string()).min(1, 'Al menos una competencia requerida'),
    fecha_inicio: z.string().min(1, 'Fecha de inicio requerida'),
    fecha_fin: z.string().optional(),
    fecha_cierre_postulacion: z.string().optional(),
    cupo_maximo: z.number().min(1, 'Mínimo 1 participante').optional(),
    cupo_disponible: z.number().min(0, 'No puede ser negativo').optional(),
    horas_totales_ofrecidas: z.number().min(1, 'Mínimo 1 hora').optional(),
    url_banner: z.string().url('URL inválida').optional().or(z.literal('')),
    url_documento_adicional: z.string().url('URL inválida').optional().or(z.literal('')),
    requiere_entrevista: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (convocatoria: any) => void;
    convocatoria: any;
}

export function EditarConvocatoriaModal({ isOpen, onClose, onSuccess, convocatoria }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [opciones, setOpciones] = useState<any>(null);
    const [convocatoriaData, setConvocatoriaData] = useState<any>(null);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const watchModalidad = watch('modalidad');
    const watchCompetencias = watch('competencias_requeridas', []);

    const cargarOpciones = React.useCallback(async () => {
        try {
            const data = await getOpcionesConvocatoria();
            setOpciones(data);
        } catch (error) {
            toast.error('Error al cargar opciones');
        }
    }, []);

    const cargarConvocatoria = React.useCallback(async () => {
        try {
            const data = await getConvocatoriaById(convocatoria.id);
            setConvocatoriaData(data);
            
            if (data) {
                reset({
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    objetivo: data.objetivo || '',
                    id_categoria: data.id_categoria || '',
                    id_programa: data.id_programa || '',
                    modalidad: data.modalidad,
                    lugar: data.lugar || '',
                    url_convocatoria_externa: data.url_convocatoria_externa || '',
                    competencias_requeridas: data.competencias_requeridas || [],
                    fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio).toISOString().split('T')[0] : '',
                    fecha_fin: data.fecha_fin ? new Date(data.fecha_fin).toISOString().split('T')[0] : '',
                    fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion).toISOString().split('T')[0] : '',
                    cupo_maximo: data.cupo_maximo || undefined,
                    cupo_disponible: data.cupo_disponible || undefined,
                    horas_totales_ofrecidas: data.horas_totales_ofrecidas ? Number(data.horas_totales_ofrecidas) : undefined,
                    url_banner: data.url_banner || '',
                    url_documento_adicional: data.url_documento_adicional || '',
                    requiere_entrevista: data.requiere_entrevista || false,
                });
            }
        } catch (error) {
            toast.error('Error al cargar datos de la convocatoria');
        }
    }, [convocatoria, reset]);

    useEffect(() => {
        if (isOpen && !opciones) {
            cargarOpciones();
        }
    }, [isOpen, opciones, cargarOpciones]);

    useEffect(() => {
        if (convocatoria && isOpen) {
            cargarConvocatoria();
        }
    }, [convocatoria, isOpen, cargarConvocatoria]);

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Actualizando convocatoria...');

        try {
            const actualizada = await actualizarConvocatoria(convocatoria.id, {
                ...values,
                fecha_inicio: new Date(values.fecha_inicio),
                fecha_fin: values.fecha_fin ? new Date(values.fecha_fin) : undefined,
                fecha_cierre_postulacion: values.fecha_cierre_postulacion ? new Date(values.fecha_cierre_postulacion) : undefined,
                competencias_requeridas: values.competencias_requeridas,
            });

            toast.success('✅ Convocatoria actualizada', { id: toastId });
            onSuccess(actualizada);
        } catch (error: any) {
            toast.error('Error al actualizar', { 
                id: toastId, 
                description: error.message || 'Verifica los datos e intenta de nuevo.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";

    const competenciasDisponibles = [
        'Trabajo en equipo', 'Comunicación efectiva', 'Liderazgo', 'Resolución de problemas',
        'Creatividad', 'Adaptabilidad', 'Pensamiento crítico', 'Gestión del tiempo',
        'Empatía', 'Iniciativa', 'Organización', 'Aprendizaje continuo'
    ];

    if (!opciones || !convocatoriaData) {
        return null;
    }

    return (
        <FormModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Editar Convocatoria" 
            subtitle={`Modificando "${convocatoria.titulo}"`}
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Información Básica */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <Target className="w-5 h-5 text-[#8B1E1E]" />
                        Información Básica
                    </h3>
                    
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                            Título <span className="text-red-500">*</span>
                        </label>
                        <input
                            {...register('titulo')}
                            className={inputClass}
                            placeholder="Ej. Convocatoria de Servicio Social - Programa de Apoyo Comunitario"
                        />
                        {errors.titulo && <p className="mt-1 text-xs text-red-500">{errors.titulo.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                            Descripción <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('descripcion')}
                            rows={4}
                            className={`${inputClass} resize-none`}
                            placeholder="Describe detalladamente la convocatoria, objetivos y actividades a realizar..."
                        />
                        {errors.descripcion && <p className="mt-1 text-xs text-red-500">{errors.descripcion.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                            Objetivo
                        </label>
                        <textarea
                            {...register('objetivo')}
                            rows={2}
                            className={`${inputClass} resize-none`}
                            placeholder="Objetivo principal de la convocatoria..."
                        />
                    </div>
                </div>

                {/* Categorización */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#8B1E1E]" />
                        Categorización
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Categoría
                            </label>
                            <select {...register('id_categoria')} className={inputClass}>
                                <option value="">Seleccionar categoría...</option>
                                {opciones.categorias.map((cat: any) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.icono} {cat.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Programa (Opcional)
                            </label>
                            <select {...register('id_programa')} className={inputClass}>
                                <option value="">Todos los programas...</option>
                                {opciones.programas.map((prog: any) => (
                                    <option key={prog.id} value={prog.id}>
                                        {prog.nombre} ({prog.codigo})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Modalidad y Ubicación */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#8B1E1E]" />
                        Modalidad y Ubicación
                    </h3>

                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                            Modalidad <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA'] as const).map((modalidad) => (
                                <label key={modalidad} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        {...register('modalidad')}
                                        type="radio"
                                        value={modalidad}
                                        className="text-[#8B1E1E] focus:ring-[#8B1E1E]"
                                    />
                                    <span className="text-sm">{modalidad}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {(watchModalidad === 'PRESENCIAL' || watchModalidad === 'HIBRIDA') && (
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Lugar
                            </label>
                            <input
                                {...register('lugar')}
                                className={inputClass}
                                placeholder="Ej. Sala de conferencias, Edificio Principal, UCP"
                            />
                        </div>
                    )}

                    {(watchModalidad === 'VIRTUAL' || watchModalidad === 'HIBRIDA') && (
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                URL Externa
                            </label>
                            <input
                                {...register('url_convocatoria_externa')}
                                className={inputClass}
                                placeholder="https://plataforma-reuniones.com/sala-convocatoria"
                            />
                            {errors.url_convocatoria_externa && (
                                <p className="mt-1 text-xs text-red-500">{errors.url_convocatoria_externa.message}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Fechas y Plazos */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-[#8B1E1E]" />
                        Fechas y Plazos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Fecha Inicio <span className="text-red-500">*</span>
                            </label>
                            <input
                                {...register('fecha_inicio')}
                                type="date"
                                className={inputClass}
                            />
                            {errors.fecha_inicio && <p className="mt-1 text-xs text-red-500">{errors.fecha_inicio.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Fecha Fin
                            </label>
                            <input
                                {...register('fecha_fin')}
                                type="date"
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Cierre Postulaciones
                            </label>
                            <input
                                {...register('fecha_cierre_postulacion')}
                                type="date"
                                className={inputClass}
                            />
                        </div>
                    </div>
                </div>

                {/* Cupo y Requisitos */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <Users className="w-5 h-5 text-[#8B1E1E]" />
                        Cupo y Requisitos
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Cupo Máximo
                            </label>
                            <input
                                {...register('cupo_maximo', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                className={inputClass}
                                placeholder="Ej. 30"
                            />
                            {errors.cupo_maximo && <p className="mt-1 text-xs text-red-500">{errors.cupo_maximo.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Cupo Disponible
                            </label>
                            <input
                                {...register('cupo_disponible', { valueAsNumber: true })}
                                type="number"
                                min="0"
                                className={inputClass}
                                placeholder="Ej. 25"
                            />
                            {errors.cupo_disponible && <p className="mt-1 text-xs text-red-500">{errors.cupo_disponible.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                Horas Ofrecidas
                            </label>
                            <input
                                {...register('horas_totales_ofrecidas', { valueAsNumber: true })}
                                type="number"
                                min="1"
                                step="0.5"
                                className={inputClass}
                                placeholder="Ej. 80"
                            />
                            {errors.horas_totales_ofrecidas && <p className="mt-1 text-xs text-red-500">{errors.horas_totales_ofrecidas.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                            Competencias Requeridas <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {competenciasDisponibles.map((competencia) => (
                                <label key={competencia} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        value={competencia}
                                        checked={watchCompetencias.includes(competencia)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setValue('competencias_requeridas', [...watchCompetencias, competencia]);
                                            } else {
                                                setValue('competencias_requeridas', watchCompetencias.filter(c => c !== competencia));
                                            }
                                        }}
                                        className="text-[#8B1E1E] focus:ring-[#8B1E1E]"
                                    />
                                    <span className="text-xs">{competencia}</span>
                                </label>
                            ))}
                        </div>
                        {errors.competencias_requeridas && (
                            <p className="mt-1 text-xs text-red-500">{errors.competencias_requeridas.message}</p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            {...register('requiere_entrevista')}
                            type="checkbox"
                            className="text-[#8B1E1E] focus:ring-[#8B1E1E]"
                        />
                        <label className="text-sm font-semibold text-[#334155]">
                            Requiere entrevista
                        </label>
                    </div>
                </div>

                {/* Recursos Adicionales */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#1e293b] flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#8B1E1E]" />
                        Recursos Adicionales
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                URL Banner
                            </label>
                            <input
                                {...register('url_banner')}
                                className={inputClass}
                                placeholder="https://ejemplo.com/banner-convocatoria.jpg"
                            />
                            {errors.url_banner && <p className="mt-1 text-xs text-red-500">{errors.url_banner.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">
                                URL Documento Adicional
                            </label>
                            <input
                                {...register('url_documento_adicional')}
                                className={inputClass}
                                placeholder="https://ejemplo.com/terminos-condiciones.pdf"
                            />
                            {errors.url_documento_adicional && (
                                <p className="mt-1 text-xs text-red-500">{errors.url_documento_adicional.message}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-6 border-t border-[#f1f5f9]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Guardando...
                            </>
                        ) : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
