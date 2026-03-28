'use client';

import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Search, 
    Plus,
    ChevronRight,
    Loader2,
    Users,
    Activity,
    Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConvocatoriasAliado, getOpcionesAliado, crearConvocatoriaAliado } from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  creado_en: string;
  modalidad: string;
  categoria: { nombre: string } | null;
  programa: { nombre: string } | null;
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

export function AliadoConvocatoriasList() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadConvocatorias = async () => {
    try {
      setLoading(true);
      const data = await getConvocatoriasAliado();
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
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 text-sm transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
            {['todos', 'PUBLICADA', 'BORRADOR', 'EN_CURSO'].map((st) => (
                <button
                    key={st}
                    onClick={() => setFilterEstado(st)}
                    className={cn(
                        "flex-1 sm:flex-none px-4 py-1.5 rounded-lg text-xs font-semibold transition-all uppercase tracking-tight",
                        filterEstado === st ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    )}
                >
                    {st === 'todos' ? 'Todas' : st.replace('_', ' ')}
                </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-11 px-6 bg-[#1E3A8A] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/10"
        >
          <Plus className="w-4 h-4" /> Nueva Convocatoria
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-slate-300 animate-spin mb-4" />
          <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Cargando convocatorias...</p>
        </div>
      ) : filteredConvocatorias.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredConvocatorias.map((convocatoria) => (
            <div
              key={convocatoria.id}
              className="group bg-white rounded-3xl border border-slate-100 p-6 hover:border-[#1E3A8A]/20 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#1E3A8A]/5 group-hover:text-[#1E3A8A] transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className={cn(
                      "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                      getEstadoStyles(convocatoria.estado)
                    )}>
                      {convocatoria.estado.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {new Date(convocatoria.creado_en).toLocaleDateString('es-CO')}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1">{convocatoria.titulo}</h3>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{convocatoria.descripcion}</p>

              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-slate-100">
                  {convocatoria.modalidad}
                </span>
                {convocatoria.categoria && (
                  <span className="px-3 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold uppercase tracking-tight border border-slate-100">
                    {convocatoria.categoria.nombre}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Postulaciones</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{convocatoria._count.postulaciones}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Activity className="w-3.5 h-3.5" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Actividades</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900">{convocatoria._count.actividades}</span>
                </div>
              </div>

              <Link
                href={`/sistema/aliado/convocatorias/${convocatoria.id}`}
                className="flex items-center justify-center gap-2 h-11 bg-slate-50 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1E3A8A] hover:text-white transition-all border border-slate-100 hover:border-[#1E3A8A]"
              >
                Gestionar Convocatoria <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-40 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
            <FileText className="w-8 h-8 text-slate-200" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Sin Convocatorias</h3>
          <p className="text-slate-400 max-w-xs mx-auto font-medium">
            No se encontraron convocatorias {filterEstado !== 'todos' ? `con estado ${filterEstado}` : ''}.
          </p>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <NuevaConvocatoriaModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadConvocatorias();
          }}
        />
      )}
    </div>
  );
}

function NuevaConvocatoriaModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [opciones, setOpciones] = useState<{categorias: any[], programas: any[]}>({ categorias: [], programas: [] });
  const [formData, setFormData] = useState({
    titulo: '',
    descripcion: '',
    objetivo: '',
    id_categoria: '',
    id_programa: '',
    modalidad: 'PRESENCIAL',
    lugar: '',
    fecha_inicio: '',
    fecha_fin: '',
    fecha_cierre_postulacion: '',
    cupo_maximo: 0,
    horas_totales_ofrecidas: 0,
    requiere_entrevista: false,
    competencias_requeridas: [] as string[]
  });

  useEffect(() => {
    getOpcionesAliado().then(setOpciones);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    try {
      setLoading(true);
      await crearConvocatoriaAliado(formData);
      toast.success('Convocatoria creada exitosamente');
      onSuccess();
    } catch (error) {
      toast.error('Error al crear convocatoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50 transition-colors">
          <Plus className="w-5 h-5 text-slate-400 rotate-45" />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-900">Nueva Convocatoria</h3>
          <p className="text-slate-500 text-sm">Publica una nueva oportunidad de servicio social.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Título *</label>
            <input
              type="text"
              value={formData.titulo}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
              placeholder="Ej: Programa de voluntariado ambiental"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Descripción *</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 min-h-[100px] transition-all"
              placeholder="Describe el proyecto y sus objetivos..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Modalidad</label>
              <select
                value={formData.modalidad}
                onChange={(e) => setFormData({ ...formData, modalidad: e.target.value })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
              >
                <option value="PRESENCIAL">Presencial</option>
                <option value="VIRTUAL">Virtual</option>
                <option value="HIBRIDA">Híbrida</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Categoría</label>
              <select
                value={formData.id_categoria}
                onChange={(e) => setFormData({ ...formData, id_categoria: e.target.value })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
              >
                <option value="">Seleccionar...</option>
                {opciones.categorias.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Inicio *</label>
              <input
                type="date"
                value={formData.fecha_inicio}
                onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fecha Cierre Postulación</label>
              <input
                type="date"
                value={formData.fecha_cierre_postulacion}
                onChange={(e) => setFormData({ ...formData, fecha_cierre_postulacion: e.target.value })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cupo Máximo</label>
              <input
                type="number"
                value={formData.cupo_maximo}
                onChange={(e) => setFormData({ ...formData, cupo_maximo: parseInt(e.target.value) })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
                placeholder="Ej: 20"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas Totales Ofrecidas</label>
              <input
                type="number"
                value={formData.horas_totales_ofrecidas}
                onChange={(e) => setFormData({ ...formData, horas_totales_ofrecidas: parseInt(e.target.value) })}
                className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all"
                placeholder="Ej: 120"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-[#1E3A8A] text-white rounded-2xl text-sm font-bold uppercase tracking-wider hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {loading ? 'Creando...' : 'Crear Convocatoria'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
