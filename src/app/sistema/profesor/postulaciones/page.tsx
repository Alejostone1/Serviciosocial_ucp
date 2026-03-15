'use client';

import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Search, 
    User, 
    CheckCircle, 
    XCircle, 
    Clock, 
    ChevronRight,
    Loader2,
    Calendar,
    Filter,
    Inbox
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PostulacionesPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 600);
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="px-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revisión de Postulaciones</h1>
                <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
                    Evalúa el perfil de los estudiantes interesados en tus proyectos y gestiona su vinculación.
                </p>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
                    <div className="relative w-full sm:w-80 group">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                        <input 
                            placeholder="Estudiante o proyecto..." 
                            className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
                        <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
                        <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Consultando bandeja...</p>
                    </div>
                ) : (
                    <div className="text-center py-40 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                            <Inbox className="w-8 h-8 text-slate-200" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Bandeja Vacía</h3>
                        <p className="text-slate-400 max-w-xs mx-auto font-medium">
                            En este momento no hay solicitudes de estudiantes pendientes por revisar.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
