'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, AlertTriangle, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Error en noticias del administrador:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6">
                        <AlertTriangle className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Error inesperado
                    </h1>

                    {/* Description */}
                    <p className="text-slate-600 mb-6">
                        Ha ocurrido un error al cargar las noticias. 
                        Por favor, intenta nuevamente o contacta soporte.
                    </p>

                    {/* Error Details (for development) */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="bg-red-50 rounded-xl p-4 mb-6 text-left">
                            <div className="font-semibold text-red-900 text-sm mb-2">
                                Detalles del error:
                            </div>
                            <div className="text-xs text-red-700 font-mono break-all">
                                {error.message}
                            </div>
                            {error.digest && (
                                <div className="text-xs text-red-600 mt-2">
                                    ID: {error.digest}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-3">
                        <button
                            onClick={reset}
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:from-blue-600 hover:to-indigo-600 transition-all font-medium"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Intentar nuevamente
                        </button>
                        
                        <Link
                            href="/(sistema)/administrador/noticias"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Noticias
                        </Link>
                        
                        <Link
                            href="/(sistema)/administrador"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-xl hover:from-slate-600 hover:to-slate-700 transition-all font-medium"
                        >
                            <Home className="w-4 h-4" />
                            Panel Principal
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                            Si el error persiste, contacta al equipo de desarrollo.
                        </p>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="mt-6 bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-900 text-sm mb-1">
                                Soluciones comunes:
                            </h3>
                            <ul className="text-xs text-amber-700 space-y-1">
                                <li>• Verifica tu conexión a internet</li>
                                <li>• Recarga la página</li>
                                <li>• Limpia el caché del navegador</li>
                                <li>• Intenta con otro navegador</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
