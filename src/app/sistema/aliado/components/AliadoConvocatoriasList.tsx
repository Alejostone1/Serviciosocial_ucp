'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
    FileText, 
    Search, 
    Plus,
    ChevronRight,
    Loader2,
    Users,
    Activity,
    Calendar,
    X,
    Trash2,
    Clock,
    AlertCircle,
    CheckCircle2,
    Calendar as CalendarIcon,
    Target,
    ChevronLeft,
    Info,
    MapPin
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
    
    // Deep linking: Abrir modal si viene por parámetro de acción 'new'
    if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('action') === 'new') {
            setIsModalOpen(true);
            // Limpiar la URL sin recargar para evitar que se abra de nuevo al refrescar
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
        }
    }
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
          className="h-11 px-6 bg-[#8B1E1E] text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#A02424] transition-all shadow-lg shadow-red-900/10"
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
              className="group bg-white rounded-3xl border border-slate-100 p-6 hover:border-[#8B1E1E]/20 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-slate-50 rounded-xl text-slate-400 group-hover:bg-[#8B1E1E]/5 group-hover:text-[#8B1E1E] transition-colors">
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
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {new Date(convocatoria.creado_en).toLocaleDateString('es-CO')}
                  </span>
                  {convocatoria.publicador && (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      Por: {convocatoria.publicador.primer_nombre} {convocatoria.publicador.primer_apellido}
                    </span>
                  )}
                </div>
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
                className="flex items-center justify-center gap-2 h-11 bg-slate-50 text-slate-700 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#8B1E1E] hover:text-white transition-all border border-slate-100 hover:border-[#8B1E1E]"
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
  const [step, setStep] = useState(1);
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
    cupo_maximo: 20,
    horas_totales_ofrecidas: 80,
    requiere_entrevista: false,
    competencias_requeridas: [] as string[],
    actividades: [] as {nombre: string, tipo_actividad: string, horas_estimadas: number}[]
  });

  const [nuevaCompetencia, setNuevaCompetencia] = useState('');

  useEffect(() => {
    getOpcionesAliado().then(setOpciones);
  }, []);

  const horasAsignadas = useMemo(() => {
    return formData.actividades.reduce((total, act) => total + (act.horas_estimadas || 0), 0);
  }, [formData.actividades]);

  const horasRestantes = useMemo(() => {
    return (formData.horas_totales_ofrecidas || 0) - horasAsignadas;
  }, [formData.horas_totales_ofrecidas, horasAsignadas]);

  const porcentajeHoras = useMemo(() => {
    const totales = formData.horas_totales_ofrecidas || 1;
    return (horasAsignadas / totales) * 100;
  }, [horasAsignadas, formData.horas_totales_ofrecidas]);

  const handleAddActivity = () => {
    setFormData(prev => ({ ...prev, actividades: [...prev.actividades, { nombre: '', tipo_actividad: 'CAPACITACION', horas_estimadas: 2 }] }));
  };

  const handleRemoveActivity = (index: number) => {
    setFormData(prev => ({ ...prev, actividades: prev.actividades.filter((_, i) => i !== index) }));
  };

  const handleActivityChange = (index: number, field: 'nombre' | 'horas_estimadas', value: any) => {
    const newActividades = [...formData.actividades];
    newActividades[index] = { ...newActividades[index], [field]: value };
    setFormData(prev => ({ ...prev, actividades: newActividades }));
  };

  // Funciones para manejar competencias
  const agregarCompetencia = () => {
    if (nuevaCompetencia.trim()) {
      const competenciasActuales = formData.competencias_requeridas || [];
      if (!competenciasActuales.includes(nuevaCompetencia.trim())) {
        setFormData(prev => ({
          ...prev,
          competencias_requeridas: [...competenciasActuales, nuevaCompetencia.trim()]
        }));
        setNuevaCompetencia('');
      }
    }
  };

  const eliminarCompetencia = (index: number) => {
    const competenciasActuales = formData.competencias_requeridas || [];
    const nuevasCompetencias = competenciasActuales.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      competencias_requeridas: nuevasCompetencias
    }));
  };

  const handleSubmit = async (enviarARevision: boolean = true) => {
    if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio) {
      toast.error('Complete los campos obligatorios');
      return;
    }
    if (horasRestantes < 0) {
      toast.error('Las horas asignadas exceden las totales');
      return;
    }
    try {
      setLoading(true);
      await crearConvocatoriaAliado(formData, enviarARevision);
      toast.success(enviarARevision ? 'Convocatoria enviada para aprobación' : 'Convocatoria guardada como borrador');
      onSuccess();
    } catch (error) {
      toast.error('Error al crear convocatoria');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl p-8 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-xl hover:bg-slate-50"><X className="w-5 h-5 text-slate-400" /></button>
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-slate-900">Nueva Convocatoria</h3>
          <p className="text-slate-500 text-sm">Crea una oportunidad de servicio social.</p>
        </div>
        {/* Steps */}
        <div className="flex items-center justify-center gap-6 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center gap-2">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all", step === s ? "bg-[#8B1E1E] text-white" : step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400")}>
                  {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                </div>
                <span className={cn("text-[10px] uppercase font-bold", step === s ? "text-[#8B1E1E]" : "text-slate-300")}>
                  {s === 1 ? 'Basico' : s === 2 ? 'Fechas' : 'Actividades'}
                </span>
              </div>
              {s < 3 && <div className={cn("h-0.5 w-12", step > s ? "bg-emerald-500" : "bg-slate-100")} />}
            </React.Fragment>
          ))}
        </div>
        {/* Content */}
        <div className="min-h-[350px]">
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><FileText className="w-4 h-4 text-slate-400" />Titulo <span className="text-rose-500">*</span></label>
                <input type="text" value={formData.titulo} onChange={(e) => setFormData({...formData, titulo: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" placeholder="Ej: Programa de voluntariado" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Info className="w-4 h-4 text-slate-400" />Descripcion <span className="text-rose-500">*</span></label>
                <textarea value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} rows={4} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm resize-none" placeholder="Describe el proyecto..." />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" />Objetivo del Proyecto</label>
                <textarea value={formData.objetivo} onChange={(e) => setFormData({...formData, objetivo: e.target.value})} rows={2} className="w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm resize-none" placeholder="¿Cuál es el objetivo principal de esta convocatoria?" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" />Competencias Requeridas</label>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {formData.competencias_requeridas.map((competencia, index) => (
                      <span key={index} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {competencia}
                        <button type="button" onClick={() => eliminarCompetencia(index)} className="ml-1 text-blue-600 hover:text-blue-800">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevaCompetencia}
                      onChange={(e) => setNuevaCompetencia(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          agregarCompetencia();
                        }
                      }}
                      className="flex-1 h-12 bg-slate-50 border rounded-xl px-4 text-sm"
                      placeholder="Escribe una competencia y presiona Enter"
                    />
                    <button type="button" onClick={agregarCompetencia} className="px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#A02424] transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Programa</label>
                  <select value={formData.id_programa} onChange={(e) => setFormData({...formData, id_programa: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm">
                    <option value="">Seleccionar programa (opcional)</option>
                    {opciones.programas.map(prog => <option key={prog.id} value={prog.id}>{prog.nombre}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Categoria</label>
                  <select value={formData.id_categoria} onChange={(e) => setFormData({...formData, id_categoria: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm">
                    <option value="">Seleccionar...</option>
                    {opciones.categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-slate-400" />Lugar (opcional)</label>
                <input type="text" value={formData.lugar} onChange={(e) => setFormData({...formData, lugar: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" placeholder="Ej: Campus Principal, Sala de computación" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Modalidad</label>
                <select value={formData.modalidad} onChange={(e) => setFormData({...formData, modalidad: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm">
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Hibrida</option>
                </select>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" />Fecha Inicio <span className="text-rose-500">*</span></label>
                  <input type="date" value={formData.fecha_inicio} onChange={(e) => setFormData({...formData, fecha_inicio: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" />Cierre Postulacion</label>
                  <input type="date" value={formData.fecha_cierre_postulacion} onChange={(e) => setFormData({...formData, fecha_cierre_postulacion: e.target.value})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" />Cupo Maximo</label>
                  <input type="number" min={1} max={500} value={formData.cupo_maximo} onChange={(e) => setFormData({...formData, cupo_maximo: parseInt(e.target.value)})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold flex items-center gap-2"><Target className="w-4 h-4 text-slate-400" />Horas Ofrecidas</label>
                  <input type="number" min={1} max={500} value={formData.horas_totales_ofrecidas} onChange={(e) => setFormData({...formData, horas_totales_ofrecidas: parseInt(e.target.value)})} className="w-full h-12 bg-slate-50 border rounded-xl px-4 text-sm" />
                </div>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-[#8B1E1E]" /><span className="font-semibold">Control de Horas</span></div>
                  <span className={cn("text-sm font-bold", horasRestantes < 0 ? 'text-rose-600' : horasRestantes === 0 ? 'text-emerald-600' : 'text-amber-600')}>{Math.abs(horasRestantes)}h {horasRestantes < 0 ? 'excede' : horasRestantes === 0 ? 'completas' : 'restantes'}</span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden mb-2">
                  <div className={cn("h-full transition-all rounded-full", porcentajeHoras > 100 ? 'bg-rose-500' : porcentajeHoras === 100 ? 'bg-emerald-500' : 'bg-[#8B1E1E]')} style={{ width: `${Math.min(porcentajeHoras, 100)}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500"><span>0h</span><span>{horasAsignadas}h / {formData.horas_totales_ofrecidas || 0}h</span></div>
                {horasRestantes < 0 && <p className="text-xs text-rose-600 mt-2 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />Las actividades exceden las horas totales</p>}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">Desglosa las tareas del estudiante</p>
                <button onClick={handleAddActivity} className="h-10 px-4 bg-slate-100 rounded-lg font-semibold text-xs flex items-center gap-2 border"><Plus className="w-3.5 h-3.5" />Nueva Tarea</button>
              </div>
              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {formData.actividades.map((act, idx) => (
                  <div key={idx} className="p-4 bg-white border rounded-xl relative">
                    <button onClick={() => handleRemoveActivity(idx)} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-rose-500"><Trash2 className="w-4 h-4" /></button>
                    <div className="grid grid-cols-2 gap-3 pr-8">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Actividad</label>
                        <input value={act.nombre} onChange={(e) => handleActivityChange(idx, 'nombre', e.target.value)} className="w-full h-10 px-3 rounded-lg border text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Horas</label>
                        <input type="number" value={act.horas_estimadas} onChange={(e) => handleActivityChange(idx, 'horas_estimadas', parseInt(e.target.value) || 0)} className="w-full h-10 px-3 rounded-lg border text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.actividades.length === 0 && <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed"><Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" /><p className="text-sm text-slate-400">No hay actividades agregadas</p></div>}
              </div>
            </div>
          )}
        </div>
        {/* Buttons */}
        <div className="flex items-center justify-between pt-6 border-t mt-6">
          <button onClick={step === 1 ? onClose : () => setStep(step - 1)} className="flex items-center gap-2 px-6 h-11 font-semibold text-slate-400 hover:text-slate-900 text-sm">{step !== 1 && <ChevronLeft className="w-4 h-4" />}{step === 1 ? 'Cancelar' : 'Volver'}</button>
          {step === 3 ? (
            <div className="flex gap-3">
              <button onClick={() => handleSubmit(false)} disabled={loading} className="px-6 h-11 bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm border">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar Borrador'}</button>
              <button onClick={() => handleSubmit(true)} disabled={loading} className="px-6 h-11 bg-[#8B1E1E] text-white rounded-xl font-semibold text-sm flex items-center gap-2">{loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" />Enviar</>}</button>
            </div>
          ) : (
            <button onClick={() => setStep(step + 1)} className="px-6 h-11 bg-[#8B1E1E] text-white rounded-xl font-semibold text-sm flex items-center gap-2">Siguiente<ChevronRight className="w-4 h-4" /></button>
          )}
        </div>
      </div>
    </div>
  );
}
