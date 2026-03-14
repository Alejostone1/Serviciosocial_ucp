'use client';

import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  ClipboardList,
  Clock,
  Award,
  Link as LinkIcon,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
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

/* ============================================================
 * COMPONENTES LOCALES PARA EL DASHBOARD PROFESIONAL
 * ============================================================ */

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue"
}: {
  title: string;
  value: string | number;
  icon: any;
  description?: string;
  trend?: { value: number; isPositive: boolean };
  color?: "blue" | "red" | "yellow" | "green" | "slate";
}) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    red: "text-[#8B1E1E] bg-red-50 border-red-100",
    yellow: "text-amber-600 bg-amber-50 border-amber-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    slate: "text-slate-600 bg-slate-50 border-slate-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={cn("p-2.5 rounded-xl border", colorMap[color])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider",
            trend.isPositive ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-700 border border-rose-100"
          )}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </div>
        )}
      </div>
      <div>
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{title}</div>
        <div className="text-3xl font-bold text-slate-900 tracking-tight">
          {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
        </div>
        {description && (
          <p className="text-xs text-slate-500 mt-2 font-medium">{description}</p>
        )}
      </div>
    </div>
  );
};

const StatusOverviewCard = ({
  title,
  value,
  icon: Icon,
  color = "slate"
}: {
  title: string;
  value: number;
  icon: any;
  color?: "red" | "emerald" | "amber" | "slate";
}) => {
  const colorMap = {
    red: "text-[#8B1E1E] bg-red-50/50 border-red-100/50",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-100/50",
    amber: "text-amber-600 bg-amber-50/50 border-amber-100/50",
    slate: "text-slate-600 bg-slate-50/50 border-slate-100/50",
  };

  return (
    <div className={cn("flex items-center justify-between p-5 rounded-2xl border", colorMap[color])}>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">{title}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
      </div>
      <div className={cn("p-2.5 rounded-xl bg-white shadow-sm border border-inherit", colorMap[color])}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
};

const ActivityItem = ({ title, date, type }: { title: string; date: Date | string; type: 'convocatoria' | 'noticia' }) => (
  <div className="flex gap-4 items-start py-3 first:pt-0 last:pb-0">
    <div className={cn(
      "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
      type === 'convocatoria' ? "bg-red-50 text-[#8B1E1E]" : "bg-blue-50 text-blue-600"
    )}>
      {type === 'convocatoria' ? <BookOpen className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
    </div>
    <div className="flex-grow min-w-0">
      <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
        {new Date(date).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
      </p>
    </div>
  </div>
);

export default function DashboardClient({ stats }: DashboardClientProps) {
  return (
    <div className="space-y-8 pb-10">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Control</h1>
          <p className="text-slate-500 font-medium mt-1">Sincronización y monitoreo de la plataforma institucional.</p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm text-sm font-semibold text-slate-600">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Sistema en línea: {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Directivos"
          value={stats.totalUsuarios}
          icon={Users}
          description="Gestión institucional activa"
          trend={{ value: 2.4, isPositive: true }}
          color="blue"
        />
        <StatCard
          title="Comunidad"
          value={stats.estudiantesActivos}
          icon={GraduationCap}
          description="Estudiantes vinculados"
          color="red"
        />
        <StatCard
          title="Impacto Social"
          value={stats.totalHoras}
          icon={Clock}
          description="Horas totales en territorio"
          trend={{ value: 5.1, isPositive: true }}
          color="yellow"
        />
        <StatCard
          title="Acreditación"
          value={stats.certificadosEmitidos}
          icon={Award}
          description="Certificados validados"
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Editorial Operations Column */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-6 bg-[#8B1E1E] rounded-full" />
                <h2 className="text-xl font-bold text-slate-900">Métricas Operativas</h2>
              </div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Dashboard V2.0</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatusOverviewCard
                title="Convocatorias"
                value={stats.convocatorias.publicadas + stats.convocatorias.en_curso}
                icon={BookOpen}
                color="slate"
              />
              <StatusOverviewCard
                title="Revisiones"
                value={stats.reportesEnRevision}
                icon={TrendingUp}
                color="emerald"
              />
              <StatusOverviewCard
                title="Postulaciones"
                value={stats.postulacionesPendientes}
                icon={ClipboardList}
                color="amber"
              />
            </div>

            {/* Quick Actions Grid */}
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/administrador/convocatorias" className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-[#8B1E1E] rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg group-hover:bg-white/10 text-slate-400 group-hover:text-white transition-colors">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-white">Central de Convocatorias</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </Link>
              <Link href="/administrador/usuarios" className="group flex items-center justify-between p-5 bg-slate-50 hover:bg-[#8B1E1E] rounded-2xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-lg group-hover:bg-white/10 text-slate-400 group-hover:text-white transition-colors">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-white">Directorio Institucional</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* Activity & Support Column */}
        <div className="lg:col-span-4 space-y-8">
          {/* Recent Activity Feed */}
          <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                Novedades
              </h2>
              <Link href="/administrador/noticias" className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest hover:underline">
                Ver todo
              </Link>
            </div>

            <div className="space-y-1 divide-y divide-slate-50">
              {stats.recentActivity?.convocatorias?.slice(0, 3).map(conv => (
                <ActivityItem key={conv.id} title={conv.titulo} date={conv.creado_en} type="convocatoria" />
              ))}
              {stats.recentActivity?.noticias?.slice(0, 2).map(news => (
                <ActivityItem key={news.id} title={news.titulo} date={news.creado_en} type="noticia" />
              ))}
              {(!stats.recentActivity?.convocatorias?.length && !stats.recentActivity?.noticias?.length) && (
                <p className="text-xs text-slate-400 py-4 text-center">No hay actividad reciente.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
