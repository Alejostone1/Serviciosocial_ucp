'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  Users,
  Clock,
  Eye,
  Edit,
  Trash2,
  Activity,
  Target,
  Award,
  Settings,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  FileText,
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Play
} from 'lucide-react';
import { NuevaConvocatoriaIntegradaModal } from './nueva-convocatoria-integrada-modal';
import { EditarConvocatoriaModal } from './editar-convocatoria-modal';
import { GestionActividadesModal } from './gestion-actividades-modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { getConvocatoriasAdmin, eliminarConvocatoria, cambiarEstadoConvocatoria } from './convocatorias-actions';
import { toast } from 'sonner';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';

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
  actividades?: Array<{
    id: string;
    nombre: string;
    tipo_actividad: string;
    horas_estimadas: number;
    esta_activa: boolean;
  }>;
}

export function ConvocatoriasDashboardMejorado() {
  const searchParams = useSearchParams();
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReloading, setIsReloading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [filtroModalidad, setFiltroModalidad] = useState<string>('todos');
  const [showCrearModal, setShowCrearModal] = useState(false);
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [showGestionActividadesModal, setShowGestionActividadesModal] = useState(false);
  const [showEliminarConfirm, setShowEliminarConfirm] = useState(false);
  const [convocatoriaSeleccionada, setConvocatoriaSeleccionada] = useState<Convocatoria | null>(null);
  const [isEliminando, setIsEliminando] = useState(false);
  const [expandedConvocatorias, setExpandedConvocatorias] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Cargar convocatorias
  useEffect(() => {
    cargarConvocatorias();
  }, []);

  const cargarConvocatorias = async () => {
    try {
      if (convocatorias.length === 0) {
        setLoading(true); // Solo mostrar loading inicial
      } else {
        setIsReloading(true); // Mostrar recarga cuando hay datos
      }
      
      const data = await getConvocatoriasAdmin();
      setConvocatorias(data as Convocatoria[]);
    } catch (error) {
      toast.error('Error al cargar convocatorias');
      console.error(error);
    } finally {
      setLoading(false);
      setIsReloading(false);
    }
  };

  // Filtrar convocatorias
  const convocatoriasFiltradas = convocatorias.filter(convocatoria => {
    const coincideBusqueda = searchTerm === '' ||
      convocatoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convocatoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());

    const coincideEstado = filtroEstado === 'todos' || convocatoria.estado === filtroEstado;
    const coincideModalidad = filtroModalidad === 'todos' || convocatoria.modalidad === filtroModalidad;

    return coincideBusqueda && coincideEstado && coincideModalidad;
  });

  // Configuración de estados
  const estadoConfig: Record<string, { color: string; texto: string; icono: React.ReactNode }> = {
    BORRADOR: { color: 'bg-gray-100 text-gray-800', texto: 'Borrador', icono: <FileText className="w-4 h-4" /> },
    PUBLICADA: { color: 'bg-green-100 text-green-800', texto: 'Publicada', icono: <CheckCircle className="w-4 h-4" /> },
    EN_CURSO: { color: 'bg-blue-100 text-blue-800', texto: 'En Curso', icono: <Activity className="w-4 h-4" /> },
    CERRADA: { color: 'bg-purple-100 text-purple-800', texto: 'Cerrada', icono: <Award className="w-4 h-4" /> },
    CANCELADA: { color: 'bg-red-100 text-red-800', texto: 'Cancelada', icono: <XCircle className="w-4 h-4" /> },
  };

  const modalidadConfig: Record<Modalidad, { color: string; texto: string }> = {
    PRESENCIAL: { color: 'bg-blue-100 text-blue-800', texto: 'Presencial' },
    VIRTUAL: { color: 'bg-green-100 text-green-800', texto: 'Virtual' },
    HIBRIDA: { color: 'bg-purple-100 text-purple-800', texto: 'Híbrida' },
  };

  const toggleConvocatoriaExpansion = (id: string) => {
    setExpandedConvocatorias(prev =>
      prev.includes(id)
        ? prev.filter(convId => convId !== id)
        : [...prev, id]
    );
  };

  const formatearFecha = (fecha: string | Date) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calcularProgreso = (convocatoria: Convocatoria) => {
    if (!convocatoria.cupo_maximo) return 0;
    const postulaciones = convocatoria._count?.postulaciones || 0;
    return Math.round((postulaciones / convocatoria.cupo_maximo) * 100);
  };

  const totalHorasActividades = (convocatoria: Convocatoria) => {
    return convocatoria.actividades?.reduce((total, act) => total + act.horas_estimadas, 0) || 0;
  };

  const handleEliminarConvocatoria = async () => {
    if (!convocatoriaSeleccionada) return;

    try {
      setIsEliminando(true);
      const resultado = await eliminarConvocatoria(convocatoriaSeleccionada.id);
      
      if (resultado.success) {
        toast.success('Convocatoria eliminada correctamente');
        setShowEliminarConfirm(false);
        setConvocatoriaSeleccionada(null);
        cargarConvocatorias();
      } else {
        toast.error(resultado.message || 'Error al eliminar convocatoria');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al eliminar convocatoria');
    } finally {
      setIsEliminando(false);
    }
  };

  const handleCambiarEstado = async (convocatoria: Convocatoria, nuevoEstado: EstadoConvocatoria) => {
    try {
      const resultado = await cambiarEstadoConvocatoria(convocatoria.id, nuevoEstado);
      toast.success(`Convocatoria ${nuevoEstado.toLowerCase()} correctamente`);
      cargarConvocatorias();
    } catch (error: any) {
      toast.error(error.message || 'Error al cambiar estado');
    }
  };

  // Función para obtener los próximos estados disponibles
  const getEstadosDisponibles = (estadoActual: EstadoConvocatoria): EstadoConvocatoria[] => {
    switch (estadoActual) {
      case 'BORRADOR':
        return ['PUBLICADA', 'CANCELADA'];
      case 'PUBLICADA':
        return ['EN_CURSO', 'CANCELADA'];
      case 'EN_CURSO':
        return ['CERRADA', 'CANCELADA'];
      case 'CERRADA':
        return []; // Estado final
      case 'CANCELADA':
        return ['BORRADOR']; // Se puede reactivar a borrador
      default:
        return [];
    }
  };

  // Función para verificar si se puede eliminar
  const sePuedeEliminar = (convocatoria: Convocatoria): boolean => {
    return convocatoria.estado === 'BORRADOR' && (convocatoria._count?.postulaciones || 0) === 0;
  };

  const openEditarModal = (convocatoria: Convocatoria) => {
    setConvocatoriaSeleccionada(convocatoria);
    setShowEditarModal(true);
  };

  const openGestionActividadesModal = async (convocatoria: Convocatoria) => {
    // Necesitamos cargar la convocatoria completa para tener sus actividades
    setLoading(true);
    try {
      const { getConvocatoriaById } = await import('./convocatorias-actions');
      const data = await getConvocatoriaById(convocatoria.id);
      if (data) {
        setConvocatoriaSeleccionada(data as any);
        setShowGestionActividadesModal(true);
      }
    } catch (error) {
      toast.error('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  // Estadísticas
  const stats = {
    total: convocatorias.length,
    publicadas: convocatorias.filter(c => c.estado === 'PUBLICADA').length,
    enCurso: convocatorias.filter(c => c.estado === 'EN_CURSO').length,
    totalPostulaciones: convocatorias.reduce((total, c) => total + (c._count?.postulaciones || 0), 0),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-lg border border-gray-100">
            <div className="w-6 h-6 rounded-full border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] animate-spin"></div>
            <span className="text-lg font-medium text-gray-700">Cargando convocatorias...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Indicador de recarga */}
      {isReloading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-[#8B1E1E]/30 border-t-[#8B1E1E] animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Actualizando convocatorias...</span>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestión de Convocatorias</h1>
              <p className="mt-1 text-sm text-gray-600">
                Administra convocatorias y sus actividades asociadas
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex gap-3">
              <button
                onClick={() => setShowCrearModal(true)}
                className="inline-flex items-center px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Convocatoria
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-center transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-[#8B1E1E]" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Convocatorias</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 leading-none">{stats.total}</span>
              <span className="text-[10px] font-bold text-[#8B1E1E] uppercase bg-[#8B1E1E]/5 px-2 py-0.5 rounded-full">Registradas</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-center transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-[#8B1E1E]" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Publicadas</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 leading-none">{stats.publicadas}</span>
              <span className="text-[10px] font-bold text-[#8B1E1E] uppercase bg-[#8B1E1E]/5 px-2 py-0.5 rounded-full">Activas</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-center transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-3.5 h-3.5 text-[#8B1E1E]" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">En Curso</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 leading-none">{stats.enCurso}</span>
              <span className="text-[10px] font-bold text-[#8B1E1E] uppercase bg-[#8B1E1E]/5 px-2 py-0.5 rounded-full">Ejecutándose</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col justify-center transition-all hover:bg-gray-50/50">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-[#8B1E1E]" />
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Total Postulaciones</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-900 leading-none">{stats.totalPostulaciones}</span>
              <span className="text-[10px] font-bold text-[#8B1E1E] uppercase bg-[#8B1E1E]/5 px-2 py-0.5 rounded-full">Recibidas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar convocatorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
              {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
            </button>
          </div>

          {/* Filtros expandidos */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="BORRADOR">Borrador</option>
                  <option value="PUBLICADA">Publicada</option>
                  <option value="EN_CURSO">En Curso</option>
                  <option value="FINALIZADA">Finalizada</option>
                  <option value="CANCELADA">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Modalidad</label>
                <select
                  value={filtroModalidad}
                  onChange={(e) => setFiltroModalidad(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="todos">Todas las modalidades</option>
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de Convocatorias */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {convocatoriasFiltradas.length === 0 ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {convocatorias.length === 0 ? 'No hay convocatorias' : 'No se encontraron convocatorias'}
            </h2>
            <p className="text-gray-600 mb-8">
              {convocatorias.length === 0
                ? 'Comienza creando tu primera convocatoria con actividades integradas.'
                : 'Intenta ajustar los filtros de búsqueda para encontrar lo que buscas.'
              }
            </p>
            <button
              onClick={() => setShowCrearModal(true)}
              className="inline-flex items-center px-6 py-3 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Crear Primera Convocatoria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Vista de Tarjetas (Mobil) y Lista (Desktop) */}
            {convocatoriasFiltradas.map((convocatoria) => (
              <div key={convocatoria.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                {/* Header de la convocatoria */}
                <div
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex-1"
                  onClick={() => toggleConvocatoriaExpansion(convocatoria.id)}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-bold text-gray-900">{convocatoria.titulo}</h3>
                        <div className="flex gap-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border flex items-center gap-1 ${estadoConfig[convocatoria.estado]?.color}`}>
                            {estadoConfig[convocatoria.estado]?.icono}
                            {estadoConfig[convocatoria.estado]?.texto}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${modalidadConfig[convocatoria.modalidad]?.color}`}>
                            {modalidadConfig[convocatoria.modalidad]?.texto}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2 md:line-clamp-none">
                        {convocatoria.descripcion}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#8B1E1E]" />
                          <span className="font-medium">{formatearFecha(convocatoria.fecha_inicio)}</span>
                        </div>
                        {convocatoria.lugar && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3.5 h-3.5 text-[#8B1E1E]" />
                            <span className="truncate">{convocatoria.lugar}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#8B1E1E]" />
                          <span>{convocatoria._count?.postulaciones || 0} / {convocatoria.cupo_maximo || '∞'} cupos</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity className="w-3.5 h-3.5 text-[#8B1E1E]" />
                          <span>{convocatoria._count?.actividades || 0} actividades</span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 self-start pt-1">
                      {expandedConvocatorias.includes(convocatoria.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Barra de progreso simplificada para móvil siempre visible o expandida */}
                  {convocatoria.cupo_maximo && (
                    <div className="mt-5">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider">Ocupación de Cupos</span>
                        <span className="text-xs font-bold text-gray-900">
                          {calcularProgreso(convocatoria)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${calcularProgreso(convocatoria) > 90 ? 'bg-red-500' : 'bg-[#8B1E1E]'
                            }`}
                          style={{ width: `${Math.min(calcularProgreso(convocatoria), 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Acciones Rápidas - Siempre visibles con diseño premium */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => toggleConvocatoriaExpansion(convocatoria.id)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-[#8B1E1E] hover:text-[#8B1E1E] transition-all shadow-sm"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5" />
                      Ver Detalles
                    </button>
                    <button
                      onClick={() => openEditarModal(convocatoria)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1.5" />
                      Editar
                    </button>
                    <button
                      onClick={() => openGestionActividadesModal(convocatoria)}
                      className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-700 hover:border-purple-600 hover:text-purple-600 transition-all shadow-sm"
                    >
                      <Activity className="w-3.5 h-3.5 mr-1.5" />
                      Gestionar Actividades
                    </button>
                    
                    {/* Botones para cambiar estado */}
                    {getEstadosDisponibles(convocatoria.estado).map((estado) => (
                      <button
                        key={estado}
                        onClick={() => handleCambiarEstado(convocatoria, estado)}
                        className={`inline-flex items-center px-3 py-1.5 text-xs font-bold border rounded-lg transition-all shadow-sm ${
                          estado === 'PUBLICADA' 
                            ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-600 hover:text-green-600'
                            : estado === 'EN_CURSO'
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-600 hover:text-blue-600'
                            : estado === 'CERRADA'
                            ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-600 hover:text-purple-600'
                            : estado === 'CANCELADA'
                            ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 hover:border-red-600 hover:text-red-600'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-600 hover:text-gray-600'
                        }`}
                      >
                        {estado === 'PUBLICADA' && <Play className="w-3.5 h-3.5 mr-1.5" />}
                        {estado === 'EN_CURSO' && <Activity className="w-3.5 h-3.5 mr-1.5" />}
                        {estado === 'CERRADA' && <Award className="w-3.5 h-3.5 mr-1.5" />}
                        {estado === 'CANCELADA' && <XCircle className="w-3.5 h-3.5 mr-1.5" />}
                        {estado === 'BORRADOR' && <FileText className="w-3.5 h-3.5 mr-1.5" />}
                        {estado === 'PUBLICADA' ? 'Publicar' : 
                         estado === 'EN_CURSO' ? 'Iniciar' :
                         estado === 'CERRADA' ? 'Cerrar' :
                         estado === 'CANCELADA' ? 'Cancelar' : 'Restaurar'}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setConvocatoriaSeleccionada(convocatoria);
                      setShowEliminarConfirm(true);
                    }}
                    disabled={!sePuedeEliminar(convocatoria)}
                    className={`p-2 rounded-lg transition-all ${
                      sePuedeEliminar(convocatoria)
                        ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                        : 'text-gray-200 cursor-not-allowed opacity-50'
                    }`}
                    title={sePuedeEliminar(convocatoria) ? "Eliminar Convocatoria" : "Solo se pueden eliminar convocatorias en estado BORRADOR sin postulaciones"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Contenido expandido con diseño mejorado */}
                {expandedConvocatorias.includes(convocatoria.id) && (
                  <div className="border-t border-gray-100 p-6 bg-white animate-in slide-in-from-top-2 duration-300">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Información detallada */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            Propósito de la Convocatoria
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100 italic">
                            "{convocatoria.objetivo || 'Sin objetivo específico definido.'}"
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Cierre Postulación</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {convocatoria.fecha_cierre_postulacion ? formatearFecha(convocatoria.fecha_cierre_postulacion) : 'No definida'}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Finalización</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {convocatoria.fecha_fin ? formatearFecha(convocatoria.fecha_fin) : 'No definida'}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Categoría</span>
                            <span className="text-sm font-semibold text-gray-700">
                              {convocatoria.categoria?.nombre || 'General'}
                            </span>
                          </div>
                          <div className="p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                            <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Publicado por</span>
                            <span className="text-sm font-semibold text-gray-700 truncate">
                              {convocatoria.publicador?.primer_nombre} {convocatoria.publicador?.primer_apellido.charAt(0)}.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Lista de actividades express */}
                      <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Activity className="w-3 h-3" />
                            Actividades del Proyecto
                          </div>
                          <span className="text-blue-600 font-bold">{totalHorasActividades(convocatoria)}h totales</span>
                        </h4>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {convocatoria.actividades && convocatoria.actividades.length > 0 ? (
                            convocatoria.actividades.map((actividad) => (
                              <div key={actividad.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    {actividad.horas_estimadas}
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-bold text-gray-800">{actividad.nombre}</h5>
                                    <span className="text-[10px] font-medium text-gray-500 uppercase">{actividad.tipo_actividad}</span>
                                  </div>
                                </div>
                                {actividad.esta_activa ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-gray-300" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                              <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-xs text-gray-500 font-medium">Sin actividades definidas aún</p>
                              <button
                                onClick={() => openGestionActividadesModal(convocatoria)}
                                className="mt-3 text-xs font-bold text-[#8B1E1E] hover:underline"
                              >
                                + Agregar actividades
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <NuevaConvocatoriaIntegradaModal
        isOpen={showCrearModal}
        onClose={() => setShowCrearModal(false)}
        onSuccess={(nueva) => {
          toast.success('Convocatoria creada exitosamente');
          cargarConvocatorias();
          setShowCrearModal(false);
        }}
      />

      {convocatoriaSeleccionada && (
        <>
          <EditarConvocatoriaModal
            isOpen={showEditarModal}
            onClose={() => {
              setShowEditarModal(false);
              setConvocatoriaSeleccionada(null);
            }}
            convocatoria={convocatoriaSeleccionada as any}
            onSuccess={() => {
              cargarConvocatorias();
              setShowEditarModal(false);
              setConvocatoriaSeleccionada(null);
            }}
          />

          <GestionActividadesModal
            isOpen={showGestionActividadesModal}
            onClose={() => {
              setShowGestionActividadesModal(false);
              setConvocatoriaSeleccionada(null);
            }}
            convocatoria={convocatoriaSeleccionada as any}
            actividades={(convocatoriaSeleccionada as any).actividades || []}
            onSuccess={() => {
              cargarConvocatorias();
            }}
          />

          <ConfirmDialog
            isOpen={showEliminarConfirm}
            onClose={() => {
              setShowEliminarConfirm(false);
              setConvocatoriaSeleccionada(null);
            }}
            onConfirm={handleEliminarConvocatoria}
            title="Eliminar Convocatoria"
            description={`¿Estás seguro de que deseas eliminar la convocatoria "${convocatoriaSeleccionada.titulo}"? Esta acción eliminará también todas sus actividades vinculadas.`}
            confirmText="Sí, eliminar"
            cancelText="Cancelar"
            type="danger"
            isLoading={isEliminando}
          />
        </>
      )}
    </div>
  );
}
