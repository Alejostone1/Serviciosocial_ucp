'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Activity,
  Clock,
  Calendar,
  MapPin,
  Target,
  Settings,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FileText,
  Package,
  Users
} from 'lucide-react';
import { TipoActividad } from '@prisma/client';

// Schema para actividad
const actividadSchema = z.object({
  nombre: z.string().min(5, 'Mínimo 5 caracteres').max(200),
  descripcion: z.string().optional().or(z.literal('')),
  tipo_actividad: z.nativeEnum(TipoActividad),
  horas_estimadas: z.coerce.number().min(1, 'Mínimo 1 hora').max(1000),
  horas_maximas: z.coerce.number().optional().or(z.literal(0)),
  fecha_inicio: z.string().optional().or(z.literal('')),
  fecha_limite: z.string().optional().or(z.literal('')),
  ubicacion: z.string().max(200).optional().or(z.literal('')),
  materiales_requeridos: z.array(z.string()).default([]),
  esta_activa: z.boolean().default(true),
});

type ActividadFormData = z.infer<typeof actividadSchema>;

interface Actividad {
  id: string;
  nombre: string;
  descripcion: string | null;
  tipo_actividad: TipoActividad;
  horas_estimadas: number;
  horas_maximas: number | null;
  fecha_inicio: string | null;
  fecha_limite: string | null;
  ubicacion: string | null;
  materiales_requeridos: string[];
  esta_activa: boolean;
  creado_en: string;
  convocatoria?: {
    id: string;
    titulo: string;
    modalidad: string;
  };
  _count?: {
    reportes: number;
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  convocatoria: {
    id: string;
    titulo: string;
    modalidad: string;
    horas_totales_ofrecidas?: number;
  };
  actividades: Actividad[];
  onSuccess: (actividad: any) => void;
}

const tipoActividadOptions: { value: TipoActividad; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'GENERAL', label: 'General', icon: <Activity className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'CAPACITACION', label: 'Capacitación', icon: <Target className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  { value: 'CAMPO', label: 'Trabajo de Campo', icon: <MapPin className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
  { value: 'ADMINISTRATIVA', label: 'Labor Administrativa', icon: <Settings className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
  { value: 'INVESTIGACION', label: 'Investigación', icon: <FileText className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
  { value: 'COMUNITARIA', label: 'Labor Comunitaria', icon: <Users className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
];

export function GestionActividadesModal({ isOpen, onClose, convocatoria, actividades, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [editingActividad, setEditingActividad] = useState<Actividad | null>(null);
  const [expandedActivities, setExpandedActivities] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ActividadFormData>({
    resolver: zodResolver(actividadSchema),
    defaultValues: {
      tipo_actividad: 'GENERAL',
      esta_activa: true,
      materiales_requeridos: [],
    },
  });

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      reset();
      setEditingActividad(null);
    }
  }, [isOpen, reset]);

  // Cargar datos para editar
  useEffect(() => {
    if (editingActividad) {
      reset({
        nombre: editingActividad?.nombre || '',
        descripcion: editingActividad?.descripcion || '',
        tipo_actividad: editingActividad?.tipo_actividad || 'GENERAL',
        horas_estimadas: editingActividad?.horas_estimadas || 0,
        horas_maximas: editingActividad?.horas_maximas || 0,
        fecha_inicio: editingActividad?.fecha_inicio || '',
        fecha_limite: editingActividad?.fecha_limite || '',
        ubicacion: editingActividad?.ubicacion || '',
        materiales_requeridos: editingActividad?.materiales_requeridos || [],
        esta_activa: editingActividad?.esta_activa ?? true,
      });
    }
  }, [editingActividad, reset]);

  const onSubmit = async (values: ActividadFormData) => {
    try {
      setIsLoading(true);

      // Validar contra horas totales de la convocatoria
      if (convocatoria?.horas_totales_ofrecidas) {
        const totalHorasExistentes = actividades
          .filter(a => !editingActividad || a.id !== editingActividad.id)
          .reduce((total, act) => total + (act?.horas_estimadas || 0), 0);

        const totalConNuevaActividad = totalHorasExistentes + (values?.horas_estimadas || 0);

        if (totalConNuevaActividad > (convocatoria?.horas_totales_ofrecidas || 0)) {
          toast.error(`Las horas totales (${totalConNuevaActividad}) exceden las horas ofrecidas (${convocatoria?.horas_totales_ofrecidas})`);
          return;
        }
      }

      // Llamar a la API correspondiente
      const endpoint = editingActividad ? '/api/actividades' : '/api/actividades';
      const method = editingActividad ? 'PUT' : 'POST';

      const body = editingActividad
        ? { ...values, id: editingActividad.id }
        : { ...values, id_convocatoria: convocatoria.id };

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error('Error al guardar actividad');
      }

      const actividadGuardada = await response.json();

      toast.success(editingActividad ? 'Actividad actualizada exitosamente' : 'Actividad creada exitosamente');
      onSuccess(actividadGuardada);
      reset();
      setEditingActividad(null);
      onClose();
    } catch (error) {
      toast.error('Error al guardar actividad');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleActivityExpansion = (index: number) => {
    setExpandedActivities(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleEdit = (actividad: Actividad) => {
    setEditingActividad(actividad);
  };

  const handleDelete = async (actividad: Actividad) => {
    if (!confirm(`¿Estás seguro de eliminar la actividad "${actividad.nombre}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/actividades/${actividad.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Error al eliminar actividad');
      }

      toast.success('Actividad eliminada exitosamente');
      onSuccess(null);
    } catch (error) {
      toast.error('Error al eliminar actividad');
      console.error(error);
    }
  };

  const toggleActividadStatus = async (actividad: Actividad) => {
    try {
      const response = await fetch(`/api/actividades/${actividad.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actividad,
          esta_activa: !actividad.esta_activa,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar estado');
      }

      toast.success(`Actividad ${!actividad.esta_activa ? 'activada' : 'desactivada'} exitosamente`);
      onSuccess(null);
    } catch (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    }
  };

  const totalHorasActividades = actividades?.reduce((total, act) => total + (act.horas_estimadas || 0), 0) || 0;
  const actividadesActivas = actividades?.filter(act => act.esta_activa).length || 0;

  if (!isOpen || !convocatoria) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Gestión de Actividades - ${convocatoria.titulo}`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-slate-500" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Total Actividades</span>
            </div>
            <div className="text-xl font-black text-slate-900">{actividades.length}</div>
          </div>

          <div className="bg-green-50/30 rounded-xl p-4 border border-green-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-none">Activas</span>
            </div>
            <div className="text-xl font-black text-green-700">{actividadesActivas}</div>
          </div>

          <div className="bg-blue-50/30 rounded-xl p-4 border border-blue-100 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none">Total Horas</span>
            </div>
            <div className="text-xl font-black text-blue-700">{totalHorasActividades}h</div>
          </div>

          <div className="bg-[#8B1E1E]/5 rounded-xl p-4 border border-[#8B1E1E]/10 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-[#8B1E1E]" />
              <span className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest leading-none">Ofrecidas</span>
            </div>
            <div className="text-xl font-black text-[#8B1E1E]">{convocatoria.horas_totales_ofrecidas || 0}h</div>
          </div>
        </div>

        {/* Formulario de creación/edición */}
        {editingActividad && (
          <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingActividad ? 'Editar Actividad' : 'Nueva Actividad'}
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Actividad <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('nombre')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Taller de inducción"
                  />
                  {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <textarea
                    {...register('descripcion')}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe la actividad..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Actividad <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('tipo_actividad')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {tipoActividadOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Estimadas <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register('horas_estimadas', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 8"
                  />
                  {errors.horas_estimadas && <p className="text-red-500 text-sm mt-1">{errors.horas_estimadas.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas Máximas
                  </label>
                  <input
                    {...register('horas_maximas', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: 12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Inicio
                  </label>
                  <input
                    {...register('fecha_inicio')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Límite
                  </label>
                  <input
                    {...register('fecha_limite')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <input
                    {...register('ubicacion')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Sala de computación, Campus Principal"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2">
                    <input
                      {...register('esta_activa')}
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Actividad activa</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Guardando...' : (editingActividad ? 'Actualizar' : 'Crear')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingActividad(null);
                    reset();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de actividades */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Actividades Existentes</h3>
            {!editingActividad && (
              <button
                onClick={() => setEditingActividad({} as Actividad)}
                className="inline-flex items-center px-3 py-1.5 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Nueva Actividad
              </button>
            )}
          </div>

          {actividades.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sin actividades</h3>
              <p className="text-gray-600 mb-4">Agrega actividades para estructurar mejor el servicio social</p>
              <button
                onClick={() => setEditingActividad({} as Actividad)}
                className="inline-flex items-center px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Primera Actividad
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {actividades.map((actividad, index) => (
                <div key={actividad.id} className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleActivityExpansion(index)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedActivities.includes(index) ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{actividad.nombre}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-600 font-light">{actividad.horas_estimadas} horas</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tipoActividadOptions.find(opt => opt.value === actividad.tipo_actividad)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                            {tipoActividadOptions.find(opt => opt.value === actividad.tipo_actividad)?.label}
                          </span>
                          {actividad.esta_activa ? (
                            <span className="text-green-600 text-xs font-bold uppercase tracking-tighter">Activa</span>
                          ) : (
                            <span className="text-gray-400 text-xs font-bold uppercase tracking-tighter">Inactiva</span>
                          )}
                          {actividad._count?.reportes ? (
                            <span className="text-blue-600 text-xs font-medium">• {actividad._count.reportes} reportes</span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(actividad);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-100/50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActividadStatus(actividad);
                        }}
                        className={`p-2 rounded-lg transition-colors border border-transparent ${actividad.esta_activa
                          ? 'text-orange-600 hover:bg-orange-100/50 hover:border-orange-200'
                          : 'text-green-600 hover:bg-green-100/50 hover:border-green-200'
                          }`}
                        title={actividad.esta_activa ? 'Desactivar' : 'Activar'}
                      >
                        {actividad.esta_activa ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(actividad);
                        }}
                        className="p-2 text-red-600 hover:bg-red-100/50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contenido expandido */}
                  {expandedActivities.includes(index) && (
                    <div className="p-4 bg-white border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {actividad.descripcion && (
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700 block mb-1">Descripción:</span>
                            <p className="text-gray-600 font-light italic leading-relaxed">"{actividad.descripcion}"</p>
                          </div>
                        )}

                        {actividad.fecha_inicio && (
                          <div>
                            <span className="font-semibold text-gray-700">Fecha de inicio:</span>
                            <p className="text-gray-600 font-light">{new Date(actividad.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                        )}

                        {actividad.fecha_limite && (
                          <div>
                            <span className="font-semibold text-gray-700">Fecha límite:</span>
                            <p className="text-gray-600 font-light">{new Date(actividad.fecha_limite).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                          </div>
                        )}

                        {actividad.ubicacion && (
                          <div className="md:col-span-2">
                            <span className="font-semibold text-gray-700">Ubicación física:</span>
                            <p className="text-gray-600 font-light">{actividad.ubicacion}</p>
                          </div>
                        )}

                        <div className="md:col-span-2 pt-2 border-t border-slate-50 flex justify-between items-center text-[10px] text-slate-400 font-medium italic">
                          <span>ID Actividad: {actividad.id}</span>
                          <span>Registrada: {new Date(actividad.creado_en).toLocaleString('es-CO')}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FormModal>
  );
}
