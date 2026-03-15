'use client';

import React from 'react';
import { ProfesorDashboardStats } from '../components/ProfesorDashboardStats';
import { ProfesorRecentActivities } from '../components/ProfesorRecentActivities';
import { ProfesorPendingReports } from '../components/ProfesorPendingReports';
import { useSession } from 'next-auth/react';
import { Sparkles, Calendar as CalendarIcon, ArrowRight, ClipboardList as ToolIcon, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ProfesorDashboard() {
  const { data: session } = useSession();
  const firstName = session?.user?.name?.split(' ')[0] || 'Profesor';

  return (
    <div className="space-y-12 pb-20 animate-in fade-in duration-700">
      {/* Human-Centric Greeting Section */}
      <section className="relative px-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
                <p className="text-[#8B1E1E] font-semibold text-sm tracking-wide flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Panel de Gestión Académica
                </p>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight leading-none">
                    Hola, {firstName}
                </h1>
                <p className="text-slate-500 text-lg font-normal max-w-2xl leading-relaxed">
                    Es un gusto saludarte. Aquí tienes un resumen de lo que sucede en tus proyectos de servicio social esta semana.
                </p>
            </div>
            <div className="flex items-center gap-4">
                <Link 
                    href="/sistema/profesor/convocatorias"
                    className="group h-12 px-6 bg-[#8B1E1E] text-white rounded-xl font-semibold flex items-center gap-2 hover:bg-[#a32424] transition-all duration-300 shadow-md shadow-[#8B1E1E]/10"
                >
                    <CalendarIcon className="w-4 h-4" />
                    Nueva Convocatoria
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
      </section>

      {/* Modern & Clean Stats */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
            <div className="w-1.5 h-6 bg-[#8B1E1E] rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-800">Estado de mis proyectos</h2>
        </div>
        <ProfesorDashboardStats />
      </section>

      {/* Main Content Layout - More balanced whitespace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-12 lg:col-span-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-slate-800">
                            <ToolIcon className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-semibold">Actividad reciente</h2>
                        </div>
                        <Link href="/sistema/profesor/actividades" className="text-sm font-medium text-[#8B1E1E] hover:text-[#a32424] transition-colors">Ver todo</Link>
                    </div>
                    <ProfesorRecentActivities />
                </div>
                
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-slate-800">
                            <Clock className="w-5 h-5 text-slate-400" />
                            <h2 className="text-lg font-semibold">Pendientes de revisión</h2>
                        </div>
                        <Link href="/sistema/profesor/reportes" className="text-sm font-medium text-[#8B1E1E] hover:text-[#a32424] transition-colors">Gestionar</Link>
                    </div>
                    <ProfesorPendingReports />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
