'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalUsuarios: number;
  estudiantesActivos: number;
  convocatorias: {
    publicadas: number;
    en_curso: number;
    borradores: number;
  };
  postulacionesPendientes: number;
  reportesEnRevision: number;
  certificadosEmitidos: number;
  vinculacionesActivas: number;
  totalHoras: number;
  recentActivity: {
    convocatorias: { id: string; titulo: string; creado_en: Date; estado: string }[];
    noticias: { id: string; titulo: string; creado_en: Date; publicada: boolean }[];
  };
}

interface DashboardClientProps {
  stats: DashboardStats;
}

export default function DashboardClient({ stats }: DashboardClientProps) {
  return (
    <div className="space-y-8 pb-10">
      {/* Header Tipográfico Académico */}
      <div className="border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-2">Universidad Católica de Pereira</p>
            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 tracking-tight">Panel de Control</h1>
            <p className="text-sm text-stone-500 mt-2">Administración de la plataforma de servicio social</p>
          </div>
          <div className="text-xs text-stone-400 text-right">
            <div>{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="text-[10px] mt-1 text-stone-300">Sistema en línea</div>
          </div>
        </div>
      </div>

      {/* Métricas en Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Directivos', value: stats.totalUsuarios, desc: 'Gestión institucional' },
          { label: 'Comunidad', value: stats.estudiantesActivos, desc: 'Estudiantes activos' },
          { label: 'Impacto Social', value: stats.totalHoras, desc: 'Horas en territorio' },
          { label: 'Acreditación', value: stats.certificadosEmitidos, desc: 'Certificados' },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-stone-200 p-5 shadow-sm hover:shadow-lg hover:shadow-stone-900/5 hover:-translate-y-0.5 transition-all duration-300">
            <div className="text-3xl font-bold text-stone-900">{stat.value.toLocaleString('es-CO')}</div>
            <div className="text-xs font-bold text-stone-400 uppercase tracking-wider mt-1">{stat.label}</div>
            <div className="text-xs text-stone-500 mt-1">{stat.desc}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
              <h2 className="text-lg font-bold text-stone-900">Métricas Operativas</h2>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">{stats.convocatorias.publicadas + stats.convocatorias.en_curso}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">Convocatorias</div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">{stats.reportesEnRevision}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">Revisiones</div>
              </div>
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 shadow-sm">
                <div className="text-2xl font-bold text-stone-900">{stats.postulacionesPendientes}</div>
                <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider mt-1">Postulaciones</div>
              </div>
            </div>

            {/* Accesos Directos */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-stone-100">
              <Link href="/administrador/convocatorias" className="group block bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-[#8B1E1E]/30 transition-all">
                <div className="text-2xl font-bold text-stone-900 group-hover:text-[#8B1E1E]">→</div>
                <div className="text-sm font-semibold text-stone-700 mt-2">Convocatorias</div>
              </Link>
              <Link href="/administrador/usuarios" className="group block bg-stone-50 rounded-xl p-5 border border-stone-200 hover:border-[#8B1E1E]/30 transition-all">
                <div className="text-2xl font-bold text-stone-900 group-hover:text-[#8B1E1E]">→</div>
                <div className="text-sm font-semibold text-stone-700 mt-2">Usuarios</div>
              </Link>
              <Link href="/administrador/solicitudes-perfil" className="group block bg-[#8B1E1E]/5 rounded-xl p-5 border border-[#8B1E1E]/20 hover:border-[#8B1E1E] transition-all">
                <div className="text-2xl font-bold text-[#8B1E1E]">→</div>
                <div className="text-sm font-bold text-[#8B1E1E] mt-2">Solicitudes Perfil</div>
                <div className="text-[10px] text-[#8B1E1E]/60 mt-1">Validación docente</div>
              </Link>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-stone-100 pb-4">
              <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider">Actividad Reciente</h2>
            </div>
            <div className="space-y-3">
              {stats.recentActivity?.convocatorias?.slice(0, 3).map((conv) => (
                <div key={conv.id} className="py-2 border-b border-stone-50 last:border-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{conv.titulo}</p>
                  <p className="text-[10px] text-stone-400">{new Date(conv.creado_en).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
