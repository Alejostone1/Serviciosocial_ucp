import React from 'react';
import { Loader2, FileText, Image, Settings } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Skeleton */}
            <div className="bg-white border-b border-slate-200 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 bg-slate-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-6 w-32 bg-slate-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-48 bg-slate-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-10 w-24 bg-slate-200 rounded-lg animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Content Loading */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-2xl border border-slate-200 p-8">
                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-br from-[#8B1E1E] to-[#731919] rounded-full flex items-center justify-center mb-6 mx-auto">
                                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                                </div>
                                
                                {/* Floating Icons */}
                                <div className="absolute -top-2 -left-8 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center animate-bounce">
                                    <FileText className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="absolute -top-2 -right-8 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center animate-bounce delay-100">
                                    <Image className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center animate-bounce delay-200">
                                    <Settings className="w-4 h-4 text-purple-600" />
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold text-slate-900 mb-2">
                                Cargando noticias...
                            </h2>
                            <p className="text-slate-600 mb-6">
                                Estamos preparando el contenido para ti
                            </p>

                            {/* Loading States */}
                            <div className="space-y-3 max-w-sm mx-auto">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full animate-pulse"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full animate-pulse delay-100"></div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-pulse delay-200"></div>
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full animate-pulse delay-200"></div>
                                </div>
                            </div>

                            {/* Loading Text */}
                            <div className="mt-6 text-sm text-slate-500">
                                <p className="animate-pulse">
                                    Procesando contenido...
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Skeleton Cards */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-6">
                            <div className="space-y-4">
                                <div className="h-4 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                                <div className="h-3 w-full bg-slate-100 rounded animate-pulse"></div>
                                <div className="h-3 w-2/3 bg-slate-100 rounded animate-pulse"></div>
                                <div className="flex items-center justify-between">
                                    <div className="h-8 w-16 bg-slate-200 rounded-lg animate-pulse"></div>
                                    <div className="flex gap-2">
                                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
                                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
                                        <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
