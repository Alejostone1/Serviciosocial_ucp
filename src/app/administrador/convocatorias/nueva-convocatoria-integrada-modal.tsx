'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearConvocatoriaConActividades, getOpcionesConvocatoria } from './convocatorias-actions';
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  Globe,
  FileText,
  Award,
  Target,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Info,
  Settings,
  Activity,
  Timer,
  MapPin as MapPinIcon,
  FileText as FileTextIcon,
  Package
} from 'lucide-react';
import { TipoActividad, EstadoConvocatoria } from '@prisma/client';

// Schema principal con actividades integradas
const convocatoriaSchema = z.object({
  titulo: z.string().min(5, 'Mínimo 5 caracteres').max(200, 'Máximo 200 caracteres'),
  descripcion: z.string().min(3, 'Mínimo 3 caracteres').max(2000, 'Máximo 2000 caracteres'),
  objetivo: z.string().optional().or(z.literal('')).or(z.literal(null)),
  id_categoria: z.string().optional().or(z.literal('')).or(z.literal(null)),
  id_programa: z.string().optional().or(z.literal('')).or(z.literal(null)),
  modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA']),
  lugar: z.string().optional().or(z.literal('')).or(z.literal(null)),
  url_convocatoria_externa: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  competencias_requeridas: z.array(z.string()).optional().default([]),
  fecha_inicio: z.string().min(1, 'Fecha de inicio requerida'),
  fecha_fin: z.string().optional().or(z.literal('')).or(z.literal(null)),
  fecha_cierre_postulacion: z.string().optional().or(z.literal('')).or(z.literal(null)),
  cupo_maximo: z.number().min(1, 'Mínimo 1 participante').optional().or(z.literal(null)),
  cupo_disponible: z.number().min(0, 'No puede ser negativo').optional().or(z.literal(null)),
  horas_totales_ofrecidas: z.number().min(1, 'Mínimo 1 hora').optional().or(z.literal(null)),
  url_banner: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  url_documento_adicional: z.string().optional().refine((val) => !val || val === '' || z.string().url().safeParse(val).success, {
    message: 'URL inválida'
  }),
  requiere_entrevista: z.boolean().default(false),
  estado: z.nativeEnum(EstadoConvocatoria).default('BORRADOR'),
  actividades: z.array(z.object({
    nombre: z.string().min(5, 'Mínimo 5 caracteres').max(200),
    descripcion: z.string().optional().or(z.literal('')).or(z.literal(null)),
    tipo_actividad: z.nativeEnum(TipoActividad),
    horas_estimadas: z.coerce.number().min(1, 'Mínimo 1 hora').max(1000),
    horas_maximas: z.coerce.number().optional().or(z.literal(0)).or(z.literal(null)),
    fecha_inicio: z.string().optional().or(z.literal('')).or(z.literal(null)),
    fecha_limite: z.string().optional().or(z.literal('')).or(z.literal(null)),
    ubicacion: z.string().max(200).optional().or(z.literal('')).or(z.literal(null)),
    materiales_requeridos: z.array(z.string()).default([]),
  })).optional(),
});

type ConvocatoriaFormData = z.infer<typeof convocatoriaSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (convocatoria: any) => void;
}

const tipoActividadOptions: { value: TipoActividad; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'GENERAL', label: 'General', icon: <Activity className="w-4 h-4" />, color: 'bg-blue-100 text-blue-800' },
  { value: 'CAPACITACION', label: 'Capacitación', icon: <Award className="w-4 h-4" />, color: 'bg-green-100 text-green-800' },
  { value: 'CAMPO', label: 'Trabajo de Campo', icon: <MapPinIcon className="w-4 h-4" />, color: 'bg-orange-100 text-orange-800' },
  { value: 'ADMINISTRATIVA', label: 'Labor Administrativa', icon: <Settings className="w-4 h-4" />, color: 'bg-purple-100 text-purple-800' },
  { value: 'INVESTIGACION', label: 'Investigación', icon: <FileTextIcon className="w-4 h-4" />, color: 'bg-pink-100 text-pink-800' },
  { value: 'COMUNITARIA', label: 'Labor Comunitaria', icon: <Users className="w-4 h-4" />, color: 'bg-yellow-100 text-yellow-800' },
];

export function NuevaConvocatoriaIntegradaModal({ isOpen, onClose, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [opciones, setOpciones] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedActivities, setExpandedActivities] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    control,
    formState: { errors }
  } = useForm<ConvocatoriaFormData>({
    resolver: zodResolver(convocatoriaSchema),
    mode: 'onBlur',
    defaultValues: {
      modalidad: 'PRESENCIAL',
      competencias_requeridas: [],
      requiere_entrevista: false,
      estado: 'BORRADOR',
      actividades: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'actividades',
  });

  // Estado local para manejar las competencias
  const [nuevaCompetencia, setNuevaCompetencia] = useState('');

  // Funciones para manejar competencias
  const agregarCompetencia = () => {
    if (nuevaCompetencia.trim()) {
      const competenciasActuales = getValues('competencias_requeridas') || [];
      if (!competenciasActuales.includes(nuevaCompetencia.trim())) {
        setValue('competencias_requeridas', [...competenciasActuales, nuevaCompetencia.trim()]);
        setNuevaCompetencia('');
      }
    }
  };

  const eliminarCompetencia = (index: number) => {
    const competenciasActuales = getValues('competencias_requeridas') || [];
    const nuevasCompetencias = competenciasActuales.filter((_, i) => i !== index);
    setValue('competencias_requeridas', nuevasCompetencias);
  };

  // Cargar opciones al montar
  useEffect(() => {
    if (isOpen) {
      cargarOpciones();
    }
  }, [isOpen]);

  const cargarOpciones = async () => {
    try {
      const data = await getOpcionesConvocatoria();
      setOpciones(data);
    } catch (error) {
      toast.error('Error al cargar opciones');
    }
  };

  const onSubmit = async (values: ConvocatoriaFormData) => {
    console.log('=== SUBMIT HANDLER LLAMADO ===');
    console.log('Current step:', currentStep);
    console.log('Values:', values);
    
    // Solo permitir submit en el paso 2
    if (currentStep !== 2) {
      console.error('ERROR: Submit llamado en paso incorrecto:', currentStep);
      return;
    }
    
    try {
      setIsLoading(true);

      // Procesar datos para convertir valores vacíos a null
      const procesados = {
        ...values,
        objetivo: values.objetivo === '' ? null : values.objetivo,
        id_categoria: values.id_categoria === '' ? null : values.id_categoria,
        id_programa: values.id_programa === '' ? null : values.id_programa,
        lugar: values.lugar === '' ? null : values.lugar,
        url_convocatoria_externa: values.url_convocatoria_externa === '' ? null : values.url_convocatoria_externa,
        fecha_fin: values.fecha_fin === '' ? null : values.fecha_fin,
        fecha_cierre_postulacion: values.fecha_cierre_postulacion === '' ? null : values.fecha_cierre_postulacion,
        url_banner: values.url_banner === '' ? null : values.url_banner,
        url_documento_adicional: values.url_documento_adicional === '' ? null : values.url_documento_adicional,
        competencias_requeridas: values.competencias_requeridas || [],
        actividades: values.actividades?.map(act => ({
          ...act,
          descripcion: act.descripcion === '' ? null : act.descripcion,
          fecha_inicio: act.fecha_inicio === '' ? null : act.fecha_inicio,
          fecha_limite: act.fecha_limite === '' ? null : act.fecha_limite,
          ubicacion: act.ubicacion === '' ? null : act.ubicacion,
          materiales_requeridos: act.materiales_requeridos || [],
        })) || [],
      };

      // Validar que las horas totales coincidan con la suma de actividades
      if (procesados.actividades && procesados.actividades.length > 0) {
        const totalHorasActividades = procesados.actividades.reduce((total, act) => total + act.horas_estimadas, 0);
        if (procesados.horas_totales_ofrecidas && totalHorasActividades > procesados.horas_totales_ofrecidas) {
          toast.error('La suma de horas de actividades excede las horas totales ofrecidas');
          return;
        }
      } else {
        // Si no hay actividades, limpiar el campo horas_totales_ofrecidas si no está definido
        if (!procesados.horas_totales_ofrecidas) {
          procesados.horas_totales_ofrecidas = null;
        }
      }

      const convocatoria = await crearConvocatoriaConActividades(procesados);
      toast.success('Convocatoria y actividades creadas exitosamente');
      onSuccess(convocatoria);
      reset();
      setCurrentStep(1);
      onClose();
    } catch (error) {
      toast.error('Error al crear convocatoria');
      console.error('Error en submit:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const agregarActividad = () => {
    append({
      nombre: '',
      descripcion: '',
      tipo_actividad: 'GENERAL',
      horas_estimadas: 1,
      horas_maximas: 0,
      fecha_inicio: '',
      fecha_limite: '',
      ubicacion: '',
      materiales_requeridos: [],
    });
  };

  const toggleActivityExpansion = (index: number) => {
    setExpandedActivities(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const totalHorasActividades = watch('actividades')?.reduce((total, act) => total + (act.horas_estimadas || 0), 0) || 0;

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <Info className="w-5 h-5 text-blue-600" />
        <div className="text-sm text-blue-800">
          <strong>Paso 1:</strong> Información básica de la convocatoria
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título de la Convocatoria <span className="text-red-500">*</span>
          </label>
          <input
            {...register('titulo')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: Convocatoria de Servicio Social 2026"
          />
          {errors.titulo && <p className="text-red-500 text-sm mt-1">{errors.titulo.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register('descripcion')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Describe detalladamente la convocatoria..."
          />
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>}
        </div>

        {/* Competencias Requeridas */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Competencias Requeridas
          </label>
          <div className="space-y-3">
            {/* Lista de competencias actuales */}
            <div className="flex flex-wrap gap-2">
              {watch('competencias_requeridas')?.map((competencia, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {competencia}
                  <button
                    type="button"
                    onClick={() => eliminarCompetencia(index)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            
            {/* Input para agregar nueva competencia */}
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
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Escribe una competencia y presiona Enter"
              />
              <button
                type="button"
                onClick={agregarCompetencia}
                className="px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modalidad <span className="text-red-500">*</span>
          </label>
          <select
            {...register('modalidad')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="VIRTUAL">Virtual</option>
            <option value="HIBRIDA">Híbrida</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría
          </label>
          <select
            {...register('id_categoria')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar categoría</option>
            {opciones?.categorias?.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programa
          </label>
          <select
            {...register('id_programa')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Seleccionar programa (opcional)</option>
            {opciones?.programas?.map((prog: any) => (
              <option key={prog.id} value={prog.id}>{prog.nombre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado Inicial <span className="text-red-500">*</span>
          </label>
          <select
            {...register('estado')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
          >
            <option value="BORRADOR">Borrador</option>
            <option value="PUBLICADA">Publicada</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="CERRADA">Cerrada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Inicio <span className="text-red-500">*</span>
          </label>
          <input
            {...register('fecha_inicio')}
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {errors.fecha_inicio && <p className="text-red-500 text-sm mt-1">{errors.fecha_inicio.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha de Fin
          </label>
          <input
            {...register('fecha_fin')}
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cierre de Postulaciones
          </label>
          <input
            {...register('fecha_cierre_postulacion')}
            type="date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Horas Totales Ofrecidas
          </label>
          <input
            {...register('horas_totales_ofrecidas', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 180"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cupo Máximo
          </label>
          <input
            {...register('cupo_maximo', { valueAsNumber: true })}
            type="number"
            min="1"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ej: 50"
          />
        </div>

        {watch('modalidad') === 'PRESENCIAL' || watch('modalidad') === 'HIBRIDA' ? (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lugar
            </label>
            <input
              {...register('lugar')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ej: Campus Principal, Sala de reuniones"
            />
          </div>
        ) : null}
      </div>
    </div>
  );

  const renderStep2 = () => {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <Target className="w-5 h-5 text-green-600" />
          <div className="text-sm text-green-800">
            <strong>Paso 2:</strong> Actividades de la convocatoria (opcional pero recomendado)
          </div>
        </div>

        {/* Resumen de horas */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Resumen de Horas</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-gray-600">Actividades: <strong>{totalHorasActividades}h</strong></span>
              <span className="text-gray-600">Total ofrecido: <strong>{watch('horas_totales_ofrecidas') || 0}h</strong></span>
              {totalHorasActividades > (watch('horas_totales_ofrecidas') || 0) && (
                <span className="text-red-600 font-medium">Excede el total</span>
              )}
            </div>
          </div>
        </div>

        {/* Lista de actividades */}
        <div className="space-y-4">
          {fields.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500 italic">No hay actividades agregadas</p>
              <p className="text-sm text-gray-400 mt-2">Puedes agregar actividades más tarde o crear la convocatoria sin ellas</p>
            </div>
          ) : (
            fields.map((field, index) => (
              <div key={field.id} className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Actividad {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la Actividad <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register(`actividades.${index}.nombre`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Taller de inducción"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <textarea
                      {...register(`actividades.${index}.descripcion`)}
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
                      {...register(`actividades.${index}.tipo_actividad`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {tipoActividadOptions.map((option: any) => (
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
                      {...register(`actividades.${index}.horas_estimadas`, { valueAsNumber: true })}
                      type="number"
                      min="1"
                      max="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 8"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Horas Máximas
                    </label>
                    <input
                      {...register(`actividades.${index}.horas_maximas`, { valueAsNumber: true })}
                      type="number"
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 10"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de Inicio
                    </label>
                    <input
                      {...register(`actividades.${index}.fecha_inicio`)}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Límite
                    </label>
                    <input
                      {...register(`actividades.${index}.fecha_limite`)}
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <input
                      {...register(`actividades.${index}.ubicacion`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Sala de computación, Campus Principal"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Botón agregar actividad */}
        <button
          type="button"
          onClick={agregarActividad}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Agregar Otra Actividad
        </button>
      </div>
    );
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Nueva Convocatoria Integrada"
      size="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Stepper */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep >= 1 ? 'bg-[#8B1E1E] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="font-medium">Información Básica</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${currentStep >= 2 ? 'bg-[#8B1E1E] text-white' : 'bg-gray-200 text-gray-600'
              }`}>
              <div className="w-6 h-6 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <span className="font-medium">Actividades</span>
            </div>
          </div>
        </div>

        {/* Contenido del paso actual */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}

        {/* Botones de navegación */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div>
            {currentStep === 2 && (
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Anterior
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  console.log('=== BOTÓN SIGUIENTE CLICKEADO ===');
                  console.log('Current step:', currentStep);
                  console.log('Event target:', e.target);
                  console.log('Form errors:', errors);
                  setCurrentStep(2);
                }}
                className="px-6 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-[#166534] text-white rounded-lg hover:bg-[#14532d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Crear Convocatoria y Actividades
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </FormModal>
  );
}
