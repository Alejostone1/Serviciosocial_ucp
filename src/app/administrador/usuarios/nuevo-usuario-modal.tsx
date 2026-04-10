'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearUsuario } from './crear-usuario-actions';
import { TipoDocumento } from '@prisma/client';

// Enum temporal hasta que se genere la migración
enum Rol {
  ADMINISTRADOR = 'ADMINISTRADOR',
  PROFESOR = 'PROFESOR',
  ALIADO = 'ALIADO',
  AUXILIAR = 'AUXILIAR',
  ESTUDIANTE = 'ESTUDIANTE',
}
import { Eye, EyeOff } from 'lucide-react';

const schema = z.object({
    primer_nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_nombre: z.string().optional().or(z.literal('')),
    primer_apellido: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_apellido: z.string().optional().or(z.literal('')),
    tipo_documento: z.nativeEnum(TipoDocumento),
    numero_documento: z.string()
        .min(5, 'Mínimo 5 dígitos')
        .max(10, 'Máximo 10 dígitos')
        .regex(/^\d+$/, 'Solo se permiten números'),
    correo: z.string().email('Correo inválido'),
    telefono: z.string()
        .max(10, 'Máximo 10 dígitos')
        .regex(/^\d*$/, 'Solo se permiten números')
        .optional()
        .or(z.literal('')),
    rol: z.nativeEnum(Rol),
    id_programa: z.string().optional().or(z.literal('')),
    contrasena: z.string().min(8, 'Mínimo 8 caracteres'),
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
    onSuccess: (user: any) => void;
    programas: { id: string; nombre: string; nivel_formacion: string }[];
}

export function NuevoUsuarioModal({ isOpen, onClose, onSuccess, programas }: Props) {
    const [isLoading, setIsLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { tipo_documento: 'CC', rol: Rol.ESTUDIANTE },
    });

    const rolValue = watch('rol');

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Creando usuario...');
        try {
            const result = await crearUsuario({
                primer_nombre: values.primer_nombre,
                segundo_nombre: values.segundo_nombre || undefined,
                primer_apellido: values.primer_apellido,
                segundo_apellido: values.segundo_apellido || undefined,
                correo: values.correo,
                numero_documento: values.numero_documento,
                tipo_documento: values.tipo_documento,
                rol: values.rol,
                id_programa: values.id_programa || undefined,
                telefono: values.telefono || undefined,
                contrasena: values.contrasena,
            });
            
            // Verificar si hubo error de duplicado
            if (!result.success) {
                // Mostrar alerta amigable en lugar de error
                toast.message('⚠️ Usuario duplicado', { 
                    id: toastId, 
                    description: result.message,
                    duration: 5000
                });
                return;
            }
            
            toast.success('✅ Usuario creado', { 
                id: toastId, 
                description: `${result.usuario?.correo} registrado como ${result.usuario?.rol}. Se solicitará cambio de contraseña en el primer inicio.` 
            });
            reset();
            onSuccess(result.usuario);
        } catch (e: any) {
            toast.error('Error al crear', { id: toastId, description: e.message ?? 'Ocurrió un error inesperado.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";
    const errorClass = "mt-1 text-xs text-red-500";
    const labelClass = "block text-sm font-semibold text-[#334155] mb-1.5";

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Crear Nuevo Usuario" subtitle="El usuario recibirá su contraseña temporal y deberá cambiarla en su primer ingreso." size="lg">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Nombres */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primer nombre <span className="text-red-500">*</span></label>
                        <input {...register('primer_nombre')} className={inputClass} placeholder="Ej. Carlos" />
                        {errors.primer_nombre && <p className={errorClass}>{errors.primer_nombre.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Segundo nombre</label>
                        <input {...register('segundo_nombre')} className={inputClass} placeholder="Opcional" />
                    </div>
                </div>

                {/* Apellidos */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Primer apellido <span className="text-red-500">*</span></label>
                        <input {...register('primer_apellido')} className={inputClass} placeholder="Ej. Ramírez" />
                        {errors.primer_apellido && <p className={errorClass}>{errors.primer_apellido.message}</p>}
                    </div>
                    <div>
                        <label className={labelClass}>Segundo apellido</label>
                        <input {...register('segundo_apellido')} className={inputClass} placeholder="Opcional" />
                    </div>
                </div>

                {/* Documento */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Tipo de documento <span className="text-red-500">*</span></label>
                        <select {...register('tipo_documento')} className={inputClass}>
                            <option value="CC">Cédula de Ciudadanía</option>
                            <option value="TI">Tarjeta de Identidad</option>
                            <option value="CE">Cédula Extranjería</option>
                            <option value="PP">Pasaporte</option>
                        </select>
                    </div>
                    <div>
                        <label className={labelClass}>Número de documento <span className="text-red-500">*</span></label>
                        <input 
                            {...register('numero_documento')} 
                            className={inputClass} 
                            placeholder="Ej. 1094001234"
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

                {/* Correo y Teléfono */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Correo institucional <span className="text-red-500">*</span></label>
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
                        <p className="text-[10px] text-gray-500 mt-1">Debe incluir el símbolo @</p>
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
                        {errors.telefono && <p className={errorClass}>{errors.telefono.message}</p>}
                    </div>
                </div>

                {/* Rol */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className={labelClass}>Rol del sistema <span className="text-red-500">*</span></label>
                        <select {...register('rol')} className={inputClass}>
                            {Object.entries(rolLabels).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                    </div>
                    {/* Solo mostrar programa si el rol es ESTUDIANTE */}
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

                {/* Contraseña */}
                <div>
                    <label className={labelClass}>Contraseña temporal <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input
                            {...register('contrasena')}
                            type={showPass ? 'text' : 'password'}
                            className={`${inputClass} pr-10`}
                            placeholder="Mínimo 8 caracteres"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-[#64748b]">
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                    {errors.contrasena && <p className={errorClass}>{errors.contrasena.message}</p>}
                    <p className="text-[11px] text-[#94a3b8] mt-1">⚠️ El usuario deberá cambiar esta contraseña en su primer inicio de sesión.</p>
                </div>

                {/* Botones */}
                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creando...</> : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
