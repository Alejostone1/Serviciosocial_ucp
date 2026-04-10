'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams, useRouter } from 'next/navigation';
import { validarTokenRecuperacion, restablecerContrasena } from '../recuperar-contrasena/actions';

export default function RestablecerContrasenaPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [showPassword, setShowPassword] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [isValidating, setIsValidating] = React.useState(true);
    const [isSuccess, setIsSuccess] = React.useState(false);
    const [validationError, setValidationError] = React.useState<string | null>(null);
    const [userName, setUserName] = React.useState('');

    // Validar token al cargar
    React.useEffect(() => {
        if (!token) {
            setValidationError('No se proporcionó un token de recuperación');
            setIsValidating(false);
            return;
        }

        validarTokenRecuperacion(token).then((result) => {
            if (result.valid) {
                setUserName(result.nombre || '');
            } else {
                setValidationError(result.message || 'Token inválido');
            }
            setIsValidating(false);
        });
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Token no válido');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 8) {
            toast.error('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        setIsLoading(true);

        try {
            const result = await restablecerContrasena(token, password);

            if (result.success) {
                setIsSuccess(true);
                toast.success('Contraseña restablecida exitosamente');
            } else {
                toast.error(result.message || 'Error al restablecer la contraseña');
            }
        } catch (error) {
            toast.error('Error al procesar la solicitud');
        } finally {
            setIsLoading(false);
        }
    };

    // Pantalla de carga
    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-[#8B1E1E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Validando enlace...</p>
                </div>
            </div>
        );
    }

    // Error de validación
    if (validationError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
                    <p className="text-gray-600 mb-6">{validationError}</p>
                    <Link
                        href="/recuperar-contrasena"
                        className="inline-block w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#731919] transition-colors"
                    >
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        );
    }

    // Éxito
    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña actualizada!</h1>
                    <p className="text-gray-600 mb-6">
                        Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                    </p>
                    <Link
                        href="/login"
                        className="inline-block w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#731919] transition-colors"
                    >
                        Ir al inicio de sesión
                    </Link>
                </div>
            </div>
        );
    }

    // Formulario
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al inicio
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Restablecer Contraseña
                    </h1>
                    <p className="text-gray-600">
                        {userName ? `Hola ${userName},` : 'Hola,'} crea una nueva contraseña para tu cuenta.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Nueva contraseña */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                                placeholder="Mínimo 8 caracteres"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar contraseña */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={8}
                                className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                                placeholder="Repite tu contraseña"
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#8B1E1E] text-white py-3 px-4 rounded-lg font-semibold hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Restableciendo...
                            </>
                        ) : (
                            'Restablecer Contraseña'
                        )}
                    </button>
                </form>

                {/* Requisitos */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2 text-sm">Requisitos de la contraseña:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600' : ''}`}>
                            <CheckCircle className={`w-4 h-4 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`} />
                            Mínimo 8 caracteres
                        </li>
                        <li className={`flex items-center gap-2 ${password === confirmPassword && password !== '' ? 'text-green-600' : ''}`}>
                            <CheckCircle className={`w-4 h-4 ${password === confirmPassword && password !== '' ? 'text-green-600' : 'text-gray-400'}`} />
                            Las contraseñas coinciden
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
