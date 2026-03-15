'use client';

import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Search, 
    Download, 
    Calendar,
    Filter,
    ChevronRight,
    Loader2,
    BarChart3,
    ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AuxiliarReportesPage() {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => setLoading(false), 600);
    }, []);

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="px-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Reportes Administrativos</h1>
                <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
                    Genera y descarga informes detallados sobre la gestión de servicio social de la universidad.
                </p>
            </div>

            {/* Content Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { title: 'Progreso Estudiantil', desc: 'Resumen de horas acumuladas por semestre y programa.', icon: BarChart3 },
                    { title: 'Actividades Realizadas', desc: 'Listado de tareas completadas y su impacto social.', icon: FileText },
                    { title: 'Relación con Aliados', desc: 'Estado de vinculaciones y convenios activos.', icon: Filter },
                ].map((rep, i) => (
                    <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                         <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
                            <rep.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{rep.title}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed mb-8">{rep.desc}</p>
                        <button className="flex items-center gap-2 text-[#8B1E1E] font-bold text-sm hover:translate-x-1 transition-transform">
                            Generar ahora <ArrowUpRight className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>

            {/* Quick Exports Section */}
            <section className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#8B1E1E] rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
                    <div className="space-y-4 max-w-lg">
                        <h2 className="text-2xl font-bold leading-tight">Exportación de Datos Crudos</h2>
                        <p className="text-slate-400 font-medium">
                            Descarga la base de datos completa en formato Excel o CSV para análisis externo.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-100 transition-all">
                            <Download className="w-5 h-5" />
                            Descargar Excel
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}
