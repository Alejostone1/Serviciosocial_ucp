import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, FileText, AlertCircle } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
                    {/* Icon */}
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-[#8B1E1E] to-[#731919] rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">
                        Noticia no encontrada
                    </h1>

                    {/* Description */}
                    <p className="text-slate-600 mb-6">
                        La noticia que estás buscando no existe o ha sido eliminada. 
                        Verifica el enlace o busca otra noticia en la lista.
                    </p>

                    {/* Stats */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <div className="font-semibold text-slate-700">Estado:</div>
                                <div className="text-red-600">404</div>
                            </div>
                            <div>
                                <div className="font-semibold text-slate-700">Recurso:</div>
                                <div className="text-slate-600">Noticia</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href="/(sistema)/administrador/noticias"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#8B1E1E] to-[#731919] text-white rounded-xl hover:from-[#731919] hover:to-[#6a1616] transition-all font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Noticias
                        </Link>
                        
                        <Link
                            href="/(sistema)/administrador/noticias/nueva"
                            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                        >
                            <FileText className="w-4 h-4" />
                            Crear Nueva Noticia
                        </Link>
                    </div>

                    {/* Help Text */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-500">
                            Si crees que esto es un error, contacta al administrador del sistema.
                        </p>
                    </div>
                </div>

                {/* Additional Help */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                        <Search className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-blue-900 text-sm mb-1">
                                ¿Qué puedes hacer?
                            </h3>
                            <ul className="text-xs text-blue-700 space-y-1">
                                <li>• Verifica que el ID sea correcto</li>
                                <li>• Revisa la lista de noticias disponibles</li>
                                <li>• Crea una nueva noticia si es necesario</li>
                                <li>• Contacta soporte técnico si persiste</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
