'use client';

import { useState, useEffect, useCallback } from 'react';
import { Convocatoria, CategoriaServicioSocial, Programa, Modalidad, EstadoConvocatoria } from '@prisma/client';

interface ConvocatoriaExtendida extends Convocatoria {
  categoria: CategoriaServicioSocial | null;
  programa: Programa | null;
  cupos_disponibles: number | null;
  porcentaje_ocupacion: number | null;
  total_horas_estimadas: number;
  ya_postulado: boolean;
  actividades: Array<{
    id: string;
    nombre: string;
    horas_estimadas: number;
    tipo_actividad: string;
  }>;
  _count: {
    postulaciones: number;
  };
}

interface Paginacion {
  pagina_actual: number;
  total_paginas: number;
  total_registros: number;
  registros_por_pagina: number;
}

interface FiltrosConvocatorias {
  estado: string;
  categoria: string;
  modalidad: string;
  buscar: string;
  pagina: number;
}

interface UseConvocatoriasReturn {
  convocatorias: ConvocatoriaExtendida[];
  cargando: boolean;
  error: string | null;
  paginacion: Paginacion | null;
  filtros: FiltrosConvocatorias;
  actualizarFiltros: (nuevosFiltros: Partial<FiltrosConvocatorias>) => void;
  recargar: () => void;
  limpiarFiltros: () => void;
}

const filtrosIniciales: FiltrosConvocatorias = {
  estado: 'PUBLICADA',
  categoria: 'todas',
  modalidad: 'todas',
  buscar: '',
  pagina: 1,
};

export function useConvocatorias(idEstudiante?: string): UseConvocatoriasReturn {
  const [convocatorias, setConvocatorias] = useState<ConvocatoriaExtendida[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [filtros, setFiltros] = useState<FiltrosConvocatorias>(filtrosIniciales);

  const obtenerConvocatorias = useCallback(async () => {
    try {
      setCargando(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('pagina', filtros.pagina.toString());
      params.append('limite', '12');

      if (filtros.estado && filtros.estado !== 'todas') {
        params.append('estado', filtros.estado);
      }
      if (filtros.categoria && filtros.categoria !== 'todas') {
        params.append('categoria', filtros.categoria);
      }
      if (filtros.modalidad && filtros.modalidad !== 'todas') {
        params.append('modalidad', filtros.modalidad);
      }
      if (filtros.buscar) {
        params.append('buscar', filtros.buscar);
      }
      // Enviar id_estudiante para que la API calcule ya_postulado
      if (idEstudiante) {
        params.append('id_estudiante', idEstudiante);
      }

      const response = await fetch(`/api/convocatorias?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar las convocatorias');
      }

      const data = await response.json();
      
      setConvocatorias(data.convocatorias);
      setPaginacion(data.paginacion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setConvocatorias([]);
      setPaginacion(null);
    } finally {
      setCargando(false);
    }
  }, [filtros, idEstudiante]);

  useEffect(() => {
    obtenerConvocatorias();
  }, [obtenerConvocatorias]);

  const actualizarFiltros = (nuevosFiltros: Partial<FiltrosConvocatorias>) => {
    setFiltros(prev => ({
      ...prev,
      ...nuevosFiltros,
      pagina: nuevosFiltros.pagina !== undefined ? nuevosFiltros.pagina : 1,
    }));
  };

  const recargar = () => {
    obtenerConvocatorias();
  };

  const limpiarFiltros = () => {
    setFiltros(filtrosIniciales);
  };

  return {
    convocatorias,
    cargando,
    error,
    paginacion,
    filtros,
    actualizarFiltros,
    recargar,
    limpiarFiltros,
  };
}