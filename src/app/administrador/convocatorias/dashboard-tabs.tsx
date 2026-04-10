'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  List,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Trash2,
  Activity,
  CalendarDays,
  Clock,
  Users,
  Building2,
} from 'lucide-react';
import dynamic from 'next/dynamic';

const NuevaConvocatoriaIntegradaModal = dynamic(() => import('./nueva-convocatoria-integrada-modal').then(mod => mod.NuevaConvocatoriaIntegradaModal), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse bg-slate-50 border border-dashed border-slate-200 rounded-xl" />
});

const EditarConvocatoriaModal = dynamic(() => import('./editar-convocatoria-modal').then(mod => mod.EditarConvocatoriaModal), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse bg-slate-50 border border-dashed border-slate-200 rounded-xl" />
});

const GestionActividadesModal = dynamic(() => import('./gestion-actividades-modal').then(mod => mod.GestionActividadesModal), {
  ssr: false,
  loading: () => <div className="h-10 animate-pulse bg-slate-50 border border-dashed border-slate-200 rounded-xl" />
});
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getConvocatoriasAdmin, eliminarConvocatoria, cambiarEstadoConvocatoria } from './convocatorias-actions';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';
import { toast } from 'sonner';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  modalidad: Modalidad;
  lugar?: string | null;
  estado: EstadoConvocatoria;
  fecha_inicio: string | Date;
  fecha_fin?: string | Date | null;
  fecha_cierre_postulacion?: string | Date | null;
  cupo_maximo?: number | null;
  cupo_disponible?: number | null;
  horas_totales_ofrecidas?: number | null;
  creado_en: string | Date;
  objetivo?: string | null;
  categoria?: {
    id: string;
    nombre: string;
    color_hex?: string | null;
  };
  programa?: {
    id: string;
    nombre: string;
    codigo: string;
  };
  publicador?: {
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
  };
  _count?: {
    postulaciones: number;
    actividades: number;
  };
  actividades?: any[];
}

const ITEMS_PER_PAGE = 8;

export function ConvocatoriasDashboardTabs({ initialData = [] }: { initialData?: Convocatoria[] }) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'todas' | 'activas' | 'borrador' | 'desactivadas'>('todas');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);

  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showGestionActividadesModal, setShowGestionActividadesModal] = useState(false);
  const [showEliminarConfirm, setShowEliminarConfirm] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<Convocatoria | null>(null);
  const [isEliminando, setIsEliminando] = useState(false);

  // Se mantiene solo para refrescos bajo demanda (cargarConvocatorias)
  // No se ejecuta al montar porque tenemos initialData

  const cargarConvocatorias = async () => {
    try {
      setLoading(true);
      const data = await getConvocatoriasAdmin();
      setConvocatorias(data as Convocatoria[]);
    } catch (error) {
      toast.error('Error al cargar convocatorias');
    } finally {
      setLoading(false);
    }
  };

  const filtradas = convocatorias.filter(conv => {
    const busqueda = searchTerm.toLowerCase();
    const coincide = conv.titulo.toLowerCase().includes(busqueda) ||
      conv.descripcion.toLowerCase().includes(busqueda) ||
      (conv.programa?.nombre || '').toLowerCase().includes(busqueda);

    if (activeTab === 'activas') return coincide && ['PUBLICADA', 'EN_CURSO'].includes(conv.estado);
    if (activeTab === 'borrador') return coincide && conv.estado === 'BORRADOR';
    if (activeTab === 'desactivadas') return coincide && ['CERRADA', 'CANCELADA'].includes(conv.estado);
    return coincide;
  });

  const totalPages = Math.ceil(filtradas.length / ITEMS_PER_PAGE);
  const paginadas = filtradas.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = {
    todas: convocatorias.length,
    activas: convocatorias.filter(c => ['PUBLICADA', 'EN_CURSO'].includes(c.estado)).length,
    borrador: convocatorias.filter(c => c.estado === 'BORRADOR').length,
    desactivadas: convocatorias.filter(c => ['CERRADA', 'CANCELADA'].includes(c.estado)).length,
  };

  const handleCambiarEstado = async (id: string, nuevoEstado: EstadoConvocatoria) => {
    try {
      await cambiarEstadoConvocatoria(id, nuevoEstado);
      toast.success(`Estado actualizado`);
      cargarConvocatorias();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  const handleEliminar = async () => {
    if (!convocatoriaSeleccionada) return;
    try {
      setIsEliminando(true);
      const res = await eliminarConvocatoria(convocatoriaSeleccionada.id);
      if (res.success) {
        toast.success('Convocatoria eliminada');
        setShowEliminarConfirm(false);
        cargarConvocatorias();
      } else {
        toast.error(res.message);
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsEliminando(false);
    }
  };

  const getEstadosDisponibles = (estadoActual: EstadoConvocatoria): EstadoConvocatoria[] => {
    switch (estadoActual) {
      case 'BORRADOR': return ['PUBLICADA', 'CANCELADA'];
      case 'PUBLICADA': return ['EN_CURSO', 'CANCELADA'];
      case 'EN_CURSO': return ['CERRADA', 'CANCELADA'];
      case 'CERRADA': return [];
      case 'CANCELADA': return ['BORRADOR'];
      default: return [];
    }
  };

  const sePuedeEliminar = (c: Convocatoria): boolean => {
    const permitidos = ['BORRADOR', 'CERRADA', 'CANCELADA'];
    return permitidos.includes(c.estado) && (c._count?.postulaciones || 0) === 0;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <InstitutionalLoader />
        <p className="mt-4 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] animate-pulse">Cargando Convocatorias...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Header Tipográfico */}
        <div className="border-b border-stone-200 pb-4 mb-6">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.25em] mb-1">Administración</p>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Convocatorias</h1>
          <p className="text-sm text-stone-500 mt-1">Gestión de proyectos de servicio social</p>
        </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'todas', label: 'Todas', count: stats.todas },
            { id: 'activas', label: 'Activas', count: stats.activas },
            { id: 'borrador', label: 'Borrador', count: stats.borrador },
            { id: 'desactivadas', label: 'Desactivadas', count: stats.desactivadas },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id as any); setCurrentPage(1); }}
              className={cn(
                "relative px-4 py-3 text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap",
                activeTab === tab.id ? "text-[#8B1E1E] font-bold" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {tab.label}
              <span className={cn(
                "text-[10px] px-1.5 py-0.5 rounded-full",
                activeTab === tab.id ? "bg-[#8B1E1E] text-white" : "bg-slate-100 text-slate-500"
              )}>
                {tab.count}
              </span>
              {activeTab === tab.id && (
                <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8B1E1E]" />
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCrearModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] rounded-lg text-sm font-semibold text-white hover:bg-[#731919] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Crear Convocatoria
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#8B1E1E] w-48 lg:w-64 transition-all font-light"
            />
          </div>
          <div className="flex items-center p-1 bg-slate-100 rounded-lg">
            <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400")}><List className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white text-[#8B1E1E] shadow-sm" : "text-slate-400")}><LayoutGrid className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="min-h-[400px]">
        {filtradas.length === 0 ? (
          <div className="py-20 text-center text-slate-400 italic font-light">
            No se encontraron registros.
          </div>
        ) : (
          <div className={cn(
            "grid gap-5",
            viewMode === 'list' ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          )}>
            {paginadas.map((conv) => (
              viewMode === 'list'
                ? <OriginalListCard
                  key={conv.id}
                  conv={conv}
                  onEdit={() => { setConvocatoriaSeleccionada(conv); setShowEditarModal(true); }}
                  onManage={() => { setConvocatoriaSeleccionada(conv); setShowGestionActividadesModal(true); }}
                  onStatus={(s: any) => handleCambiarEstado(conv.id, s)}
                  getEstadosDisponibles={getEstadosDisponibles}
                  onDelete={() => { setConvocatoriaSeleccionada(conv); setShowEliminarConfirm(true); }}
                  sePuedeEliminar={sePuedeEliminar(conv)}
                />
                : <ElegantGridCard
                  key={conv.id}
                  conv={conv}
                  onEdit={() => { setConvocatoriaSeleccionada(conv); setShowEditarModal(true); }}
                  onManage={() => { setConvocatoriaSeleccionada(conv); setShowGestionActividadesModal(true); }}
                  onStatus={(s: any) => handleCambiarEstado(conv.id, s)}
                  getEstadosDisponibles={getEstadosDisponibles}
                />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-6">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 border border-slate-200 rounded-md disabled:opacity-20 transition-all hover:bg-slate-50"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={cn("w-8 h-8 rounded text-xs font-bold transition-all", currentPage === i + 1 ? "bg-[#8B1E1E] text-white" : "text-slate-500 hover:bg-slate-100")}>{i + 1}</button>
            ))}
          </div>
          <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 border border-slate-200 rounded-md disabled:opacity-20 transition-all hover:bg-slate-50"><ChevronRight className="w-4 h-4" /></button>
        </div>
      )}

      <NuevaConvocatoriaIntegradaModal isOpen={showCrearModal} onClose={() => setShowCrearModal(false)} onSuccess={cargarConvocatorias} />
      <EditarConvocatoriaModal isOpen={showEditarModal} onClose={() => setShowEditarModal(false)} convocatoria={convocatoriaSeleccionada as any} onSuccess={cargarConvocatorias} />
      <GestionActividadesModal isOpen={showGestionActividadesModal} onClose={() => setShowGestionActividadesModal(false)} convocatoria={convocatoriaSeleccionada as any} actividades={convocatoriaSeleccionada?.actividades || []} onSuccess={cargarConvocatorias} />
      <ConfirmDialog isOpen={showEliminarConfirm} onClose={() => setShowEliminarConfirm(false)} onConfirm={handleEliminar} title="Eliminar" description={`¿Estás seguro de eliminar "${convocatoriaSeleccionada?.titulo}"?`} type="danger" isLoading={isEliminando} />
    </div>
  );
}

const OriginalListCard = ({ conv, onEdit, onManage, onStatus, getEstadosDisponibles, onDelete, sePuedeEliminar }: any) => {
  const formatearFecha = (f: any) => new Date(f).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
  const proximosEstados = getEstadosDisponibles(conv.estado);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all">
      <div className="p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900 leading-tight">{conv.titulo}</h3>
              <div className="flex gap-2">
                <StatusBadge status={conv.estado} />
                <span className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-100 rounded text-[10px] font-bold uppercase tracking-wider">{conv.modalidad}</span>
              </div>
            </div>

            <p className="text-sm font-light text-slate-500 line-clamp-2 leading-relaxed">
              {conv.descripcion}
            </p>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 pt-2 text-[11px] text-slate-500">
              <div>
                <span className="text-stone-400">Inicio:</span> {formatearFecha(conv.fecha_inicio)}
              </div>
              <div>
                <span className="text-stone-400">Horas:</span> {conv.horas_totales_ofrecidas || 0}h
              </div>
              <div>
                <span className="text-stone-400">Cupos:</span> {conv._count?.postulaciones || 0}/{conv.cupo_maximo || '∞'}
              </div>
              <div>
                <span className="text-stone-400">Programa:</span> {conv.programa?.nombre || 'General'}
              </div>
            </div>

            {/* Publicador */}
            {conv.publicador && (
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                <div className="px-2 py-1 bg-[#8B1E1E]/10 rounded text-[10px] font-bold text-[#8B1E1E] uppercase">
                  {conv.publicador.rol}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-700 truncate">
                    {conv.publicador.primer_nombre} {conv.publicador.primer_apellido}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 min-w-[180px]">
            <div className="flex items-center justify-end gap-1 border-b border-slate-50 pb-2 text-xs">
              <Link href={`/administrador/convocatorias/${conv.id}`} className="px-3 py-1.5 text-slate-500 hover:text-[#8B1E1E] hover:bg-stone-50 rounded transition-colors" title="Ver">Ver</Link>
              <button onClick={onManage} className="px-3 py-1.5 text-slate-500 hover:text-[#8B1E1E] hover:bg-stone-50 rounded transition-colors" title="Actividades">Act.</button>
              <button onClick={onEdit} className="px-3 py-1.5 text-slate-500 hover:text-[#8B1E1E] hover:bg-stone-50 rounded transition-colors" title="Editar">Editar</button>
              <button
                onClick={onDelete}
                disabled={!sePuedeEliminar}
                className={cn("px-3 py-1.5 rounded transition-colors", sePuedeEliminar ? "text-slate-500 hover:text-red-600 hover:bg-red-50" : "text-slate-300 cursor-not-allowed")}
                title="Eliminar"
              >
                Elim.
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 justify-end">
              {proximosEstados.map((estado: any) => (
                <button
                  key={estado}
                  onClick={() => onStatus(estado)}
                  className={cn(
                    "px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all border",
                    estado === 'PUBLICADA' ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-600 hover:text-white" :
                      estado === 'EN_CURSO' ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white" :
                        estado === 'CERRADA' ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white" :
                          "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-600 hover:text-white"
                  )}
                >
                  {estado === 'PUBLICADA' ? 'Publicar' : estado === 'EN_CURSO' ? 'Iniciar' : estado === 'CERRADA' ? 'Cerrar' : estado === 'CANCELADA' ? 'Cancelar' : 'Borrador'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ElegantGridCard = ({ conv, onEdit, onManage, onStatus, getEstadosDisponibles }: any) => {
  const proximosEstados = getEstadosDisponibles(conv.estado);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-all flex flex-col group h-full">
      <div className="p-5 flex-1 space-y-4">
        <div className="flex justify-between items-start">
          <StatusBadge status={conv.estado} />
          <p className="text-[10px] font-bold text-slate-300 uppercase leading-none tracking-widest">{conv.modalidad}</p>
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-semibold text-slate-800 group-hover:text-[#8B1E1E] transition-colors line-clamp-2 min-h-[3rem]">
            {conv.titulo}
          </h3>
          <p className="text-[11px] font-light text-slate-400 uppercase tracking-tighter truncate">
            {conv.programa?.nombre || 'General Academic'}
          </p>
        </div>

        <p className="text-xs font-light text-slate-500 line-clamp-2 leading-relaxed h-8">
          {conv.descripcion}
        </p>

        {/* Publicador */}
        {conv.publicador && (
          <div className="flex items-center gap-2 py-2 border-t border-slate-50">
            <div className="px-2 py-1 bg-[#8B1E1E]/10 rounded text-[10px] font-bold text-[#8B1E1E] uppercase">
              {conv.publicador.rol}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-slate-700 truncate">
                {conv.publicador.primer_nombre} {conv.publicador.primer_apellido}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-50 pt-4">
          <div className="flex items-center gap-3">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-light uppercase">Cupos</p>
              <p className="text-xs font-semibold text-slate-700">{conv._count?.postulaciones}/{conv.cupo_maximo || '∞'}</p>
            </div>
            <div className="w-px h-6 bg-slate-100" />
            <div className="text-center">
              <p className="text-[10px] text-slate-400 font-light uppercase">Horas</p>
              <p className="text-xs font-semibold text-[#8B1E1E]">{conv.horas_totales_ofrecidas}h</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 bg-slate-50 focus-within:bg-slate-100 transition-colors">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2">
          {proximosEstados.map((estado: any) => (
            <button
              key={estado}
              onClick={() => onStatus(estado)}
              className="flex-shrink-0 px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-bold uppercase text-slate-600 hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all"
            >
              {estado === 'PUBLICADA' ? 'Publicar' : estado === 'EN_CURSO' ? 'Iniciar' : 'Siguiente'}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 border-t border-slate-200 pt-3 text-xs">
          <Link href={`/administrador/convocatorias/${conv.id}`} className="flex items-center justify-center py-2 bg-white rounded border border-slate-200 text-slate-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]">Ver</Link>
          <button onClick={onManage} className="flex items-center justify-center py-2 bg-white rounded border border-slate-200 text-slate-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]">Act.</button>
          <button onClick={onEdit} className="flex items-center justify-center py-2 bg-white rounded border border-slate-200 text-slate-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]">Editar</button>
        </div>
      </div>
    </div>
  );
};
