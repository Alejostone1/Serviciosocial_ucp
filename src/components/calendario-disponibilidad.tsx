'use client';

import React, { useState } from 'react';
import { Clock, Check, Plus } from 'lucide-react';

interface DisponibilidadData {
  [dia: string]: string[];
}

interface CalendarioDisponibilidadProps {
  value: string;
  onChange: (value: string) => void;
}

const DIAS_SEMANA = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const BLOQUES_HORARIO = [
  { key: '06_08', label: '6:00 - 8:00', icon: '🌅' },
  { key: '08_10', label: '8:00 - 10:00', icon: '☀️' },
  { key: '10_12', label: '10:00 - 12:00', icon: '🌤️' },
  { key: '12_14', label: '12:00 - 14:00', icon: '🍽️' },
  { key: '14_16', label: '14:00 - 16:00', icon: '🌞' },
  { key: '16_18', label: '16:00 - 18:00', icon: '⛅' },
  { key: '18_20', label: '18:00 - 20:00', icon: '�' },
  { key: '20_22', label: '20:00 - 22:00', icon: '🌙' },
];

export function CalendarioDisponibilidad({ value, onChange }: CalendarioDisponibilidadProps) {
  const [disponibilidad, setDisponibilidad] = useState<DisponibilidadData>(() => {
    try {
      return value ? JSON.parse(value) : {};
    } catch {
      return {};
    }
  });

  const toggleBloque = (dia: string, bloque: string) => {
    const nuevaDisponibilidad = { ...disponibilidad };
    
    if (!nuevaDisponibilidad[dia]) {
      nuevaDisponibilidad[dia] = [];
    }
    
    const index = nuevaDisponibilidad[dia].indexOf(bloque);
    if (index > -1) {
      nuevaDisponibilidad[dia].splice(index, 1);
      if (nuevaDisponibilidad[dia].length === 0) {
        delete nuevaDisponibilidad[dia];
      }
    } else {
      nuevaDisponibilidad[dia].push(bloque);
    }
    
    setDisponibilidad(nuevaDisponibilidad);
    onChange(JSON.stringify(nuevaDisponibilidad));
  };

  const estaSeleccionado = (dia: string, bloque: string) => {
    return disponibilidad[dia]?.includes(bloque) || false;
  };

  const seleccionarDiaCompleto = (dia: string) => {
    const nuevaDisponibilidad = { ...disponibilidad };
    if (!nuevaDisponibilidad[dia] || nuevaDisponibilidad[dia].length < BLOQUES_HORARIO.length) {
      nuevaDisponibilidad[dia] = BLOQUES_HORARIO.map(b => b.key);
    } else {
      delete nuevaDisponibilidad[dia];
    }
    setDisponibilidad(nuevaDisponibilidad);
    onChange(JSON.stringify(nuevaDisponibilidad));
  };

  const seleccionarTodo = () => {
    const todos: DisponibilidadData = {};
    DIAS_SEMANA.forEach(dia => {
      todos[dia.key] = BLOQUES_HORARIO.map(b => b.key);
    });
    setDisponibilidad(todos);
    onChange(JSON.stringify(todos));
  };

  const limpiarTodo = () => {
    setDisponibilidad({});
    onChange(JSON.stringify({}));
  };

  const totalBloquesSeleccionados = Object.values(disponibilidad).reduce((acc, bloques) => acc + bloques.length, 0);
  const maxBloques = DIAS_SEMANA.length * BLOQUES_HORARIO.length;

  return (
    <div className="space-y-4">
      {/* Header con acciones rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Clock className="w-4 h-4 text-[#8B1E1E]" />
          <span className="font-medium">Selecciona tus horarios disponibles</span>
          <span className="text-xs text-slate-400">
            ({totalBloquesSeleccionados}/{maxBloques} bloques)
          </span>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={seleccionarTodo}
            className="px-3 py-1.5 text-xs font-bold text-[#8B1E1E] border border-[#8B1E1E]/20 rounded-lg hover:bg-[#8B1E1E]/5 transition-all flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Todo
          </button>
          <button
            type="button"
            onClick={limpiarTodo}
            className="px-3 py-1.5 text-xs font-bold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grid de calendario */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Header con días */}
        <div className="grid grid-cols-9 border-b border-slate-200 bg-slate-50">
          <div className="p-3 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center">
            Día
          </div>
          {BLOQUES_HORARIO.map(bloque => (
            <div key={bloque.key} className="p-2 text-center border-l border-slate-100">
              <div className="text-lg mb-0.5">{bloque.icon}</div>
              <div className="text-[10px] font-bold text-slate-600 leading-tight">{bloque.label}</div>
            </div>
          ))}
        </div>

        {/* Filas por día */}
        {DIAS_SEMANA.map((dia, idx) => (
          <div key={dia.key} className={`
            grid grid-cols-9 border-b border-slate-100 last:border-b-0 transition-colors
            ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
          `}>
            <div className="p-3 flex items-center">
              <button
                type="button"
                onClick={() => seleccionarDiaCompleto(dia.key)}
                className="font-bold text-slate-700 hover:text-[#8B1E1E] transition-colors text-sm"
                title="Click para seleccionar todo el día"
              >
                {dia.label}
              </button>
            </div>
            {BLOQUES_HORARIO.map(bloque => (
              <button
                key={bloque.key}
                type="button"
                onClick={() => toggleBloque(dia.key, bloque.key)}
                className={`
                  p-2 m-1.5 rounded-lg border transition-all flex items-center justify-center relative group
                  ${estaSeleccionado(dia.key, bloque.key)
                    ? 'bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50'
                  }
                `}
                title={bloque.label}
              >
                {estaSeleccionado(dia.key, bloque.key) && (
                  <Check className="w-3 h-3 absolute top-0.5 right-0.5" />
                )}
                <span className="text-sm">{bloque.icon}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Resumen de selección */}
      {Object.keys(disponibilidad).length > 0 && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
          <p className="text-xs font-bold text-emerald-800 mb-2">
            Horarios seleccionados:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(disponibilidad).map(([dia, bloques]) => (
              <span key={dia} className="px-2.5 py-1 bg-white border border-emerald-300 rounded-full text-[10px] font-bold text-emerald-700">
                {dia.charAt(0).toUpperCase() + dia.slice(1)} ({bloques.length})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instrucción */}
      <p className="text-[10px] text-slate-400 italic">
        💡 Click en un día para seleccionar todos sus horarios, o click en bloques individuales
      </p>
    </div>
  );
}
