'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePostulacionesEstudiante } from '@/hooks/use-postulaciones';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import Link from 'next/link';
import {
  Calendar,
  MapPin,
  Clock,
  Search,
  Filter,
  FileText,
  AlertTriangle,
  Users,
  Briefcase,
  Play,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

// Types simplified for brevity
interface ActividadExtendida {
  id: string;
  nombre: string;
  descripcion: string;
  tipo_actividad: string;
  horas_estimadas: number;
  horas_maximas: number | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  ubicacion: string | null;
  convocatoria: {
    id: string;
    titulo: string;
    modalidad: string;
    categoria?: { nombre: string; color_hex?: string; };
  };
  horas_reportadas?: number;
}

export default function MisActividadesPage() {
  const { user } = useAuth();
  const { postulaciones, cargando: cargandoPost } = usePostulacionesEstudiante(user?.id || '');
  const [actividades, setActividades] = useState<ActividadExtendida[]>([]);
  const [cargandoAct, setCargandoAct] = useState(false);
  const [errorAct, setErrorAct] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todas');

  useEffect(() => {
    const obtenerActividades = async () => {
      if (!user?.id || postulaciones.length === 0) return;

      const aceptadas = postulaciones.filter((p: any) => p.estado === 'ACEPTADA');
      if (aceptadas.length === 0) {
        setActividades([]);
        return;
      }

      setCargandoAct(true);
      setErrorAct(null);
      try {
        const convocatoriaIds = Array.from(new Set(aceptadas.map((p: any) => p.convocatoria.id)));
        const response = await fetch('/api/actividades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ convocatoria_ids: convocatoriaIds, id_estudiante: user.id }),
        });

        if (!response.ok) throw new Error('Error al obtener actividades');

        const data = await response.json();
        setActividades(data.actividades || []);
      } catch (err) {
        setErrorAct(err instanceof Error ? err.message : 'Error desconocido');
        setActividades([]);
      } finally {
        setCargandoAct(false);
      }
    };
    obtenerActividades();
  }, [user?.id, postulaciones]);

  const actividadesFiltradas = actividades.filter(act => {
    const coincideBusqueda = busqueda === '' ||
      act.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      act.descripcion.toLowerCase().includes(busqueda.toLowerCase());
    const coincideTipo = filtroTipo === 'todas' || act.tipo_actividad === filtroTipo;
    return coincideBusqueda && coincideTipo;
  });

  const tipoConfig: Record<string, { variant: BadgeVariant, label: string }> = {
    GENERAL: { variant: 'default', label: 'General' },
    CAPACITACION: { variant: 'success', label: 'Capacitación' },
    CAMPO: { variant: 'warning', label: 'Campo' },
    ADMINISTRATIVA: { variant: 'info', label: 'Administrativa' },
    INVESTIGACION: { variant: 'error', label: 'Investigación' },
    COMUNITARIA: { variant: 'warning', label: 'Comunitaria' }
  };

  const formatearFecha = (fecha: string | null) => {
    if (!fecha) return 'No definida';
    return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (cargandoPost || cargandoAct) {
    return (
      <PageContainer>
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      </PageContainer>
    );
  }

  if (errorAct) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar actividades</h2>
          <p className="text-slate-500 mb-6">{errorAct}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition">
            Reintentar
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Mis Actividades"
        description="Explora y reporta horas de las actividades en los proyectos donde fuiste aceptado."
      >
        <div className="flex gap-2">
          <Link
            href="/estudiante/mis-postulaciones"
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
          >
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Postulaciones</span>
          </Link>
          <Link
            href="/estudiante/mis-horas"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium"
          >
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Mis Horas</span>
          </Link>
        </div>
      </SectionHeader>

      {actividades.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar actividades..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 text-slate-900 transition-shadow outline-none"
            />
          </div>
          <div className="shrink-0 flex items-center gap-2 relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="pl-9 pr-10 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm text-slate-800 font-medium appearance-none cursor-pointer"
            >
              <option value="todas">Todos los tipos</option>
              <option value="GENERAL">General</option>
              <option value="CAPACITACION">Capacitación</option>
              <option value="CAMPO">Campo</option>
              <option value="ADMINISTRATIVA">Administrativa</option>
              <option value="INVESTIGACION">Investigación</option>
              <option value="COMUNITARIA">Comunitaria</option>
            </select>
          </div>
        </div>
      )}

      {actividades.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No hay actividades"
          description="Aún no tienes actividades disponibles. Debes ser aceptado en una convocatoria primero."
          action={
            <Link href="/estudiante/convocatorias" className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold mt-4">
              Explorar Convocatorias
            </Link>
          }
        />
      ) : actividadesFiltradas.length === 0 ? (
        <EmptyState
          icon={Search}
          title="Sin resultados"
          description="No se encontraron actividades con los filtros actuales."
        />
      ) : (
        <div className="relative">
          {/* Timeline Line Context (optional: could render a line through left if timeline look wanted) */}
          <div className="space-y-6">
            {actividadesFiltradas.map((act) => {
              const tipoInfo = tipoConfig[act.tipo_actividad] || { variant: 'default', label: act.tipo_actividad };

              return (
                <div key={act.id} className="group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all flex flex-col sm:flex-row gap-6">
                  {/* Left Icon Config */}
                  <div className="hidden sm:flex shrink-0">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                      <Briefcase className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{act.nombre}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-2 truncate">
                          Convocatoria: {act.convocatoria?.titulo}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        <Badge variant={tipoInfo.variant}>{tipoInfo.label}</Badge>
                      </div>
                    </div>

                    <p className="text-slate-600 text-sm mb-5 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 line-clamp-2">
                      {act.descripcion || "Sin descripción"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                      {(act.fecha_inicio || act.fecha_limite) && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-400"><Calendar className="w-4 h-4" /></div>
                          <span className="font-medium truncate">{formatearFecha(act.fecha_inicio)} - {formatearFecha(act.fecha_limite)}</span>
                        </div>
                      )}
                      {act.ubicacion && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 border-l border-slate-100 pl-4">
                          <div className="p-1.5 bg-slate-100 rounded-md text-slate-400"><MapPin className="w-4 h-4" /></div>
                          <span className="truncate">{act.ubicacion}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm text-slate-600 border-l border-slate-100 pl-4">
                        <div className="p-1.5 bg-slate-100 rounded-md text-slate-400"><Clock className="w-4 h-4" /></div>
                        <span>{act.horas_estimadas}h estimadas {act.horas_maximas ? `(Máz: ${act.horas_maximas}h)` : ''}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                      {act.horas_reportadas && act.horas_reportadas > 0 ? (
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4" /> {act.horas_reportadas}h reportadas
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 font-medium">No hay horas reportadas aún.</span>
                      )}

                      <Link
                        href={`/estudiante/mis-horas/reportar?actividad=${act.id}&convocatoria=${act.convocatoria?.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-indigo-600 transition-colors group/btn"
                      >
                        Reportar Horas
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </PageContainer>
  );
}
