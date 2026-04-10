'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { 
    Clock, 
    ChevronRight, 
    ShieldCheck, 
    Users, 
    FileText, 
    Calendar,
    ArrowUpRight,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Search,
    Filter,
    MoreHorizontal,
    Activity,
    Plus,
    UserCircle2,
    Bell,
    TrendingUp,
    Inbox,
    ExternalLink,
    BookOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDashboardStatsAliado } from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function AliadoDashboard() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
        try {
            setLoading(true);
            const stats = await getDashboardStatsAliado();
            setData(stats);
        } catch (error) {
            toast.error('Error al sincronizar datos');
        } finally {
            setLoading(false);
        }
    };
    loadData();
  }, []);

  if (loading) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#fafaf9]">
            <div className="relative">
                <div className="w-10 h-10 border-2 border-slate-100 border-t-[#8B1E1E] rounded-full animate-spin" />
            </div>
            <p className="mt-4 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">Sincronizando datos...</p>
        </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-6 pb-20 px-4 md:px-6 lg:px-8 mt-4 animate-in fade-in duration-700">
      
      {/* Dashboard Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Aliado</h1>
            <p className="text-slate-500 font-medium mt-1">Sincronización y monitoreo de proyectos de servicio social fidedignos.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
            <div className="h-10 px-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-sm font-semibold text-slate-600">
                    {new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
            </div>
            
            {/* Deep-linking al listado con modal abierto */}
            <Link 
                href="/sistema/aliado/convocatorias?action=new"
                className="h-10 px-6 rounded-xl bg-[#8B1E1E] text-white flex items-center gap-2 text-sm font-bold shadow-lg shadow-red-900/10 hover:bg-[#721818] transition-all"
            >
                <Plus className="w-4 h-4" /> Nueva Convocatoria
            </Link>
        </div>
      </div>

      {/* Statistics Hub */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatWidget 
            label="Revisiones Pendientes" 
            value={data?.stats?.horasPorValidar || 0} 
            icon={ShieldCheck} 
            status="Prioridad Alta"
            color="text-amber-500"
            bgColor="bg-amber-50/50"
        />
        <StatWidget 
            label="Nuevas Postulaciones" 
            value={data?.stats?.postulacionesPendientes || 0} 
            icon={Users} 
            status="Ciclo Activo"
            color="text-blue-500"
            bgColor="bg-blue-50/50"
        />
        <StatWidget 
            label="Mis Convocatorias" 
            value={data?.stats?.totalConvocatorias || 0} 
            icon={FileText} 
            status="Publicadas"
            color="text-[#8B1E1E]"
            bgColor="bg-red-50/50"
        />
        <StatWidget 
            label="Reportes del Mes" 
            value={data?.stats?.reportesMes || 0} 
            icon={Activity} 
            status="Consolidando"
            color="text-emerald-500"
            bgColor="bg-emerald-50/50"
        />
      </section>

      {/* Main Workspaces Division */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Active Queue & Workflows */}
          <div className="lg:col-span-8 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden min-h-[400px]">
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between bg-[#FAFAFA]/50">
                      <div className="flex items-center gap-3">
                          <Activity className="w-4 h-4 text-[#8B1E1E]" />
                          <h2 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Actividades por Procesar</h2>
                      </div>
                      <Link href="/sistema/aliado/validacion" className="text-[10px] font-bold text-slate-400 hover:text-[#8B1E1E] transition-colors border border-slate-200 px-3 py-1 rounded-md">Ver Auditoría</Link>
                  </div>

                  <div className="divide-y divide-slate-50">
                      {data?.prioritarias?.length > 0 ? data.prioritarias.map((task: any, i: number) => (
                          <div key={i} className="px-8 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-all duration-300 group">
                              <div className="flex items-center gap-5 min-w-0">
                                  <div className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm",
                                      task.type === 'HORAS' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                                  )}>
                                      {task.type === 'HORAS' ? <Clock className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                  </div>
                                  <div className="min-w-0">
                                      <p className="text-sm font-semibold text-slate-800 truncate mb-0.5">{task.title}</p>
                                      <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-slate-300 uppercase shrink-0">{task.type}</span>
                                          <span className="text-xs text-slate-400 truncate font-medium">{task.desc}</span>
                                      </div>
                                  </div>
                              </div>
                              <div className="flex items-center gap-6 shrink-0">
                                  <div className="text-right hidden sm:block">
                                      <p className="text-[10px] font-bold text-slate-300 uppercase leading-none mb-1">Recibido</p>
                                      <p className="text-xs font-semibold text-slate-600">{new Date(task.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  </div>
                                  <Link 
                                    href={task.type === 'HORAS' ? '/sistema/aliado/validacion' : '/sistema/aliado/postulaciones'}
                                    className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all duration-300"
                                  >
                                      <ArrowUpRight className="w-4 h-4" />
                                  </Link>
                              </div>
                          </div>
                      )) : (
                          <div className="py-24 flex flex-col items-center justify-center text-center px-10">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 border border-slate-100">
                                    <Inbox className="w-6 h-6 text-slate-200" />
                                </div>
                                <h3 className="text-sm font-semibold text-slate-900 mb-1">Bandeja Vacía</h3>
                                <p className="text-xs text-slate-400 font-medium max-w-[240px]">No se han detectado reportes o postulaciones críticas para procesar.</p>
                          </div>
                      )}
                  </div>
              </div>

              {/* Direct System Access Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AccessCard 
                    title="Mis Convocatorias" 
                    desc="Gestiona tus proyectos de servicio social publicados."
                    icon={FileText}
                    href="/sistema/aliado/convocatorias"
                  />
                  <AccessCard 
                    title="Estudiantes Vinculados" 
                    desc="Expedientes y seguimiento de horas acumuladas."
                    icon={UserCircle2}
                    href="/sistema/aliado/estudiantes"
                  />
              </div>
          </div>

          {/* Context & Reference Area */}
          <div className="lg:col-span-4 space-y-6">
              
              <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-6 space-y-8">
                  <div className="space-y-6">
                      <div className="flex items-center justify-between">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Información Importante</h3>
                          <AlertCircle className="w-4 h-4 text-slate-200" />
                      </div>
                      <div className="space-y-6">
                           <InfoItem 
                                title="Gestión de Convocatorias" 
                                date="En curso"
                                desc="Recuerda mantener actualizadas las fechas de cierre de tus convocatorias."
                           />
                           <div className="h-px bg-slate-50" />
                           <InfoItem 
                                title="Validación de Horas" 
                                date="Pendiente"
                                desc="Revisa los reportes de horas pendientes de validación."
                           />
                      </div>
                  </div>

                  <div className="pt-6 border-t border-slate-50">
                      <button className="w-full h-11 bg-slate-50 hover:bg-[#8B1E1E] hover:text-white transition-all rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center justify-center gap-2">
                          <MoreHorizontal className="w-3.5 h-3.5" /> Ver más avisos
                      </button>
                  </div>
              </div>

              {/* Guía Técnica y Recursos */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg space-y-5">
                  <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-[#8B1E1E]">
                           <BookOpen className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                          <h4 className="text-sm font-semibold text-slate-800">Guía del Aliado</h4>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Protocolo Institucional</p>
                      </div>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                      Consulta los procedimientos estandarizados para gestión de proyectos y validación de horas.
                  </p>
                  <button className="w-full flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors text-slate-600">
                      Leer Guía <ExternalLink className="w-3 h-3 text-slate-300" />
                  </button>
              </div>

              {/* Health Tracker */}
              <div className="bg-white rounded-2xl border border-slate-100 p-6 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronización Activa</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-600">Estado: Óptimo</span>
              </div>
          </div>

      </div>
    </div>
  );
}

function StatWidget({ label, value, icon: Icon, status, color, bgColor }: any) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg transition-all duration-300 hover:shadow-2xl">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl border", bgColor, color)}>
                    <Icon className="w-5 h-5" />
                </div>
                <MoreHorizontal className="w-4 h-4 text-slate-200" />
            </div>
            <div className="space-y-1">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <div className="text-3xl font-bold text-slate-900 tracking-tight">
                  {typeof value === 'number' ? value.toLocaleString('es-CO') : value}
                </div>
                {status && (
                  <p className="text-xs text-slate-500 mt-2 font-medium">{status}</p>
                )}
            </div>
        </div>
    );
}

function AccessCard({ title, desc, icon: Icon, href }: any) {
    return (
        <Link href={href} className="flex flex-col p-6 bg-white rounded-2xl border border-slate-100 shadow-lg hover:border-[#8B1E1E]/20 hover:shadow-2xl transition-all duration-300 group min-h-[140px]">
            <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center mb-6 group-hover:bg-[#8B1E1E]/5 group-hover:text-[#8B1E1E] transition-all duration-300">
                <Icon className="w-5 h-5" />
            </div>
            <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
                <p className="text-xs text-slate-400 font-medium leading-relaxed">{desc}</p>
            </div>
        </Link>
    );
}

function InfoItem({ title, date, desc }: any) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
                <h4 className="text-xs font-semibold text-slate-800 leading-tight">{title}</h4>
                <span className="text-[9px] font-bold text-slate-300 uppercase shrink-0">{date}</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{desc}</p>
        </div>
    );
}
