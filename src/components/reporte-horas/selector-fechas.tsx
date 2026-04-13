'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Plus, Trash2, AlertCircle, Check } from 'lucide-react';

export interface FechaDetalle {
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
  maxHorasPorFecha?: number;
  maxFechas?: number;
  maxMultiploEstimadas?: number;
}

export function SelectorFechas({
  fechas,
  onChange,
  horasEstimadas,
  fechaInicio,
  fechaFin,
  maxHorasPorFecha = 24,
  maxFechas = 20,
  maxMultiploEstimadas = 3
}: SelectorFechasProps) {
  const [nuevaFecha, setNuevaFecha] = useState({
    fecha: '',
    horas: 1,
    descripcion: ''
  });

  const totalHoras = fechas.reduce((sum, f) => sum + (f.horas || 0), 0);
  const porcentajeCompletado = horasEstimadas > 0 ? (totalHoras / horasEstimadas) * 100 : 0;
  const limiteHoras = horasEstimadas * maxMultiploEstimadas;

  const agregarFecha = () => {
    if (!nuevaFecha.fecha) {
      alert('Selecciona una fecha');
      return;
    }

    if (fechas.some(f => f.fecha === nuevaFecha.fecha)) {
      alert('Esta fecha ya fue agregada');
      return;
    }

    if (fechaInicio && nuevaFecha.fecha < fechaInicio) {
      alert('Fecha anterior al inicio de la convocatoria');
      return;
    }

    if (fechaFin && nuevaFecha.fecha > fechaFin) {
      alert('Fecha posterior al fin de la convocatoria');
      return;
    }

    const nuevoTotal = totalHoras + nuevaFecha.horas;
    if (nuevoTotal > limiteHoras) {
      alert(`El total (${nuevoTotal}h) excede el límite permitido (${limiteHoras}h)`);
      return;
    }
    
    if (fechas.length >= maxFechas) {
      alert(`Máximo ${maxFechas} fechas por reporte`);
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
          style={{ width: `${Math.min(porcentajeCompletado || 0, 100)}%` }}
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
                      max={maxHorasPorFecha}
                      value={fecha.horas || ''}
                      onChange={(e) =>
                        actualizarFecha(fecha.id, 'horas', parseFloat(e.target.value) || 0)
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
                  type="button"
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
              max={maxHorasPorFecha}
              value={nuevaFecha.horas || ''}
              onChange={(e) =>
                setNuevaFecha({ ...nuevaFecha, horas: parseFloat(e.target.value) || 0 })
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
          type="button"
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
              {totalHoras > limiteHoras ? 'Excediendo límite permitido' : 'Excediendo horas estimadas'}
            </p>
            <p className="text-xs text-amber-700">
              Has reportado {totalHoras}h de {horasEstimadas}h estimadas.
              {totalHoras > limiteHoras 
                ? ` Esto excede el límite de ${limiteHoras}h.`
                : ' Esto requerirá justificación adicional.'}
            </p>
          </div>
        </div>
      )}

      {/* Alerta si está incompleto */}
      {totalHoras < horasEstimadas && fechas.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
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

      {/* Alerta si está completo */}
      {totalHoras === horasEstimadas && fechas.length > 0 && (
        <div className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-emerald-800">
              Horas completas
            </p>
            <p className="text-xs text-emerald-700">
              Has completado las {horasEstimadas}h estimadas.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
