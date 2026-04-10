'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Mail, Lock, CheckCircle, Hexagon } from 'lucide-react';
import { toast } from 'sonner';
import { solicitarRecuperacionContrasena } from './actions';

export default function RecuperarContrasenaPage() {
    const [email, setEmail] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [isSubmitted, setIsSubmitted] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!email) {
            toast.error('Por favor ingresa tu correo institucional');
            return;
        }

        setIsLoading(true);
        
        try {
            const result = await solicitarRecuperacionContrasena(email);
            
            if (result.success) {
                setIsSubmitted(true);
                toast.success('Correo enviado', {
                    description: 'Hemos enviado instrucciones a tu correo institucional'
                });
            } else {
                toast.error('Error al enviar el correo', {
                    description: result.message
                });
            }
        } catch (error) {
            toast.error('Error al procesar la solicitud', {
                description: 'Por favor intenta nuevamente más tarde'
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
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

                        {/* Main Copy */}
                        <div className="max-w-md my-auto pt-12 pb-8">
                            <h2 className="text-[3.5rem] font-bold leading-[1.1] mb-6 tracking-tight text-white">
                                Recupera tu <br /> Acceso
                            </h2>
                            <p className="text-lg text-white/90 leading-relaxed font-light mb-10">
                                Te hemos enviado las instrucciones para recuperar tu contraseña. Revisa tu correo institucional y sigue los pasos indicados.
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

                {/* Right Panel - Success Message */}
                <div className="flex-1 lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                    <div className="w-full max-w-lg">
                        {/* Success Icon */}
                        <div className="flex justify-center mb-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                        </div>

                        {/* Success Message */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                ¡Correo Enviado!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Hemos enviado las instrucciones para recuperar tu contraseña a:
                            </p>
                            <div className="bg-gray-100 rounded-lg px-4 py-3 inline-block">
                                <span className="font-semibold text-gray-800">{email}</span>
                            </div>
                        </div>

                        {/* Instructions */}
                        <div className="bg-blue-50 rounded-lg p-4 mb-8">
                            <h3 className="font-semibold text-blue-900 mb-2">Próximos pasos:</h3>
                            <ol className="text-sm text-blue-800 space-y-1">
                                <li>1. Revisa tu correo institucional</li>
                                <li>2. Busca el correo de &quot;Servicio Social UCP&quot;</li>
                                <li>3. Haz clic en el enlace de recuperación</li>
                                <li>4. Crea tu nueva contraseña</li>
                            </ol>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <button
                                onClick={() => window.location.href = 'mailto:' + email}
                                className="w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#731919] transition-colors flex items-center justify-center gap-2"
                            >
                                <Mail className="w-5 h-5" />
                                Abrir Correo
                            </button>
                            
                            <Link
                                href="/login"
                                className="w-full block text-center py-3 px-4 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Volver al Inicio de Sesión
                            </Link>
                        </div>

                        {/* Help */}
                        <div className="text-center mt-8">
                            <p className="text-sm text-gray-500">
                                ¿No recibiste el correo?{' '}
                                <button 
                                    onClick={() => setIsSubmitted(false)}
                                    className="text-[#8B1E1E] font-semibold hover:text-[#731919] transition-colors"
                                >
                                    Intentar de nuevo
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

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
                            Recupera tu <br /> Acceso
                        </h2>
                        <p className="text-lg text-white/90 leading-relaxed font-light mb-10">
                            ¿Olvidaste tu contraseña? No te preocupes. Ingresa tu correo institucional y te enviaremos las instrucciones para recuperar tu acceso a la plataforma.
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

            {/* Right Panel - Recovery Form */}
            <div className="flex-1 lg:w-1/2 min-h-screen flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-gray-50 to-white">
                <div className="w-full max-w-lg">
                    {/* Header */}
                    <div className="mb-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver al inicio
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 mb-3">
                            Recuperar Contraseña
                        </h2>
                        <p className="text-gray-600">
                            Ingresa tu correo institucional y te enviaremos un enlace para recuperar tu contraseña.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Correo Institucional <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                                    placeholder="estudiante@ucp.edu.co"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-5 h-5" />
                                    Enviar Instrucciones
                                </>
                            )}
                        </button>
                    </form>

                    {/* Help */}
                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500">
                            ¿Recuerdas tu contraseña?{' '}
                            <Link href="/login" className="text-[#8B1E1E] font-semibold hover:text-[#731919] transition-colors">
                                Inicia Sesión
                            </Link>
                        </p>
                    </div>

                    {/* Additional Help */}
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-gray-600" />
                            ¿Necesitas ayuda?
                        </h3>
                        <p className="text-sm text-gray-600 mb-3">
                            Si no recibes el correo en 5 minutos, revisa tu carpeta de spam o contacta al soporte técnico.
                        </p>
                        <div className="flex gap-3">
                            <button className="text-sm text-[#8B1E1E] font-semibold hover:text-[#731919] transition-colors">
                                Contactar Soporte
                            </button>
                            <button className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                                Preguntas Frecuentes
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
