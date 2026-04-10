'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { updateUsuario } from './actions';
import { Rol, TipoDocumento } from '@prisma/client';

const schema = z.object({
    primer_nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_nombre: z.string().optional().or(z.literal('')),
    primer_apellido: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_apellido: z.string().optional().or(z.literal('')),
    correo: z.string().email('Correo inválido'),
    telefono: z.string().max(20).optional().or(z.literal('')),
    rol: z.nativeEnum(Rol),
    id_programa: z.string().optional().or(z.literal('')),
    tipo_documento: z.nativeEnum(TipoDocumento),
    numero_documento: z.string().min(5, 'Mínimo 5 caracteres'),
});

type FormData = z.infer<typeof schema>;

const rolLabels: Record<Rol, string> = {
    ADMINISTRADOR: 'Administrador',
    PROFESOR: 'Profesor',
    ALIADO: 'Aliado Externo',
    ESTUDIANTE: 'Estudiante',
    AUXILIAR: 'Auxiliar',
};

const tipoDocumentoLabels: Record<TipoDocumento, string> = {
    CC: 'Cédula de Ciudadanía',
    TI: 'Tarjeta de Identidad',
    CE: 'Cédula de Extranjería',
    PASAPORTE: 'Pasaporte',
    NIT: 'NIT',
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
                tipo_documento: usuario.tipo_documento,
                numero_documento: usuario.numero_documento,
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

    const inputClass = "w-full px-3.5 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all bg-stone-50 focus:bg-white placeholder:text-stone-400";
    const errorClass = "mt-1.5 text-xs text-red-600 font-medium";
    const labelClass = "block text-xs font-bold text-stone-600 uppercase tracking-wider mb-2";
    const sectionClass = "space-y-4 p-5 bg-white rounded-xl border border-stone-200 shadow-sm";
    const sectionTitleClass = "text-xs font-bold text-stone-900 uppercase tracking-wider border-b border-stone-100 pb-2 mb-4";

    if (!usuario) return null;

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Editar Usuario" subtitle={`Modificando a ${usuario.correo}`} size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Sección: Información Personal */}
                <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Información Personal</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Primer nombre <span className="text-[#8B1E1E]">*</span></label>
                            <input {...register('primer_nombre')} className={inputClass} placeholder="Ej. Juan" />
                            {errors.primer_nombre && <p className={errorClass}>{errors.primer_nombre.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Segundo nombre</label>
                            <input {...register('segundo_nombre')} className={inputClass} placeholder="Opcional" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Primer apellido <span className="text-[#8B1E1E]">*</span></label>
                            <input {...register('primer_apellido')} className={inputClass} placeholder="Ej. Pérez" />
                            {errors.primer_apellido && <p className={errorClass}>{errors.primer_apellido.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Segundo apellido</label>
                            <input {...register('segundo_apellido')} className={inputClass} placeholder="Opcional" />
                        </div>
                    </div>
                </div>

                {/* Sección: Documento de Identidad */}
                <div className={sectionClass}>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-4">
                        <h3 className={sectionTitleClass}>Documento de Identidad</h3>
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                            ⚠️ Modificar con precaución
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Tipo de documento <span className="text-[#8B1E1E]">*</span></label>
                            <select {...register('tipo_documento')} className={inputClass}>
                                {Object.entries(tipoDocumentoLabels).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Número de documento <span className="text-[#8B1E1E]">*</span></label>
                            <input 
                                {...register('numero_documento')} 
                                className={inputClass} 
                                placeholder="Ej. 1234567890"
                                inputMode="numeric"
                                maxLength={10}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/\D/g, '').slice(0, 10);
                                }}
                            />
                            {errors.numero_documento && <p className={errorClass}>{errors.numero_documento.message}</p>}
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-stone-500 bg-stone-50 p-2 rounded border border-stone-200">
                        <span className="font-semibold">Nota:</span> Modificar el documento de identidad puede afectar la validación de certificados y registros académicos previos.
                    </p>
                </div>

                {/* Sección: Contacto */}
                <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Información de Contacto</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Correo institucional <span className="text-[#8B1E1E]">*</span></label>
                            <input 
                                {...register('correo')} 
                                type="email" 
                                className={inputClass} 
                                placeholder="usuario@ucp.edu.co"
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value && !target.value.includes('@')) {
                                        target.classList.add('border-red-500');
                                    } else {
                                        target.classList.remove('border-red-500');
                                    }
                                }}
                            />
                            <p className="text-[10px] text-stone-500 mt-1">Debe incluir el símbolo @</p>
                            {errors.correo && <p className={errorClass}>{errors.correo.message}</p>}
                        </div>
                        <div>
                            <label className={labelClass}>Teléfono</label>
                            <input 
                                {...register('telefono')} 
                                className={inputClass} 
                                placeholder="Ej. 3001234567"
                                inputMode="numeric"
                                maxLength={10}
                                onInput={(e) => {
                                    const target = e.target as HTMLInputElement;
                                    target.value = target.value.replace(/\D/g, '').slice(0, 10);
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sección: Rol y Programa */}
                <div className={sectionClass}>
                    <h3 className={sectionTitleClass}>Configuración del Sistema</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Rol del sistema <span className="text-[#8B1E1E]">*</span></label>
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
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:border-stone-300 transition-all">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2.5 text-sm font-bold text-white bg-[#8B1E1E] rounded-xl hover:bg-[#731919] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md">
                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
