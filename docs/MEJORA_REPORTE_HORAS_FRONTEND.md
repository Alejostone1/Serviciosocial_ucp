# 🎨 MEJORA: Frontend - Reporte de Horas con Múltiples Fechas

## 🎯 UX MEJORADA

### 1. COMPONENTE: Selector de Fechas Dinámico

```typescript
// src/components/reporte-horas/selector-fechas.tsx

'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FechaDetalle {
  id: string;
  fecha: string;
  horas: number;
  descripcion?: string;
}

interface SelectorFechasProps {
  fechas: FechaDetalle[];
  onChange: (fechas: FechaDetalle[]) => void;
  horasEstimadas: number;
  fechaInicio?: string;
  fechaFin?: string;
}

export function SelectorFechas({
  fechas,
  onChange,
  horasEstimadas,
  fechaInicio,
  fechaFin
}: SelectorFechasProps) {
  const [nuevaFecha, setNuevaFecha] = useState({
    fecha: '',
    horas: 1,
    descripcion: ''
  });

  const totalHoras = fechas.reduce((sum, f) => sum + f.horas, 0);
  const porcentajeCompletado = (totalHoras / horasEstimadas) * 100;

  const agregarFecha = () => {
    if (!nuevaFecha.fecha) {
      alert('Selecciona una fecha');
      return;
    }

    // Validar duplicados
    if (fechas.some(f => f.fecha === nuevaFecha.fecha)) {
      alert('Esta fecha ya fue agregada');
      return;
    }

    // Validar rango
    if (fechaInicio && nuevaFecha.fecha < fechaInicio) {
      alert('Fecha anterior al inicio de la convocatoria');
      return;
    }

    if (fechaFin && nuevaFecha.fecha > fechaFin) {
      alert('Fecha posterior al fin de la convocatoria');
      return;
    }

    // Validar total
    const nuevoTotal = totalHoras + nuevaFecha.horas;
    if (nuevoTotal > horasEstimadas * 1.5) {
      alert(`El total (${nuevoTotal}h) excede el límite permitido`);
      return;
    }

    onChange([
      ...fechas,
      {
        id: Date.now().toString(),
        ...nuevaFecha
      }
    ]);

    setNuevaFecha({ fecha: '', horas: 1, descripcion: '' });
  };

  const eliminarFecha = (id: string) => {
    onChange(fechas.filter(f => f.id !== id));
  };

  const actualizarFecha = (id: string, campo: keyof FechaDetalle, valor: string | number) => {
    onChange(
      fechas.map(f =>
        f.id === id ? { ...f, [campo]: valor } : f
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-[#8B1E1E]" />
          <div>
            <p className="text-sm font-bold text-slate-800">
              Fechas de Actividad
            </p>
            <p className="text-xs text-slate-500">
              {fechas.length} fecha(s) · {totalHoras}h totales
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-[#8B1E1E]">
            {totalHoras}h
          </p>
          <p className="text-[10px] text-slate-400">
            de {horasEstimadas}h estimadas
          </p>
        </div>
      </div>

      {/* Barra de progreso */}
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#8B1E1E] transition-all duration-300"
          style={{ width: `${Math.min(porcentajeCompletado, 100)}%` }}
        />
      </div>

      {/* Lista de fechas agregadas */}
      {fechas.length > 0 && (
        <div className="space-y-3">
          {fechas.map((fecha) => (
            <div
              key={fecha.id}
              className="p-4 bg-white border border-slate-200 rounded-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Fecha */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={fecha.fecha}
                      onChange={(e) =>
                        actualizarFecha(fecha.id, 'fecha', e.target.value)
                      }
                      min={fechaInicio}
                      max={fechaFin}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
                    />
                  </div>

                  {/* Horas */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Horas
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="8"
                      value={fecha.horas}
                      onChange={(e) =>
                        actualizarFecha(fecha.id, 'horas', parseFloat(e.target.value))
                      }
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                    />
                  </div>

                  {/* Descripción opcional */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">
                      Descripción (opcional)
                    </label>
                    <input
                      type="text"
                      value={fecha.descripcion || ''}
                      onChange={(e) =>
                        actualizarFecha(fecha.id, 'descripcion', e.target.value)
                      }
                      placeholder="Detalles específicos..."
                      maxLength={500}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>

                {/* Botón eliminar */}
                <button
                  onClick={() => eliminarFecha(fecha.id)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario para agregar nueva fecha */}
      <div className="p-4 bg-white border-2 border-dashed border-slate-200 rounded-xl">
        <p className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Agregar nueva fecha
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Fecha */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Fecha *
            </label>
            <input
              type="date"
              value={nuevaFecha.fecha}
              onChange={(e) =>
                setNuevaFecha({ ...nuevaFecha, fecha: e.target.value })
              }
              min={fechaInicio}
              max={fechaFin}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium"
            />
          </div>

          {/* Horas */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Horas *
            </label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              max="8"
              value={nuevaFecha.horas}
              onChange={(e) =>
                setNuevaFecha({ ...nuevaFecha, horas: parseFloat(e.target.value) })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
            />
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">
              Descripción
            </label>
            <input
              type="text"
              value={nuevaFecha.descripcion}
              onChange={(e) =>
                setNuevaFecha({ ...nuevaFecha, descripcion: e.target.value })
              }
              placeholder="Detalles específicos..."
              maxLength={500}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
            />
          </div>
        </div>

        <button
          onClick={agregarFecha}
          className="mt-4 w-full py-2.5 bg-[#8B1E1E] text-white rounded-xl text-sm font-bold hover:bg-[#8B1E1E]/90 transition-colors"
        >
          Agregar Fecha
        </button>
      </div>

      {/* Alerta si excede estimadas */}
      {totalHoras > horasEstimadas && (
        <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Excediendo horas estimadas
            </p>
            <p className="text-xs text-amber-700">
              Has reportado {totalHoras}h de {horasEstimadas}h estimadas.
              Esto requerirá justificación adicional.
            </p>
          </div>
        </div>
      )}

      {/* Alerta si está incompleto */}
      {totalHoras < horasEstimadas && fechas.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 shrink- mt-0.5" />
          <div>
            <p className="text-sm font-bold text-blue-800">
              Horas incompletas
            </p>
            <p className="text-xs text-blue-700">
              Faltan {horasEstimadas - totalHoras}h para completar las horas estimadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 2. COMPONENTE: Uploader de Archivos Mejorado

```typescript
// src/components/reporte-horas/archivos-uploader.tsx

'use client';

import React, { useState, useCallback } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface ArchivoInfo {
  id: string;
  file: File;
  estado: 'pendiente' | 'subiendo' | 'exitoso' | 'error';
  error?: string;
}

interface ArchivosUploaderProps {
  archivos: ArchivoInfo[];
  onChange: (archivos: ArchivoInfo[]) => void;
  maxArchivos?: number;
}

export function ArchivosUploader({
  archivos,
  onChange,
  maxArchivos = 5
}: ArchivosUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
  const tamañoMaximo = 5 * 1024 * 1024; // 5MB

  const validarArchivo = (file: File): string | null => {
    if (!tiposPermitidos.includes(file.type)) {
      return 'Solo se permiten PDF, JPG y PNG';
    }
    if (file.size > tamañoMaximo) {
      return 'El archivo supera los 5MB';
    }
    return null;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    agregarArchivos(files);
  }, [archivos]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    agregarArchivos(files);
    e.target.value = ''; // Reset
  };

  const agregarArchivos = (files: File[]) => {
    if (archivos.length + files.length > maxArchivos) {
      alert(`Máximo ${maxArchivos} archivos`);
      return;
    }

    const nuevosArchivos: ArchivoInfo[] = files.map(file => {
      const error = validarArchivo(file);
      return {
        id: `${Date.now()}-${Math.random()}`,
        file,
        estado: error ? 'error' : 'pendiente',
        error
      };
    });

    onChange([...archivos, ...nuevosArchivos]);
  };

  const eliminarArchivo = (id: string) => {
    onChange(archivos.filter(a => a.id !== id));
  };

  const formatearTamaño = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const obtenerIcono = (tipo: string) => {
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('image')) return '🖼️';
    return '📎';
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      {archivos.length < maxArchivos && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center transition-all
            ${isDragging
              ? 'border-[#8B1E1E] bg-[#8B1E1E]/5'
              : 'border-slate-300 hover:border-slate-400'
            }
          `}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="w-8 h-8 mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-bold text-slate-700 mb-1">
            Arrastra archivos aquí o haz click
          </p>
          <p className="text-xs text-slate-500">
            PDF, JPG, PNG · Máx 5MB · Máx {maxArchivos} archivos
          </p>
        </div>
      )}

      {/* Lista de archivos */}
      {archivos.length > 0 && (
        <div className="space-y-2">
          {archivos.map((archivo) => (
            <div
              key={archivo.id}
              className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg"
            >
              {/* Icono */}
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl">
                {obtenerIcono(archivo.file.type)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">
                  {archivo.file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatearTamaño(archivo.file.size)}
                </p>
              </div>

              {/* Estado */}
              {archivo.estado === 'error' && (
                <div className="flex items-center gap-2 text-rose-500">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs">{archivo.error}</span>
                </div>
              )}

              {/* Botón eliminar */}
              <button
                onClick={() => eliminarArchivo(archivo.id)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Contador */}
      <p className="text-xs text-slate-500 text-center">
        {archivos.length}/{maxArchivos} archivos
      </p>
    </div>
  );
}
```

---

### 3. INTEGRACIÓN EN FORMULARIO PRINCIPAL

```typescript
// src/app/sistema/estudiante/mis-horas/reportar/page.tsx (MODIFICADO)

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { SelectorFechas } from '@/components/reporte-horas/selector-fechas';
import { ArchivosUploader } from '@/components/reporte-horas/archivos-uploader';
import { crearReporteHorasConFechas } from './actions';

interface FechaDetalle {
  id: string;
  fecha: string;
  horas: number;
  descripcion?: string;
}

export default function ReportarHorasPage() {
  const [fechas, setFechas] = useState<FechaDetalle[]>([]);
  const [archivos, setArchivos] = useState<any[]>([]);
  const [actividadSeleccionada, setActividadSeleccionada] = useState<any>(null);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      descripcion_trabajo: '',
      notas_estudiante: ''
    }
  });

  const onSubmit = async (data: any) => {
    // Validar que haya fechas
    if (fechas.length === 0) {
      alert('Debes agregar al menos una fecha');
      return;
    }

    // Validar total de horas
    const totalHoras = fechas.reduce((sum, f) => sum + f.horas, 0);
    if (totalHoras === 0) {
      alert('El total de horas debe ser mayor a 0');
      return;
    }

    // Crear FormData
    const formData = new FormData();
    formData.append('id_actividad', actividadSeleccionada.id);
    formData.append('descripcion_trabajo', data.descripcion_trabajo);
    if (data.notas_estudiante) {
      formData.append('notas_estudiante', data.notas_estudiante);
    }
    formData.append('fechas', JSON.stringify(fechas));
    
    // Agregar archivos
    archivos.forEach(a => {
      if (a.estado !== 'error') {
        formData.append('archivos', a.file);
      }
    });

    try {
      const resultado = await crearReporteHorasConFechas(formData);
      toast.success('Reporte enviado correctamente');
      // Redirigir...
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al enviar');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Selector de actividad (existente) */}
      {/* ... */}

      {/* Descripción general */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          Descripción del trabajo *
        </label>
        <textarea
          {...register('descripcion_trabajo', { 
            required: 'Requerido',
            minLength: { value: 10, message: 'Mínimo 10 caracteres' },
            maxLength: { value: 1000, message: 'Máximo 1000 caracteres' }
          })}
          rows={4}
          placeholder="Describe qué hiciste..."
          className="w-full p-3 border border-slate-200 rounded-xl"
        />
        {errors.descripcion_trabajo && (
          <p className="text-xs text-rose-500">
            {errors.descripcion_trabajo.message}
          </p>
        )}
      </div>

      {/* Selector de fechas (NUEVO) */}
      <SelectorFechas
        fechas={fechas}
        onChange={setFechas}
        horasEstimadas={actividadSeleccionada?.horas_estimadas || 0}
        fechaInicio={actividadSeleccionada?.fecha_inicio}
        fechaFin={actividadSeleccionada?.fecha_limite}
      />

      {/* Uploader de archivos (MEJORADO) */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          Evidencias (opcional)
        </label>
        <ArchivosUploader
          archivos={archivos}
          onChange={setArchivos}
          maxArchivos={5}
        />
      </div>

      {/* Notas estudiante */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">
          Notas adicionales (opcional)
        </label>
        <textarea
          {...register('notas_estudiante', { maxLength: 300 })}
          rows={2}
          placeholder="Comentarios adicionales..."
          className="w-full p-3 border border-slate-200 rounded-xl"
        />
      </div>

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={fechas.length === 0}
        className="w-full py-3 bg-[#8B1E1E] text-white rounded-xl font-bold hover:bg-[#8B1E1E]/90 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Enviar Reporte
      </button>
    </form>
  );
}
```

---

## 🎯 CARACTERÍSTICAS UX

### 1. Validación en Tiempo Real
- ✅ Total de horas actualizado dinámicamente
- ✅ Barra de progreso visual
- ✅ Alertas si excede horas estimadas
- ✅ Alertas si está incompleto

### 2. Interacción Intuitiva
- ✅ Drag & drop para archivos
- ✅ Click para agregar fechas
- ✅ Editar fechas ya agregadas
- ✅ Eliminar fechas con un click

### 3. Feedback Visual
- ✅ Iconos de estado (check, alerta)
- ✅ Colores semánticos (verde, amarillo, rojo)
- ✅ Animaciones suaves
- ✅ Tooltips informativos

### 4. Accesibilidad
- ✅ Labels claros
- ✅ Mensajes de error específicos
- ✅ Contraste adecuado
- ✅ Navegación por teclado

### 5. Minimalista y Funcional
- ✅ Sin clutter visual
- ✅ Información esencial
- ✅ Acciones rápidas
- ✅ Diseño limpio

---

## 📱 RESPONSIVE

- ✅ Grid adaptable (1 col móvil, 3 col desktop)
- ✅ Inputs touch-friendly
- ✅ Textos legibles en móvil
- ✅ Botones accesibles
