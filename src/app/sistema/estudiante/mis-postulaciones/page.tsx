'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePostulacionesEstudiante } from '@/hooks/use-postulaciones';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { DataTable, Column } from '../components/ui/DataTable';
import { EmptyState } from '../components/ui/EmptyState';
import Link from 'next/link';
import {
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowLeft,
  FileText,
  Eye
} from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export default function MisPostulacionesPage() {
  const { user } = useAuth();
  const { postulaciones, cargando, error, recargar } = usePostulacionesEstudiante(user?.id || '');

  const [filtroEstado, setFiltroEstado] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState<string>('');

  const postulacionesFiltradas = postulaciones.filter((postulacion: any) => {
    const coincideEstado = filtroEstado === 'todas' || postulacion.estado === filtroEstado;
    const coincideBusqueda = busqueda === '' ||
      postulacion.convocatoria.titulo.toLowerCase().includes(busqueda.toLowerCase()) ||
      postulacion.convocatoria.descripcion.toLowerCase().includes(busqueda.toLowerCase());

    return coincideEstado && coincideBusqueda;
  });

  const estadoConfig: Record<string, { variant: BadgeVariant, label: string, icon: any }> = {
    PENDIENTE: { variant: 'warning', label: 'Pendiente', icon: Clock },
    EN_REVISION: { variant: 'info', label: 'En revisión', icon: AlertCircle },
    ACEPTADA: { variant: 'success', label: 'Aceptada', icon: CheckCircle },
    RECHAZADA: { variant: 'error', label: 'Rechazada', icon: XCircle },
    RETIRADA: { variant: 'default', label: 'Retirada', icon: ArrowLeft }
  };

  const columns: Column<any>[] = [
    {
      header: 'Convocatoria',
      cell: (item) => (
        <div>
          <p className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {item.convocatoria.titulo}
          </p>
          <p className="text-xs text-slate-500 mt-1">ID: {item.id.slice(0, 8)}</p>
        </div>
      )
    },
    {
      header: 'Fecha',
      cell: (item) => (
        <span className="text-sm font-medium text-slate-600">
          {new Date(item.postulado_en).toLocaleDateString('es-ES')}
        </span>
      )
    },
    {
      header: 'Estado',
      cell: (item) => {
        const config = estadoConfig[item.estado] || { variant: 'default', label: item.estado, icon: Clock };
        const Icon = config.icon;
        return (
          <Badge variant={config.variant} className="gap-1.5 py-1">
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </Badge>
        );
      }
    },
    {
      header: 'Acciones',
      cell: (item) => (
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors tooltip-trigger relative">
            <Eye className="w-4 h-4" />
          </button>
          <Link
            href={`/estudiante/convocatorias/${item.convocatoria.id}`}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            Ver base
          </Link>
        </div>
      )
    }
  ];

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <XCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar postulaciones</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={recargar}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
          >
            Reintentar
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionHeader
        title="Mis Postulaciones"
        description="Seguimiento de tus solicitudes de ingreso a convocatorias."
      >
        <button
          onClick={recargar}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
        >
          <RefreshCw className={twMerge(clsx("w-4 h-4", cargando && "animate-spin"))} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </SectionHeader>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar postulación..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 text-slate-900 transition-shadow outline-none"
          />
        </div>

        <div className="shrink-0 flex items-center gap-2 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="pl-9 pr-10 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none text-sm text-slate-800 font-medium appearance-none cursor-pointer"
          >
            <option value="todas">Todos los estados</option>
            <option value="PENDIENTE">Pendientes</option>
            <option value="EN_REVISION">En revisión</option>
            <option value="ACEPTADA">Aceptadas</option>
            <option value="RECHAZADA">Rechazadas</option>
            <option value="RETIRADA">Retiradas</option>
          </select>
        </div>
      </div>

      {cargando && postulaciones.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
        </div>
      ) : postulacionesFiltradas.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={postulaciones.length === 0 ? "Sin postulaciones" : "No hay resultados"}
          description={
            postulaciones.length === 0
              ? "Aún no te has postulado a ninguna convocatoria de servicio social."
              : "No se encontraron postulaciones con los filtros aplicados."
          }
          action={
            postulaciones.length === 0 ? (
              <Link
                href="/estudiante/convocatorias"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-semibold"
              >
                Explorar Convocatorias
              </Link>
            ) : undefined
          }
        />
      ) : (
        <DataTable columns={columns} data={postulacionesFiltradas} />
      )}
    </PageContainer>
  );
}
