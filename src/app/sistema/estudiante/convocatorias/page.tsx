'use client';

import React, { useState } from 'react';
import { useConvocatorias } from '@/hooks/use-convocatorias';
import { usePostulaciones } from '@/hooks/use-postulaciones';
import { useAuth } from '@/hooks/use-auth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';
import { toast } from 'sonner';
import { useNotification } from '@/contexts/NotificationContext';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  Clock,
  Users,
  ChevronRight,
  Target,
  AlertCircle,
  CheckCircle,
  X,
  Briefcase
} from 'lucide-react';
import { Modalidad } from '@prisma/client';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export default function ConvocatoriasPage() {
  const { user } = useAuth();
  const {
    convocatorias,
    cargando,
    error,
    paginacion,
    filtros,
    actualizarFiltros,
    recargar,
    limpiarFiltros
  } = useConvocatorias(user?.id);

  const { addNotification } = useNotification();

  const { postular, cargando: cargandoPostulacion } = usePostulaciones();
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<string | null>(null);

  const handlePostular = async (idConvocatoria: string) => {
    if (!user?.id) return;

    setConvocatoriaSeleccionada(idConvocatoria);

    // Using sonner
    const postularPromise = postular({
      id_convocatoria: idConvocatoria,
      id_estudiante: user.id,
      motivacion: 'Estoy interesado en participar en esta convocatoria de servicio social.',
      habilidades_relevantes: [],
    });

    toast.promise(postularPromise, {
      loading: 'Enviando postulación...',
      success: (data) => {
        if (data.success) {
          recargar();
          setConvocatoriaSeleccionada(null);

          addNotification({
            title: 'Inscripción Exitosa',
            description: `Te has postulado correctamente a la convocatoria.`,
            type: 'success',
            href: '/estudiante/mis-postulaciones'
          });

          return "Postulación enviada correctamente";
        } else {
          setConvocatoriaSeleccionada(null);
          throw new Error('No se pudo completar la postulación');
        }
      },
      error: 'Error al enviar la postulación',
    });
  };

  const getModalidadVariant = (modalidad: string) => {
    switch (modalidad as Modalidad) {
      case 'PRESENCIAL': return 'info';
      case 'VIRTUAL': return 'success';
      case 'HIBRIDA': return 'warning';
      default: return 'default';
    }
  };

  const getCategoriaVariant = (categoria: string) => {
    // Basic assignment based on common categories
    const map: Record<string, 'info' | 'success' | 'warning' | 'error' | 'default'> = {
      'EDUCACIÓN': 'info',
      'SALUD': 'success',
      'MEDIO AMBIENTE': 'success',
      'DESARROLLO SOCIAL': 'warning',
      'TECNOLOGÍA': 'error',
    };
    return map[categoria] || 'default';
  };

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="w-16 h-16 text-rose-500 mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error al cargar convocatorias</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={recargar}
            className="px-6 py-2.5 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#a32424] transition"
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
        title="Convocatorias"
        description="Explora y postúlate a las oportunidades de servicio social disponibles."
      />

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-8 z-10 sticky top-20 transition-all">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={filtros.buscar}
              onChange={(e) => actualizarFiltros({ buscar: e.target.value })}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#8B1E1E]/20 text-slate-900 transition-shadow outline-none"
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={twMerge(clsx(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl transition-colors font-medium text-sm",
                mostrarFiltros || (filtros.categoria !== 'todas' || filtros.modalidad !== 'todas')
                  ? "bg-[#8B1E1E]/10 text-[#8B1E1E] hover:bg-[#8B1E1E]/15"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100"
              ))}
            >
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">Filtros</span>
            </button>

            {(filtros.buscar || filtros.categoria !== 'todas' || filtros.modalidad !== 'todas') && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors font-medium text-sm"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>

        {mostrarFiltros && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Modalidad</label>
              <select
                value={filtros.modalidad}
                onChange={(e) => actualizarFiltros({ modalidad: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none text-sm text-slate-800"
              >
                <option value="todas">Todas las modalidades</option>
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="HIBRIDA">Híbrida</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categoría</label>
              <select
                value={filtros.categoria}
                onChange={(e) => actualizarFiltros({ categoria: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none text-sm text-slate-800"
              >
                <option value="todas">Todas las categorías</option>
                <option value="EDUCACIÓN">Educación</option>
                <option value="SALUD">Salud</option>
                <option value="MEDIO AMBIENTE">Medio Ambiente</option>
                <option value="DESARROLLO SOCIAL">Desarrollo Social</option>
                <option value="TECNOLOGÍA">Tecnología</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => actualizarFiltros({ estado: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-[#8B1E1E]/20 outline-none text-sm text-slate-800"
              >
                <option value="PUBLICADA">Publicadas</option>
                <option value="EN_CURSO">En curso</option>
                <option value="CERRADA">Cerradas</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {cargando && convocatorias.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-[#8B1E1E] animate-spin" />
        </div>
      ) : convocatorias.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No hay convocatorias"
          description="Ajusta los filtros de búsqueda o vuelve más tarde para ver nuevas oportunidades."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {convocatorias.map((conv) => {
            const isFull = conv.cupo_maximo && conv._count.postulaciones >= conv.cupo_maximo;
            return (
              <div
                key={conv.id}
                className="group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-[#8B1E1E]/30 hover:shadow-lg transition-all duration-300 overflow-hidden relative"
              >
                {/* Status Badge Top Right */}
                {conv.ya_postulado && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-sm">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col">
                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {conv.categoria && (
                      <Badge variant={getCategoriaVariant(conv.categoria.nombre)}>
                        {conv.categoria.nombre}
                      </Badge>
                    )}
                    <Badge variant={getModalidadVariant(conv.modalidad)}>
                      {conv.modalidad}
                    </Badge>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#8B1E1E] transition-colors mb-2 line-clamp-2">
                    {conv.titulo}
                  </h3>
                  <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">
                    {conv.descripcion}
                  </p>

                  {/* Metadata */}
                  <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">{conv.total_horas_estimadas}h estimadas</span>
                    </div>
                    {conv.lugar && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        <span className="line-clamp-1 truncate">{conv.lugar}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{new Date(conv.fecha_inicio).toLocaleDateString('es-ES')} - {new Date(conv.fecha_fin!).toLocaleDateString('es-ES')}</span>
                    </div>
                    {conv.cupo_maximo && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="flex justify-between text-xs font-semibold mb-1/5 mb-1.5 text-slate-600">
                          <span>Cupos ({conv._count.postulaciones}/{conv.cupo_maximo})</span>
                        </div>
                        <ProgressBar value={conv._count.postulaciones} max={conv.cupo_maximo} showLabel={false} size="sm" colorClass={isFull ? 'bg-rose-500' : 'bg-[#8B1E1E]'} />
                      </div>
                    )}
                  </div>

                  {/* Action */}
                  <div className="mt-auto">
                    <button
                      onClick={() => handlePostular(conv.id)}
                      disabled={conv.ya_postulado || isFull || (cargandoPostulacion && convocatoriaSeleccionada === conv.id)}
                      className={twMerge(clsx(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-all duration-200",
                        conv.ya_postulado
                          ? "bg-emerald-50 text-emerald-600 cursor-not-allowed"
                          : isFull
                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                            : "bg-[#8B1E1E] text-white hover:bg-[#a32424] hover:shadow-md shadow-sm shadow-red-900/10"
                      ))}
                    >
                      {cargandoPostulacion && convocatoriaSeleccionada === conv.id ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Procesando...</span>
                        </>
                      ) : conv.ya_postulado ? (
                        <>
                          <span>Postulado</span>
                        </>
                      ) : isFull ? (
                        <span>Cupos agotados</span>
                      ) : (
                        <>
                          <span>Postularme</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {paginacion && paginacion.total_paginas > 1 && (
        <div className="mt-10 flex justify-center items-center gap-2">
          <button
            onClick={() => actualizarFiltros({ pagina: Math.max(1, filtros.pagina - 1) })}
            disabled={filtros.pagina === 1}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            Anterior
          </button>
          <span className="px-4 py-2 font-medium text-sm text-slate-500 bg-slate-50 rounded-xl">
            {filtros.pagina} de {paginacion.total_paginas}
          </span>
          <button
            onClick={() => actualizarFiltros({ pagina: Math.min(paginacion.total_paginas, filtros.pagina + 1) })}
            disabled={filtros.pagina === paginacion.total_paginas}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 disabled:opacity-50 font-medium text-sm transition-colors"
          >
            Siguiente
          </button>
        </div>
      )}
    </PageContainer>
  );
}
