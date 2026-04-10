'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearFacultad } from './actions';

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
    onSuccess: (fac: any) => void;
}

export function NuevaFacultadModal({ isOpen, onClose, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Creando facultad...');
        try {
            const facultad = await crearFacultad({
                nombre: values.nombre,
                codigo: values.codigo || undefined,
                decano: values.decano || undefined,
                correo_contacto: values.correo_contacto || undefined,
            });
            toast.success('Facultad creada', { id: toastId, description: `'${facultad.nombre}' ha sido registrada.` });
            reset();
            onSuccess(facultad);
        } catch (e: any) {
            toast.error('Error al crear', { id: toastId, description: 'La facultad ya existe o no tienes permisos.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Nueva Facultad" subtitle="Registrar una nueva facultad académica en el sistema.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombre */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre <span className="text-red-500">*</span></label>
                    <input
                        {...register('nombre')}
                        className="w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]"
                        placeholder="Ej. Facultad de Ingeniería"
                    />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>

                {/* Código */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Código</label>
                    <input
                        {...register('codigo')}
                        className="w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8] font-mono uppercase"
                        placeholder="Ej. FING"
                    />
                    {errors.codigo && <p className="mt-1 text-xs text-red-500">{errors.codigo.message}</p>}
                </div>

                {/* Decano */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre del Decano(a)</label>
                    <input
                        {...register('decano')}
                        className="w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]"
                        placeholder="Ej. Dr. Juan Pérez"
                    />
                </div>

                {/* Correo */}
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Correo de Contacto</label>
                    <input
                        {...register('correo_contacto')}
                        type="email"
                        className="w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]"
                        placeholder="Ej. facultad@ucp.edu.co"
                    />
                    {errors.correo_contacto && <p className="mt-1 text-xs text-red-500">{errors.correo_contacto.message}</p>}
                </div>


                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button
                        type="button"
                        onClick={() => { reset(); onClose(); }}
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
                            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</>
                        ) : 'Guardar Facultad'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
