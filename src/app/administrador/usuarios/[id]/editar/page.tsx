'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updateUsuario, getUsuarioById } from '../../actions';
import { Rol, TipoDocumento } from '@prisma/client';
import { ChevronLeft, Save } from 'lucide-react';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';

const schema = z.object({
    primer_nombre: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_nombre: z.string().optional().or(z.literal('')),
    primer_apellido: z.string().min(2, 'Mínimo 2 caracteres'),
    segundo_apellido: z.string().optional().or(z.literal('')),
    correo: z.string().email('Correo inválido'),
    telefono: z.string()
        .max(10, 'Máximo 10 dígitos')
        .regex(/^\d*$/, 'Solo se permiten números')
        .optional()
        .or(z.literal('')),
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

type Programa = { id: string; nombre: string; nivel_formacion: string };

export default function EditarUsuarioPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [usuario, setUsuario] = useState<any>(null);
    const [programas, setProgramas] = useState<Programa[]>([]);

    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
    });

    const rolValue = watch('rol');

    // Cargar datos del usuario y programas
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsFetching(true);
                // Obtener usuario
                const userData = await getUsuarioById(params.id);
                if (!userData) {
                    toast.error('Usuario no encontrado');
                    router.push('/administrador/usuarios');
                    return;
                }
                setUsuario(userData);

                // Obtener programas
                const response = await fetch('/api/programas');
                if (response.ok) {
                    const progData = await response.json();
                    setProgramas(progData);
                }

                // Cargar datos en el formulario
                reset({
                    primer_nombre: userData.primer_nombre,
                    segundo_nombre: userData.segundo_nombre || '',
                    primer_apellido: userData.primer_apellido,
                    segundo_apellido: userData.segundo_apellido || '',
                    correo: userData.correo,
                    telefono: userData.telefono || '',
                    rol: userData.rol,
                    id_programa: userData.id_programa || (userData.programa?.id) || '',
                    tipo_documento: userData.tipo_documento,
                    numero_documento: userData.numero_documento,
                });
            } catch (error) {
                console.error('Error cargando datos:', error);
                toast.error('Error al cargar los datos del usuario');
            } finally {
                setIsFetching(false);
            }
        };

        loadData();
    }, [params.id, reset, router]);

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Actualizando usuario...');
        try {
            const updated = await updateUsuario(params.id, {
                ...values,
                id_programa: values.rol === 'ESTUDIANTE' ? values.id_programa : undefined,
            });
            toast.success('Usuario actualizado', { 
                id: toastId, 
                description: 'Los datos se guardaron correctamente.' 
            });
            // Redirigir a la página de detalles
            router.push(`/administrador/usuarios/${params.id}`);
            router.refresh();
        } catch (e: any) {
            toast.error('Error al actualizar', { 
                id: toastId, 
                description: e.message ?? 'Verifica los datos ingresados.' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";
    const errorClass = "mt-1 text-xs text-red-500";
    const labelClass = "block text-sm font-semibold text-[#334155] mb-1.5";

    if (isFetching) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <InstitutionalLoader />
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-medium">Usuario no encontrado</p>
                    <Link 
                        href="/administrador/usuarios" 
                        className="mt-4 inline-flex items-center gap-2 text-[#8B1E1E] hover:underline font-medium"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Volver al listado
                    </Link>
                </div>
            </div>
        );
    }

    const nombreCompleto = [
        usuario.primer_nombre,
        usuario.segundo_nombre,
        usuario.primer_apellido,
        usuario.segundo_apellido
    ].filter(Boolean).join(' ');

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <nav className="mb-4">
                        <Link
                            href={`/administrador/usuarios/${params.id}`}
                            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold uppercase tracking-wider"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            Volver a detalles
                        </Link>
                    </nav>
                    <h1 className="text-3xl font-bold text-slate-900">Editar Usuario</h1>
                    <p className="text-slate-600 mt-1">
                        Modificando información de <span className="font-semibold">{nombreCompleto}</span>
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-200">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Información Personal
                        </h2>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                        {/* Nombres */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        {/* Documento de Identidad - Editable con advertencia */}
                        <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-amber-600">⚠️</span>
                                <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Documento de Identidad - Modificar con precaución</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Tipo de documento <span className="text-red-500">*</span></label>
                                    <select {...register('tipo_documento')} className={inputClass}>
                                        {Object.entries(tipoDocumentoLabels).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className={labelClass}>Número de documento <span className="text-red-500">*</span></label>
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
                            <p className="text-xs text-amber-700 bg-amber-100/50 p-2 rounded">
                                <span className="font-semibold">Advertencia:</span> Modificar el documento de identidad puede afectar la validación de certificados y registros académicos previos.
                            </p>
                        </div>

                        {/* Correo y Teléfono */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <p className="text-[10px] text-slate-500 mt-1">Debe incluir el símbolo @</p>
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

                        {/* Rol y Programa */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Rol del sistema <span className="text-red-500">*</span></label>
                                <select {...register('rol')} className={inputClass}>
                                    {Object.entries(rolLabels).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            {(rolValue === 'ESTUDIANTE' || usuario?.rol === 'ESTUDIANTE') && (
                                <div>
                                    <label className={labelClass}>Programa académico</label>
                                    <select {...register('id_programa')} className={inputClass}>
                                        <option value="">— Sin programa —</option>
                                        {programas.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Botones */}
                        <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
                            <Link 
                                href={`/administrador/usuarios/${params.id}`}
                                className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors"
                            >
                                Cancelar
                            </Link>
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>Guardando...</>
                                ) : (
                                    <><Save className="w-4 h-4" /> Guardar Cambios</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
