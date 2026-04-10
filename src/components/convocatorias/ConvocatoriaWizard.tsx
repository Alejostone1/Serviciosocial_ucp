'use client';

import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, 
  Clock, 
  MapPin, 
  Globe, 
  Users, 
  Plus, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Save,
  FileText,
  Upload,
  AlertCircle,
  CheckCircle,
  Edit3,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// Tipos para el wizard
interface ConvocatoriaWizardData {
  // Paso 1: Información General
  titulo: string;
  descripcion: string;
  objetivo?: string | null;
  id_categoria?: string | null;
  modalidad: 'PRESENCIAL' | 'VIRTUAL' | 'HIBRIDA';
  
  // Paso 2: Configuración Operativa
  lugar?: string | null;
  competencias_requeridas: string[];
  requiere_entrevista: boolean;
  horas_totales_ofrecidas?: number | null;
  cupo_maximo?: number | null;
  cupo_disponible?: number | null;
  
  // Paso 3: Fechas
  fecha_inicio: Date;
  fecha_fin?: Date | null;
  fecha_cierre_postulacion?: Date | null;
  
  // Paso 4: Recursos Opcionales
  url_convocatoria_externa?: string | null;
  url_banner?: string | null;
  url_documento_adicional?: string | null;
  
  // Metadatos
  id_programa?: string | null;
}

interface ConvocatoriaWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (convocatoria: any) => void;
  initialData?: Partial<ConvocatoriaWizardData>;
  modo: 'crear' | 'editar';
  convocatoriaExistente?: any;
}

// Esquema de validación Zod flexible
const convocatoriaWizardSchema = z.object({
  // Paso 1: Información General (requeridos)
  titulo: z.string()
    .min(5, 'El título debe tener al menos 5 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  descripcion: z.string()
    .min(20, 'La descripción debe tener al menos 20 caracteres')
    .max(2000, 'La descripción no puede exceder 2000 caracteres'),
  objetivo: z.string().nullable().optional(),
  id_categoria: z.string().uuid().nullable().optional(),
  modalidad: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDA']),
  
  // Paso 2: Configuración Operativa (opcionales)
  lugar: z.string().max(200, 'El lugar no puede exceder 200 caracteres').nullable().optional(),
  competencias_requeridas: z.array(z.string()).optional().default([]),
  requiere_entrevista: z.boolean().default(false),
  horas_totales_ofrecidas: z.number().positive().nullable().optional(),
  cupo_maximo: z.number().positive().nullable().optional(),
  cupo_disponible: z.number().positive().nullable().optional(),
  
  // Paso 3: Fechas (requerido)
  fecha_inicio: z.date({
    required_error: 'La fecha de inicio es obligatoria'
  }),
  fecha_fin: z.date().nullable().optional(),
  fecha_cierre_postulacion: z.date().nullable().optional(),
  
  // Paso 4: Recursos Opcionales
  url_convocatoria_externa: z.string().url().nullable().optional(),
  url_banner: z.string().url().nullable().optional(),
  url_documento_adicional: z.string().url().nullable().optional(),
  id_programa: z.string().uuid().nullable().optional(),
}).refine((data) => {
  // Validación de fechas
  if (data.fecha_fin && data.fecha_inicio > data.fecha_fin) {
    return false;
  }
  if (data.fecha_cierre_postulacion && data.fecha_fin && data.fecha_cierre_postulacion > data.fecha_fin) {
    return false;
  }
  return true;
}, {
  message: 'Las fechas no son consistentes',
  path: ['fecha_inicio', 'fecha_fin', 'fecha_cierre_postulacion']
});

type PasoWizard = 1 | 2 | 3 | 4;

export function ConvocatoriaWizard({ 
  isOpen, 
  onClose, 
  onSuccess, 
  initialData, 
  modo = 'crear',
  convocatoriaExistente 
}: ConvocatoriaWizardProps) {
  const [pasoActual, setPasoActual] = useState<PasoWizard>(1);
  const [datosGuardados, setDatosGuardados] = useState<Partial<ConvocatoriaWizardData>>({});
  const [categorias, setCategorias] = useState<any[]>([]);
  const [programas, setProgramas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm<ConvocatoriaWizardData>({
    resolver: zodResolver(convocatoriaWizardSchema),
    defaultValues: {
      titulo: '',
      descripcion: '',
      objetivo: null,
      id_categoria: null,
      modalidad: 'PRESENCIAL',
      lugar: null,
      competencias_requeridas: [],
      requiere_entrevista: false,
      horas_totales_ofrecidas: null,
      cupo_maximo: null,
      cupo_disponible: null,
      fecha_inicio: new Date(),
      fecha_fin: null,
      fecha_cierre_postulacion: null,
      url_convocatoria_externa: null,
      url_banner: null,
      url_documento_adicional: null,
      id_programa: null,
      ...initialData
    },
    mode: 'onChange'
  });

  // Cargar datos necesarios
  React.useEffect(() => {
    const cargarDatos = async () => {
      try {
        // Cargar categorías
        const categoriasResponse = await fetch('/api/convocatorias/categorias');
        if (categoriasResponse.ok) {
          const categoriasData = await categoriasResponse.json();
          setCategorias(categoriasData);
        }
        
        // Cargar programas
        const programasResponse = await fetch('/api/convocatorias/programas');
        if (programasResponse.ok) {
          const programasData = await programasResponse.json();
          setProgramas(programasData);
        }
      } catch (error) {
        console.error('Error cargando datos:', error);
        toast.error('Error al cargar datos necesarios');
      }
    };

    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen]);

  const totalPasos = 4;
  const progresoPaso = ((pasoActual - 1) / totalPasos) * 100;

  const guardarPaso = useCallback(async () => {
    const datosActuales = methods.getValues();
    setDatosGuardados(prev => ({ ...prev, ...datosActuales }));
    return true;
  }, [methods]);

  const puedeAvanzar = useCallback(() => {
    const datosActuales = methods.getValues();
    
    switch (pasoActual) {
      case 1:
        return datosActuales.titulo.trim() !== '' && 
               datosActuales.descripcion.trim() !== '' && 
               datosActuales.modalidad;
      case 2:
        return true; // Paso 2 es completamente opcional
      case 3:
        return datosActuales.fecha_inicio;
      case 4:
        return true; // Paso 4 es completamente opcional
      default:
        return false;
    }
  }, [methods, pasoActual]);

  const puedeRetroceder = useCallback(() => {
    return pasoActual > 1;
  }, [pasoActual]);

  const avanzarPaso = useCallback(() => {
    if (puedeAvanzar()) {
      const nuevoPaso = Math.min(pasoActual + 1, totalPasos) as PasoWizard;
      setPasoActual(nuevoPaso);
    } else {
      toast.error('Por favor completa los campos requeridos del paso actual');
    }
  }, [puedeAvanzar, pasoActual, totalPasos]);

  const retrocederPaso = useCallback(() => {
    if (puedeRetroceder()) {
      const nuevoPaso = Math.max(pasoActual - 1, 1) as PasoWizard;
      setPasoActual(nuevoPaso);
    }
  }, [puedeRetroceder, pasoActual]);

  const onSubmit = async (data: ConvocatoriaWizardData) => {
    setIsLoading(true);
    
    try {
      const endpoint = modo === 'editar' 
        ? `/api/convocatorias/${convocatoriaExistente?.id}`
        : '/api/convocatorias';
        
      const method = modo === 'editar' ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          estado: 'BORRADOR' // Siempre se crea como borrador
        }),
      });

      if (response.ok) {
        const convocatoriaCreada = await response.json();
        toast.success(modo === 'editar' ? 'Convocatoria actualizada' : 'Convocatoria creada');
        onSuccess?.(convocatoriaCreada);
        onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al guardar la convocatoria');
      }
    } catch (error) {
      console.error('Error en submit:', error);
      toast.error('Error al procesar la solicitud');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPaso = () => {
    switch (pasoActual) {
      case 1:
        return (
          <motion.div
            key="paso1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-[#8B1E1] text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Información General
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título <span className="text-red-500">*</span>
                </label>
                <input
                  {...methods.register('titulo')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                  placeholder="Ej: Acompañamiento Psicológico Comunitario"
                />
                {methods.formState.errors.titulo && (
                  <p className="text-red-500 text-sm mt-1">{methods.formState.errors.titulo.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...methods.register('descripcion')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent resize-none"
                  placeholder="Describe detalladamente la convocatoria..."
                />
                {methods.formState.errors.descripcion && (
                  <p className="text-red-500 text-sm mt-1">{methods.formState.errors.descripcion.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Objetivo (opcional)
                </label>
                <textarea
                  {...methods.register('objetivo')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent resize-none"
                  placeholder="¿Qué se espera lograr con esta convocatoria?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría (opcional)
                </label>
                <select
                  {...methods.register('id_categoria')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                >
                  <option value="">Seleccionar categoría...</option>
                  {categorias.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalidad <span className="text-red-500">*</span>
                </label>
                <select
                  {...methods.register('modalidad')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="VIRTUAL">Virtual</option>
                  <option value="HIBRIDA">Híbrida</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Programa (opcional)
                </label>
                <select
                  {...methods.register('id_programa')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                >
                  <option value="">Seleccionar programa...</option>
                  {programas.map(prog => (
                    <option key={prog.id} value={prog.id}>
                      {prog.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="paso2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Configuración Operativa
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lugar (opcional)
                </label>
                <input
                  {...methods.register('lugar')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                  placeholder="Ej: Campus Principal UCP, Centro Comunitario..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Competencias Requeridas (opcional)
                </label>
                <div className="space-y-2">
                  <input
                    {...methods.register('competencias_requeridas')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="Ej: Trabajo en equipo, Comunicación, Liderazgo..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const competencias = methods.getValues('competencias_requeridas') || [];
                        if (e.currentTarget.value.trim()) {
                          methods.setValue('competencias_requeridas', [...competencias, e.currentTarget.value.trim()]);
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {(methods.watch('competencias_requeridas') || []).map((competencia, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {competencia}
                        <button
                          type="button"
                          onClick={() => {
                            const competencias = methods.getValues('competencias_requeridas') || [];
                            methods.setValue('competencias_requeridas', competencias.filter((_, i) => i !== index));
                          }}
                          className="ml-1 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                  <input
                    type="checkbox"
                    {...methods.register('requiere_entrevista')}
                    className="rounded border-gray-300 text-[#8B1E1] focus:ring-[#8B1E1]"
                  />
                  Requiere entrevista
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Horas totales (opcional)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    {...methods.register('horas_totales_ofrecidas', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupo máximo (opcional)
                  </label>
                  <input
                    type="number"
                    {...methods.register('cupo_maximo', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="30"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cupo disponible (opcional)
                  </label>
                  <input
                    type="number"
                    {...methods.register('cupo_disponible', { valueAsNumber: true })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="paso3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
              Fechas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de inicio <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...methods.register('fecha_inicio', { valueAsDate: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                />
                {methods.formState.errors.fecha_inicio && (
                  <p className="text-red-500 text-sm mt-1">{methods.formState.errors.fecha_inicio.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de fin (opcional)
                </label>
                <input
                  type="date"
                  {...methods.register('fecha_fin', { valueAsDate: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha cierre de postulación (opcional)
                </label>
                <input
                  type="date"
                  {...methods.register('fecha_cierre_postulacion', { valueAsDate: true })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium">Nota sobre fechas:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>La fecha de inicio es obligatoria</li>
                    <li>La fecha de fin debe ser posterior a la de inicio</li>
                    <li>La fecha de cierre debe ser anterior a la de fin</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="paso4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
              Recursos Opcionales
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL convocatoria externa (opcional)
                </label>
                <input
                  type="url"
                  {...methods.register('url_convocatoria_externa')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                  placeholder="https://ejemplo.com/convocatoria"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL banner (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    {...methods.register('url_banner')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="https://ejemplo.com/banner.jpg"
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Subir banner"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL documento adicional (opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    {...methods.register('url_documento_adicional')}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8B1E1] focus:border-transparent"
                    placeholder="https://ejemplo.com/documento.pdf"
                  />
                  <button
                    type="button"
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Subir documento"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-amber-50 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                <div className="text-sm text-amber-700">
                  <p className="font-medium">Información importante:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Todos los campos de este paso son opcionales</li>
                    <li>Puedes dejarlos vacíos o usar &ldquo;N/A&rdquo;</li>
                    <li>Las URLs deben ser válidas (http:// o https://)</li>
                    <li>Podrás agregar recursos después de crear la convocatoria</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  const renderFooter = () => (
    <div className="flex justify-between items-center pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={retrocederPaso}
        disabled={!puedeRetroceder()}
        className={cn(
          "flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors",
          !puedeRetroceder() && "opacity-50 cursor-not-allowed"
        )}
      >
        <ChevronLeft className="w-4 h-4" />
        Anterior
      </button>

      <div className="flex gap-2">
        {pasoActual > 1 && (
          <button
            type="button"
            onClick={async () => {
              const guardadoExitoso = await guardarPaso();
              if (guardadoExitoso) {
                const nuevoPaso = pasoActual - 1 as PasoWizard;
                setPasoActual(nuevoPaso);
              }
            }}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <Save className="w-4 h-4" />
            Guardar Paso
          </button>
        )}

        <button
          type="button"
          onClick={avanzarPaso}
          disabled={!puedeAvanzar()}
          className={cn(
            "flex items-center gap-2 px-6 py-2 bg-[#8B1E1] text-white rounded-lg hover:bg-[#731919] transition-colors font-medium",
            !puedeAvanzar() && "opacity-50 cursor-not-allowed"
          )}
        >
          {pasoActual === totalPasos ? (
            <>
              <CheckCircle className="w-4 h-4" />
              Finalizar
            </>
          ) : (
            <>
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                {modo === 'editar' ? 'Editar Convocatoria' : 'Nueva Convocatoria'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((paso) => (
                    <div
                      key={paso}
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all",
                        paso <= pasoActual
                          ? "bg-[#8B1E1] text-white"
                          : "bg-gray-200 text-gray-500"
                      )}
                    >
                      {paso}
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#8B1E1] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progresoPaso}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Form Content */}
            <FormProvider {...methods}>
              <form onSubmit={methods.handleSubmit(onSubmit)} className="px-6 pb-6">
                {renderPaso()}
                {renderFooter()}
              </form>
            </FormProvider>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
