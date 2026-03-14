'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { actualizarPrograma } from './actions';
import { NivelFormacion } from '@prisma/client';

const schema = z.object({
    nombre: z.string().min(3, 'Mínimo 3 caracteres').max(150),
    codigo: z.string().max(20).optional().or(z.literal('')),
    id_facultad: z.string().min(1, 'Seleccione una facultad'),
    nivel_formacion: z.nativeEnum(NivelFormacion),
    horas_requeridas: z.number().min(1, 'Mínimo 1 hora').max(999, 'Máximo 999 horas'),
});

type FormData = z.infer<typeof schema>;

const nivelLabels: Record<NivelFormacion, string> = {
    PREGRADO: 'Pregrado',
    POSGRADO: 'Posgrado',
    ESPECIALIZACION: 'Especialización',
    MAESTRIA: 'Maestría',
    DOCTORADO: 'Doctorado',
    TECNICO: 'Técnico',
    TECNOLOGICO: 'Tecnológico',
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (programa: any) => void;
    programa: {
        id: string;
        nombre: string;
        codigo: string | null;
        id_facultad: string;
        nivel_formacion: NivelFormacion;
        horas_requeridas: number;
    };
    facultades: { id: string; nombre: string }[];
}

export function EditarProgramaModal({ isOpen, onClose, onSuccess, programa, facultades }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (isOpen && programa) {
            reset({
                nombre: programa.nombre,
                codigo: programa.codigo || '',
                id_facultad: programa.id_facultad,
                nivel_formacion: programa.nivel_formacion,
                horas_requeridas: Number(programa.horas_requeridas),
            });
        }
    }, [isOpen, programa, reset]);

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Actualizando programa...');
        try {
            const programaActualizado = await actualizarPrograma(programa.id, {
                nombre: values.nombre,
                codigo: values.codigo || undefined,
                id_facultad: values.id_facultad,
                nivel_formacion: values.nivel_formacion,
                horas_requeridas: values.horas_requeridas,
            });
            toast.success('✅ Programa actualizado', { 
                id: toastId, 
                description: `'${programaActualizado.nombre}' ha sido actualizado correctamente.` 
            });
            onSuccess(programaActualizado);
            onClose();
        } catch (e: any) {
            toast.error('Error al actualizar', { 
                id: toastId, 
                description: e.message || 'No se pudo actualizar el programa.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";
    const errorClass = "mt-1 text-xs text-red-500";
    const labelClass = "block text-sm font-semibold text-[#334155] mb-1.5";

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Editar Programa" subtitle="Modifica la información del programa académico.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre */}
                <div>
                    <label className={labelClass}>Nombre del Programa <span className="text-red-500">*</span></label>
                    <input
                        {...register('nombre')}
                        className={inputClass}
                        placeholder="Ej. Ingeniería de Sistemas"
                    />
                    {errors.nombre && <p className={errorClass}>{errors.nombre.message}</p>}
                </div>

                {/* Código */}
                <div>
                    <label className={labelClass}>Código del Programa</label>
                    <input
                        {...register('codigo')}
                        className={inputClass}
                        placeholder="Ej. IS"
                    />
                    {errors.codigo && <p className={errorClass}>{errors.codigo.message}</p>}
                </div>

                {/* Facultad y Nivel */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Facultad <span className="text-red-500">*</span></label>
                        <select {...register('id_facultad')} className={inputClass}>
                            <option value="">Seleccione una facultad</option>
                            {facultades.map(f => (
                                <option key={f.id} value={f.id}>{f.nombre}</option>
                            ))}
                        </select>
                        {errors.id_facultad && <p className={errorClass}>{errors.id_facultad.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Nivel de Formación <span className="text-red-500">*</span></label>
                        <select {...register('nivel_formacion')} className={inputClass}>
                            {Object.entries(nivelLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        {errors.nivel_formacion && <p className={errorClass}>{errors.nivel_formacion.message}</p>}
                    </div>
                </div>

                {/* Horas Requeridas */}
                <div>
                    <label className={labelClass}>Horas Requeridas <span className="text-red-500">*</span></label>
                    <input
                        {...register('horas_requeridas', { valueAsNumber: true })}
                        type="number"
                        min="1"
                        max="999"
                        className={inputClass}
                        placeholder="Ej. 120"
                    />
                    {errors.horas_requeridas && <p className={errorClass}>{errors.horas_requeridas.message}</p>}
                    <p className="text-[11px] text-[#94a3b8] mt-1">Número de horas de servicio social requeridas para completar el programa.</p>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
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
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Actualizando...</>
                        ) : 'Actualizar Programa'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
