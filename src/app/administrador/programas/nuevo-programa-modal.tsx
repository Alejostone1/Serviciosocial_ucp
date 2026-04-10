'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearPrograma } from './actions';
import { NivelFormacion } from '@prisma/client';

const nivelOptions: { value: NivelFormacion; label: string }[] = [
    { value: 'TECNICO', label: 'Técnico' },
    { value: 'TECNOLOGICO', label: 'Tecnólogo' },
    { value: 'PREGRADO', label: 'Pregrado' },
    { value: 'ESPECIALIZACION', label: 'Especialización' },
    { value: 'MAESTRIA', label: 'Maestría' },
    { value: 'DOCTORADO', label: 'Doctorado' },
];

const schema = z.object({
    nombre: z.string().min(3, 'Mínimo 3 caracteres').max(150),
    codigo: z.string().max(20).optional().or(z.literal('')),
    id_facultad: z.string().uuid('Selecciona una facultad'),
    nivel_formacion: z.nativeEnum(NivelFormacion),
    horas_requeridas: z.coerce.number().min(1, 'Mínimo 1 hora').max(9999),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (prog: any) => void;
    facultades: { id: string; nombre: string }[];
}

export function NuevoProgramaModal({ isOpen, onClose, onSuccess, facultades }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { nivel_formacion: 'PREGRADO', horas_requeridas: 120 },
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Creando programa...');
        try {
            const prog = await crearPrograma({
                nombre: values.nombre,
                id_facultad: values.id_facultad,
                nivel_formacion: values.nivel_formacion,
                horas_requeridas: values.horas_requeridas,
                codigo: values.codigo || undefined,
            });
            toast.success('✅ Programa creado', { id: toastId, description: `${prog.nombre} ha sido registrado.` });
            reset();
            onSuccess(prog);
        } catch (e: any) {
            toast.error('Error al crear', { id: toastId, description: e.message ?? 'Intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Nuevo Programa Académico" subtitle="Registrar un programa en el sistema asociándolo a una facultad.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre del programa <span className="text-red-500">*</span></label>
                    <input {...register('nombre')} className={inputClass} placeholder="Ej. Ingeniería de Sistemas" />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Código</label>
                        <input {...register('codigo')} className={`${inputClass} font-mono`} placeholder="Ej. IS-001" />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-[#334155] mb-1.5">Horas requeridas <span className="text-red-500">*</span></label>
                        <input {...register('horas_requeridas')} type="number" min={1} max={9999} className={inputClass} placeholder="120" />
                        {errors.horas_requeridas && <p className="mt-1 text-xs text-red-500">{errors.horas_requeridas.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Facultad <span className="text-red-500">*</span></label>
                    <select {...register('id_facultad')} className={inputClass}>
                        <option value="">— Seleccionar facultad —</option>
                        {facultades.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
                    </select>
                    {errors.id_facultad && <p className="mt-1 text-xs text-red-500">{errors.id_facultad.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nivel de formación <span className="text-red-500">*</span></label>
                    <select {...register('nivel_formacion')} className={inputClass}>
                        {nivelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Guardar Programa'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
