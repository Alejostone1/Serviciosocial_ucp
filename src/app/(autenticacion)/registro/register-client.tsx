'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AtSign, Lock, Eye, Hexagon, User, Hash, FileText, ChevronRight, GraduationCap, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { registerStudent, getProgramas } from './actions';

interface Programa {
    id: string;
    nombre: string;
    facultad: string;
    horas_requeridas: number;
}

export default function RegisterClient() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProgramas = async () => {
            try {
                const data = await getProgramas();
                setProgramas(data);
            } catch (error) {
                console.error('Error al cargar programas:', error);
                toast.error('Error al cargar los programas académicos');
            } finally {
                setLoading(false);
            }
        };

        loadProgramas();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(e.currentTarget);
            
            const registerData = {
                primer_nombre: formData.get('primer_nombre') as string,
                segundo_nombre: formData.get('segundo_nombre') as string,
                primer_apellido: formData.get('primer_apellido') as string,
                segundo_apellido: formData.get('segundo_apellido') as string,
                numero_documento: formData.get('numero_documento') as string,
                correo: formData.get('correo') as string,
                telefono: formData.get('telefono') as string,
                contrasena: formData.get('contrasena') as string,
                programa: formData.get('programa') as string,
                codigo_estudiantil: formData.get('codigo_estudiantil') as string,
            };

            const result = await registerStudent(registerData);

            if (result.success) {
                toast.success('Cuenta creada exitosamente', {
                    description: result.message,
                    duration: 3000
                });
                
                // Redirigir al login después de 2 segundos
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            } else {
                toast.error('Error en el registro', {
                    description: result.error,
                    duration: 5000
                });
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            toast.error('Error inesperado', {
                description: 'Por favor, intenta nuevamente más tarde',
                duration: 5000
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white font-sans overflow-hidden">
            {/* Left Panel - Branding & Info */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-[#8B1E1E] flex-col justify-between p-12 lg:p-16 text-white min-h-screen shrink-0">

                {/* Background Overlay */}
                <div className="absolute inset-0 bg-black/20 mix-blend-multiply pointer-events-none" />
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay pointer-events-none"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop&crop=top')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#8B1E1E]/80 to-[#4a0f0f]/95 pointer-events-none" />

                <div className="relative z-10 flex flex-col h-full justify-between">
                    {/* Logo Section */}
                    <div className="flex flex-col">
                        <h1 className="text-2xl font-bold tracking-widest leading-none text-white">UCP</h1>
                        <span className="text-[10px] font-semibold tracking-[0.2em] text-white/90 mt-1 uppercase">SERVICIO SOCIAL</span>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-16 mt-8">
                        <div>
                            <span className="block text-[2.75rem] font-extrabold text-[#facc15] leading-none mb-2">150+</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90">PROYECTOS ACTIVOS</span>
                        </div>
                        <div>
                            <span className="block text-[2.75rem] font-extrabold text-[#facc15] leading-none mb-2">2.4k</span>
                            <span className="text-[11px] font-semibold tracking-widest uppercase text-white/90">ESTUDIANTES INSCRITOS</span>
                        </div>
                    </div>

                    {/* Main Copy */}
                    <div className="max-w-md my-auto pt-12 pb-8">
                        <h2 className="text-[3.5rem] font-bold leading-[1.1] mb-6 tracking-tight text-white">
                            Inicia tu etapa <br /> de Servicio <br /> Social
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed font-light mb-10">
                            Crea tu perfil institucional. Sube tus horas, encuentra el proyecto ideal y certifica tu impacto social para cumplir con el requisito de grado.
                        </p>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                            <Hexagon className="w-4 h-4" />
                            <span>Plataforma oficial de la Universidad Católica de Pereira</span>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex items-center justify-between text-white/60 text-xs">
                        <span>© 2026 Universidad Católica de Pereira</span>
                        <div className="flex items-center gap-1">
                            <Hexagon className="w-3 h-3" />
                            <span>v2.0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Registration Form */}
            <div className="flex-1 lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white overflow-y-auto">
                <div className="w-full max-w-2xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-3 tracking-tight">Registro de Estudiante</h2>
                        <p className="text-[#64748b] font-medium text-base">Completa tus datos según el modelo institucional para crear tu cuenta.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Información Personal */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-[#8B1E1E]" />
                                Información Personal
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="primer_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                        Primer Nombre <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="primer_nombre"
                                        name="primer_nombre"
                                        type="text"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Juan"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="segundo_nombre" className="block text-sm font-medium text-gray-700 mb-1">
                                        Segundo Nombre
                                    </label>
                                    <input
                                        id="segundo_nombre"
                                        name="segundo_nombre"
                                        type="text"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Carlos (Opcional)"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="primer_apellido" className="block text-sm font-medium text-gray-700 mb-1">
                                        Primer Apellido <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="primer_apellido"
                                        name="primer_apellido"
                                        type="text"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="Pérez"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="segundo_apellido" className="block text-sm font-medium text-gray-700 mb-1">
                                        Segundo Apellido
                                    </label>
                                    <input
                                        id="segundo_apellido"
                                        name="segundo_apellido"
                                        type="text"
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="García (Opcional)"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contacto y Acceso */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <AtSign className="w-4 h-4 text-[#8B1E1E]" />
                                Contacto y Acceso
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="numero_documento" className="block text-sm font-medium text-gray-700 mb-1">
                                        Documento <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="numero_documento"
                                        name="numero_documento"
                                        type="text"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="123456789"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1">
                                        Correo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="correo"
                                        name="correo"
                                        type="email"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="estudiante@ucp.edu.co"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                                        Teléfono <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="telefono"
                                        name="telefono"
                                        type="tel"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="3001234567"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">
                                        Contraseña <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="contrasena"
                                            name="contrasena"
                                            type={showPassword ? "text" : "password"}
                                            required
                                            disabled={isSubmitting}
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            placeholder="Crea tu contraseña"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                            disabled={isSubmitting}
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Información Académica */}
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
                            <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-[#8B1E1E]" />
                                Información Académica
                            </h3>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="programa" className="block text-sm font-medium text-gray-700 mb-1">
                                        Programa <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        id="programa"
                                        name="programa"
                                        required
                                        disabled={isSubmitting || loading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {loading ? 'Cargando programas...' : 'Selecciona tu programa'}
                                        </option>
                                        {programas.map((programa) => (
                                            <option key={programa.id} value={programa.id}>
                                                {programa.nombre} - {programa.facultad}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="codigo_estudiantil" className="block text-sm font-medium text-gray-700 mb-1">
                                        Código <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        id="codigo_estudiantil"
                                        name="codigo_estudiantil"
                                        type="text"
                                        required
                                        disabled={isSubmitting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        placeholder="2024001234"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Términos y Condiciones */}
                        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <input
                                type="checkbox"
                                id="terminos"
                                required
                                disabled={isSubmitting}
                                className="mt-0.5 w-4 h-4 text-[#8B1E1E] border-gray-300 rounded focus:ring-[#8B1E1E] disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <label htmlFor="terminos" className="text-sm text-gray-700 leading-relaxed">
                                Acepto los términos y condiciones del servicio de Servicio Social UCP. Autorizo el tratamiento de mis datos personales según la política de privacidad de la Universidad Católica de Pereira.
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold text-sm hover:bg-[#731919] transition-colors shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creando cuenta...
                                </>
                            ) : (
                                <>
                                    Crear Cuenta de Estudiante
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {/* Login Link */}
                        <div className="text-center pt-2">
                            <p className="text-sm text-gray-600">
                                ¿Ya tienes una cuenta?{' '}
                                <Link href="/login" className="text-[#8B1E1E] font-semibold hover:text-[#731919] transition-colors">
                                    Inicia Sesión
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
