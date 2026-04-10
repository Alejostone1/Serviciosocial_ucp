'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { actualizarFacultad } from './actions';

const schema = z.object({
    nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100),
    codigo: z.string().max(20).optional().or(z.literal('')),
    decano: z.string().max(100).optional().or(z.literal('')),
    correo_contacto: z.string().email('Correo inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (facultad: any) => void;
    facultad: any;
}

export function EditarFacultadModal({ isOpen, onClose, onSuccess, facultad }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (facultad && isOpen) {
            reset({
                nombre: facultad.nombre,
                codigo: facultad.codigo || '',
                decano: facultad.decano || '',
                correo_contacto: facultad.correo_contacto || '',
            });
        }
    }, [facultad, isOpen, reset]);

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Actualizando facultad...');
        try {
            const updated = await actualizarFacultad(facultad.id, {
                nombre: values.nombre,
                codigo: values.codigo || undefined,
                decano: values.decano || undefined,
                correo_contacto: values.correo_contacto || undefined,
            });
            toast.success('Facultad actualizada', { id: toastId });
            onSuccess(updated);
        } catch (e: any) {
            toast.error('Error al actualizar', { id: toastId, description: 'Verifica los datos e intenta de nuevo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";

    if (!facultad) return null;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Editar Facultad" subtitle={`Modificando "${facultad.nombre}"`}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre <span className="text-red-500">*</span></label>
                    <input {...register('nombre')} className={inputClass} placeholder="Ej. Facultad de Ingeniería" />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Código</label>
                    <input {...register('codigo')} className={`${inputClass} font-mono uppercase`} placeholder="Ej. FING" />
                    {errors.codigo && <p className="mt-1 text-xs text-red-500">{errors.codigo.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Decano/a</label>
                    <input {...register('decano')} className={inputClass} placeholder="Nombre del decano o decana" />
                    {errors.decano && <p className="mt-1 text-xs text-red-500">{errors.decano.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Correo de Contacto</label>
                    <input
                        {...register('correo_contacto')}
                        type="email"
                        className={`${inputClass} lowercase`}
                        placeholder="facultad@universidad.edu"
                    />
                    {errors.correo_contacto && <p className="mt-1 text-xs text-red-500">{errors.correo_contacto.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
