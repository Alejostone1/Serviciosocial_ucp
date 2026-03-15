'use client';

import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Users, 
    Activity, 
    Eye, 
    Search, 
    Filter, 
    Plus, 
    MoreHorizontal,
    Clock,
    Tag,
    User,
    ChevronRight,
    Loader2,
    Building2
} from 'lucide-react';
import Link from 'next/link';
import { getConvocatoriasAuxiliar } from '@/app/sistema/auxiliar/convocatorias/actions';
import { NuevaConvocatoriaAuxiliarModal } from '@/app/sistema/auxiliar/convocatorias/nueva-convocatoria-modal';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_inicio: Date | string;
  fecha_fin?: Date | string;
  fecha_cierre_postulacion?: Date | string;
  cupo_maximo?: number;
  cupo_disponible?: number;
  horas_totales_ofrecidas?: number;
  programa: {
    id: string;
    nombre: string;
    codigo: string;
  };
  categoria?: {
    id: string;
    nombre: string;
    color_hex?: string;
  };
  publicador: {
    primer_nombre: string;
    primer_apellido: string;
    rol: string;
  };
  _count: {
    postulaciones: number;
    actividades: number;
  };
}

export function AuxiliarConvocatoriasList() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadConvocatorias = async () => {
    try {
      setLoading(true);
      const data = await getConvocatoriasAuxiliar();
      setConvocatorias(data as any);
    } catch (error) {
      console.error('Error loading convocatorias:', error);
      toast.error('No se pudieron cargar las convocatorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConvocatorias();
  }, []);

  const filteredConvocatorias = convocatorias.filter(convocatoria => {
    const matchesSearch = convocatoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         convocatoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || convocatoria.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const getEstadoStyles = (estado: string) => {
    switch (estado) {
      case 'BORRADOR': return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'PUBLICADA': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'EN_CURSO': return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'CERRADA': return 'bg-rose-50 text-rose-700 border-rose-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between px-2">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-80 group">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['todos', 'PUBLICADA', 'BORRADOR', 'EN_CURSO'].map((st) => (
                <button
                    key={st}
                    onClick={() => setFilterEstado(st)}
                    className={cn(
                        "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase tracking-tight",
                        filterEstado === st 
                        ? 'bg-white text-slate-900 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'
                    )}
                >
                    {st === 'todos' ? 'Todas' : st === 'PUBLICADA' ? 'Publicadas' : st === 'BORRADOR' ? 'Borradores' : 'En Curso'}
                </button>
            ))}
          </div>
        </div>

        <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto h-11 px-6 bg-[#8B1E1E] text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-[#a32424] transition-all shadow-md shadow-[#8B1E1E]/10"
        >
            <Plus className="w-4 h-4" />
            Nueva Convocatoria
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
            <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
            <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Cargando convocatorias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredConvocatorias.map((conv) => (
            <div key={conv.id} className="group bg-white rounded-2xl border border-slate-100 transition-all duration-300 hover:border-[#8B1E1E]/20 flex flex-col relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/50">
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-5">
                  <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border", getEstadoStyles(conv.estado))}>
                    {conv.estado}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase tracking-tighter">
                        {conv.publicador.rol === 'AUXILIAR' ? 'Mi creación' : `${conv.publicador.primer_nombre} (${conv.publicador.rol})`}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-[#8B1E1E] transition-colors">
                  {conv.titulo}
                </h3>

                <p className="text-slate-500 text-sm mb-6 line-clamp-2 font-normal leading-relaxed">
                  {conv.descripcion}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                        <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-medium">Inicio</p>
                        <p className="text-slate-700 font-bold">{new Date(conv.fecha_inicio).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                        <p className="text-slate-400 font-medium">Cupos</p>
                        <p className="text-slate-700 font-bold">{conv.cupo_disponible || 0}/{conv.cupo_maximo || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-slate-500">
                            <Activity className="w-4 h-4 text-[#8B1E1E]" />
                            <span className="text-xs font-bold">{conv._count.actividades} <span className="text-slate-400 font-medium">Actividades</span></span>
                        </div>
                    </div>
                    <Link
                        href={`/sistema/auxiliar/convocatorias/${conv.id}`}
                        className="flex items-center gap-1.5 py-2 px-4 rounded-lg bg-slate-50 text-slate-900 font-bold text-xs hover:bg-[#8B1E1E] hover:text-white transition-all border border-slate-100"
                    >
                        Gestionar
                        <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredConvocatorias.length === 0 && (
        <div className="text-center py-40 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <Building2 className="h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No se encontraron proyectos</h3>
          <p className="text-slate-400 max-w-sm mx-auto mb-8 font-medium">
            No hay convocatorias que coincidan con tu búsqueda. ¿Deseas crear una nueva para el sistema?
          </p>
          <button 
                onClick={() => setIsModalOpen(true)}
                className="h-11 px-8 bg-[#8B1E1E] text-white rounded-xl font-semibold hover:bg-[#a32424] transition-all shadow-md shadow-[#8B1E1E]/10"
          >
                Crear nueva convocatoria
          </button>
        </div>
      )}

      <NuevaConvocatoriaAuxiliarModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={loadConvocatorias}
      />
    </div>
  );
}
