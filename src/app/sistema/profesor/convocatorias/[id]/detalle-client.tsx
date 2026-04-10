'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  MapPin,
  Target,
  Activity,
  FileText,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  Eye,
  User,
  ChevronRight,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Clock3,
  Award,
  Building2,
  Tag,
  Mail
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';

interface ConvocatoriaDetalleProps {
  convocatoria: any;
}

export function ConvocatoriaDetalleClient({ convocatoria }: ConvocatoriaDetalleProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'general' | 'postulaciones' | 'actividades' | 'certificados'>('general');

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'PUBLICADA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'EN_CURSO': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CERRADA': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'FINALIZADA': return 'bg-purple-50 text-purple-700 border-purple-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getEstadoLabel = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'Borrador';
      case 'PUBLICADA': return 'Publicada';
      case 'EN_CURSO': return 'En curso';
      case 'CERRADA': return 'Cerrada';
      case 'FINALIZADA': return 'Finalizada';
      default: return estado;
    }
  };

  const getModalidadLabel = (modalidad: Modalidad) => {
    switch (modalidad) {
      case 'PRESENCIAL': return 'Presencial';
      case 'VIRTUAL': return 'Virtual';
      case 'HIBRIDA': return 'Híbrida';
      default: return modalidad;
    }
  };

  const getPostulacionEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'ACEPTADA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'RECHAZADA': return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'RETIRADA': return 'bg-slate-50 text-slate-600 border-slate-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/sistema/profesor/convocatorias"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Gestionar Convocatoria</h1>
                <p className="text-sm text-slate-500">{convocatoria.titulo}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                getEstadoStyles(convocatoria.estado)
              )}>
                {getEstadoLabel(convocatoria.estado)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{convocatoria._count?.postulaciones || 0}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Postulaciones</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {convocatoria.postulaciones?.filter((p: any) => p.estado === 'ACEPTADA').length || 0}
                </p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Aceptados</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{convocatoria._count?.actividades || 0}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Actividades</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{convocatoria.horas_totales_ofrecidas || 0}</p>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Horas Ofrecidas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            {[
              { id: 'general', label: 'Información General', icon: FileText },
              { id: 'postulaciones', label: 'Postulaciones', icon: Users },
              { id: 'actividades', label: 'Actividades', icon: Activity },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all border-b-2",
                  activeTab === tab.id
                    ? 'border-[#8B1E1E] text-[#8B1E1E] bg-[#8B1E1E]/5'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* General Tab */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Título</label>
                      <p className="text-slate-900 font-medium mt-1">{convocatoria.titulo}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Descripción</label>
                      <p className="text-slate-600 text-sm mt-1 leading-relaxed">{convocatoria.descripcion}</p>
                    </div>
                    {convocatoria.objetivo && (
                      <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Objetivo</label>
                        <p className="text-slate-600 text-sm mt-1 leading-relaxed">{convocatoria.objetivo}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5" />
                          Fecha de Inicio
                        </label>
                        <p className="text-slate-900 font-medium mt-1">
                          {convocatoria.fecha_inicio ? new Date(convocatoria.fecha_inicio).toLocaleDateString() : 'No definida'}
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Clock3 className="w-3.5 h-3.5" />
                          Fecha de Fin
                        </label>
                        <p className="text-slate-900 font-medium mt-1">
                          {convocatoria.fecha_fin ? new Date(convocatoria.fecha_fin).toLocaleDateString() : 'No definida'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Users className="w-3.5 h-3.5" />
                          Cupos
                        </label>
                        <p className="text-slate-900 font-medium mt-1">
                          {convocatoria.cupo_disponible || 0} / {convocatoria.cupo_maximo || 0} disponibles
                        </p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Target className="w-3.5 h-3.5" />
                          Horas a Certificar
                        </label>
                        <p className="text-slate-900 font-medium mt-1">{convocatoria.horas_totales_ofrecidas || 0} horas</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5" />
                        Modalidad y Lugar
                      </label>
                      <p className="text-slate-900 font-medium mt-1">
                        {getModalidadLabel(convocatoria.modalidad)}
                        {convocatoria.lugar && ` - ${convocatoria.lugar}`}
                      </p>
                    </div>
                    {convocatoria.categoria && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Tag className="w-3.5 h-3.5" />
                          Categoría
                        </label>
                        <p className="text-slate-900 font-medium mt-1">{convocatoria.categoria.nombre}</p>
                      </div>
                    )}
                    {convocatoria.programa && (
                      <div className="p-4 bg-slate-50 rounded-lg">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5" />
                          Programa
                        </label>
                        <p className="text-slate-900 font-medium mt-1">{convocatoria.programa.nombre}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Postulaciones Tab */}
            {activeTab === 'postulaciones' && (
              <div className="space-y-4">
                {convocatoria.postulaciones && convocatoria.postulaciones.length > 0 ? (
                  <div className="space-y-3">
                    {convocatoria.postulaciones.map((postulacion: any) => (
                      <div key={postulacion.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {postulacion.estudiante?.primer_nombre} {postulacion.estudiante?.primer_apellido}
                            </p>
                            <p className="text-sm text-slate-500">{postulacion.estudiante?.correo}</p>
                            {postulacion.estudiante?.perfil_estudiante && (
                              <p className="text-xs text-slate-400 mt-1">
                                Código: {postulacion.estudiante.perfil_estudiante.codigo_estudiantil} | 
                                Semestre: {postulacion.estudiante.perfil_estudiante.semestre_actual}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border",
                            getPostulacionEstadoStyles(postulacion.estado)
                          )}>
                            {postulacion.estado}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(postulacion.postulado_en).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay postulaciones registradas</p>
                  </div>
                )}
              </div>
            )}

            {/* Actividades Tab */}
            {activeTab === 'actividades' && (
              <div className="space-y-4">
                {convocatoria.actividades && convocatoria.actividades.length > 0 ? (
                  <div className="space-y-3">
                    {convocatoria.actividades.map((actividad: any) => (
                      <div key={actividad.id} className="p-4 bg-slate-50 rounded-xl">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900">{actividad.nombre}</h4>
                            {actividad.descripcion && (
                              <p className="text-sm text-slate-600 mt-1">{actividad.descripcion}</p>
                            )}
                            <div className="flex items-center gap-4 mt-3">
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <Clock className="w-3.5 h-3.5" />
                                {actividad.horas_estimadas} horas estimadas
                              </span>
                              <span className="flex items-center gap-1.5 text-xs text-slate-500">
                                <FileText className="w-3.5 h-3.5" />
                                {actividad._count?.reportes || 0} reportes
                              </span>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-xs font-medium",
                                actividad.esta_activa ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              )}>
                                {actividad.esta_activa ? 'Activa' : 'Inactiva'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-medium">No hay actividades registradas</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
