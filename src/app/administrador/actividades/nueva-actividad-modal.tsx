'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearActividad } from './actions';
import { TipoActividad } from '@prisma/client';

const tipoOptions: { value: TipoActividad; label: string }[] = [
    { value: 'GENERAL', label: 'General' },
    { value: 'CAPACITACION', label: 'Capacitación' },
    { value: 'CAMPO', label: 'Trabajo de Campo' },
    { value: 'ADMINISTRATIVA', label: 'Labor Administrativa' },
    { value: 'INVESTIGACION', label: 'Investigación' },
    { value: 'COMUNITARIA', label: 'Labor Comunitaria' },
];

const schema = z.object({
    id_convocatoria: z.string().uuid('Selecciona una convocatoria'),
    nombre: z.string().min(5, 'Mínimo 5 caracteres').max(200),
    descripcion: z.string().optional().or(z.literal('')),
    tipo_actividad: z.nativeEnum(TipoActividad),
    horas_estimadas: z.coerce.number().min(1, 'Mínimo 1 hora').max(1000),
    horas_maximas: z.coerce.number().optional().or(z.literal(0)),
    fecha_inicio: z.string().optional().or(z.literal('')),
    fecha_limite: z.string().optional().or(z.literal('')),
    ubicacion: z.string().max(200).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (act: any) => void;
    convocatorias: { id: string; titulo: string }[];
}

export function NuevaActividadModal({ isOpen, onClose, onSuccess, convocatorias }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { tipo_actividad: 'GENERAL' },
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Creando actividad...');
        try {
            const act = await crearActividad({
                id_convocatoria: values.id_convocatoria,
                nombre: values.nombre,
                descripcion: values.descripcion || null,
                tipo_actividad: values.tipo_actividad,
                horas_estimadas: values.horas_estimadas,
                horas_maximas: values.horas_maximas || null,
                fecha_inicio: values.fecha_inicio ? new Date(values.fecha_inicio) : null,
                fecha_limite: values.fecha_limite ? new Date(values.fecha_limite) : null,
                ubicacion: values.ubicacion || null,
                materiales_requeridos: [], // Valor por defecto ya que no está en el formulario
                creado_por: 'admin', // Esto debería venir del usuario autenticado
            });
            toast.success('✅ Actividad creada', { id: toastId, description: `'${act.nombre}' registrada correctamente.` });
            reset();
            onSuccess(act);
        } catch (e: any) {
            toast.error('Error al crear', { id: toastId, description: e.message ?? 'Intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Nueva Actividad" subtitle="Registra tareas o labores específicas para los estudiantes." size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Convocatoria */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Convocatoria <span className="text-red-500">*</span></label>
                    <select {...register('id_convocatoria')} className={inputClass}>
                        <option value="">— Seleccionar convocatoria en curso —</option>
                        {convocatorias.map(c => <option key={c.id} value={c.id}>{c.titulo}</option>)}
                    </select>
                    {errors.id_convocatoria && <p className="mt-1 text-xs text-red-500">{errors.id_convocatoria.message}</p>}
                </div>

                {/* Nombre */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre de la actividad <span className="text-red-500">*</span></label>
                    <input {...register('nombre')} className={inputClass} placeholder="Ej. Taller de Lectura Nivel 1" />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>

                {/* Tipo y Horas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Tipo <span className="text-red-500">*</span></label>
                        <select {...register('tipo_actividad')} className={inputClass}>
                            {tipoOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">Hrs Est. <span className="text-red-500">*</span></label>
                            <input {...register('horas_estimadas')} type="number" min={1} className={inputClass} placeholder="Ej. 10" />
                            {errors.horas_estimadas && <p className="mt-1 text-xs text-red-500">{errors.horas_estimadas.message}</p>}
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-[#334155] mb-1.5">Hrs Máx.</label>
                            <input {...register('horas_maximas')} type="number" className={inputClass} placeholder="Ej. 20" />
                        </div>
                    </div>
                </div>

                {/* Fechas */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Fecha Inicio</label>
                        <input {...register('fecha_inicio')} type="date" className={inputClass} />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Fecha Límite</label>
                        <input {...register('fecha_limite')} type="date" className={inputClass} />
                    </div>
                </div>

                {/* Ubicación */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Ubicación</label>
                    <input {...register('ubicacion')} className={inputClass} placeholder="Ej. Biblioteca Bloque C" />
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Descripción y Entregables</label>
                    <textarea {...register('descripcion')} rows={3} className={`${inputClass} resize-none`} placeholder="Describe lo que el estudiante debe hacer y/o entregar..." />
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</> : 'Crear Actividad'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
