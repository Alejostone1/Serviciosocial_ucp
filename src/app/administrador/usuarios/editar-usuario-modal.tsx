'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { updateUsuario } from './actions';
import { Rol } from '@prisma/client';

const schema = z.object({
    primer_nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_nombre: z.string().optional().or(z.literal('')),
    primer_apellido: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_apellido: z.string().optional().or(z.literal('')),
    correo: z.string().email('Correo inválido'),
    telefono: z.string().max(20).optional().or(z.literal('')),
    rol: z.nativeEnum(Rol),
    id_programa: z.string().optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

const rolLabels: Record<Rol, string> = {
    ADMINISTRADOR: 'Administrador',
    PROFESOR: 'Profesor',
    ALIADO: 'Aliado Externo',
    ESTUDIANTE: 'Estudiante',
    AUXILIAR: 'Auxiliar',
};

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedUser: any) => void;
    programas: { id: string; nombre: string; nivel_formacion: string }[];
    usuario: any;
}

export function EditarUsuarioModal({ isOpen, onClose, onSuccess, programas, usuario }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    useEffect(() => {
        if (usuario && isOpen) {
            reset({
                primer_nombre: usuario.primer_nombre,
                segundo_nombre: usuario.segundo_nombre || '',
                primer_apellido: usuario.primer_apellido,
                segundo_apellido: usuario.segundo_apellido || '',
                correo: usuario.correo,
                telefono: usuario.telefono || '',
                rol: usuario.rol,
                id_programa: usuario.id_programa || (usuario.programa?.id) || '',
            });
        }
    }, [usuario, isOpen, reset]);

    const rolValue = watch('rol');

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Actualizando usuario...');
        try {
            const updated = await updateUsuario(usuario.id, {
                ...values,
                id_programa: values.rol === 'ESTUDIANTE' ? values.id_programa : undefined,
            });
            toast.success('Usuario actualizado', { id: toastId, description: 'Los datos se guardaron correctamente.' });
            onSuccess(updated);
        } catch (e: any) {
            toast.error('Error al actualizar', { id: toastId, description: e.message ?? 'Verifica los datos ingresados.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";
    const errorClass = "mt-1 text-xs text-red-500";
    const labelClass = "block text-sm font-semibold text-[#334155] mb-1.5";

    if (!usuario) return null;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Editar Usuario" subtitle={`Modificando a ${usuario.correo}`} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primer nombre <span className="text-red-500">*</span></label>
                        <input {...register('primer_nombre')} className={inputClass} />
                        {errors.primer_nombre && <p className={errorClass}>{errors.primer_nombre.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Segundo nombre</label>
                        <input {...register('segundo_nombre')} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primer apellido <span className="text-red-500">*</span></label>
                        <input {...register('primer_apellido')} className={inputClass} />
                        {errors.primer_apellido && <p className={errorClass}>{errors.primer_apellido.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Segundo apellido</label>
                        <input {...register('segundo_apellido')} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Correo institucional <span className="text-red-500">*</span></label>
                        <input {...register('correo')} type="email" className={inputClass} />
                        {errors.correo && <p className={errorClass}>{errors.correo.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Teléfono</label>
                        <input {...register('telefono')} className={inputClass} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Rol del sistema <span className="text-red-500">*</span></label>
                        <select {...register('rol')} className={inputClass}>
                            {Object.entries(rolLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {rolValue === 'ESTUDIANTE' && (
                        <div>
                            <label className={labelClass}>Programa académico</label>
                            <select {...register('id_programa')} className={inputClass}>
                                <option value="">— Sin programa —</option>
                                {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                        </div>
                    )}
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
