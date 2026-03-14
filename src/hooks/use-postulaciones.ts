'use client';

import { useState, useEffect } from 'react';
import { Postulacion, EstadoPostulacion } from '@prisma/client';

interface DatosPostulacion {
  id_convocatoria: string;
  id_estudiante: string;
  motivacion?: string;
  url_hoja_vida?: string;
  habilidades_relevantes?: string[];
}

interface UsePostulacionesReturn {
  postular: (datos: DatosPostulacion) => Promise<{ success: boolean; error?: string; data?: Postulacion }>;
  cargando: boolean;
  error: string | null;
}

export function usePostulaciones(): UsePostulacionesReturn {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postular = async (datos: DatosPostulacion) => {
    try {
      setCargando(true);
      setError(null);

      const response = await fetch('/api/postulaciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datos),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear la postulación');
      }

      return { success: true, data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setCargando(false);
    }
  };

  return {
    postular,
    cargando,
    error,
  };
}

// Hook para obtener postulaciones de un estudiante
interface UsePostulacionesEstudianteReturn {
  postulaciones: any[]; // Usar any temporalmente hasta que se defina el tipo correcto
  cargando: boolean;
  error: string | null;
  recargar: () => Promise<void>;
}

export function usePostulacionesEstudiante(idEstudiante: string): UsePostulacionesEstudianteReturn {
  const [postulaciones, setPostulaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('🎯 Hook usePostulacionesEstudiante llamado con ID:', idEstudiante);

  const obtenerPostulaciones = async () => {
    console.log('🔄 obtenerPostulaciones llamado');
    try {
      setCargando(true);
      setError(null);

      const response = await fetch(`/api/postulaciones?id_estudiante=${idEstudiante}`);
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error('Error al obtener las postulaciones');
      }

      const data = await response.json();
      console.log('📦 Datos recibidos:', data);
      console.log('📋 Postulaciones en data:', data.postulaciones);
      setPostulaciones(data.postulaciones || []);
    } catch (err) {
      console.error('💥 Error en obtenerPostulaciones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPostulaciones([]);
    } finally {
      setCargando(false);
    }
  };

  const recargar = async () => {
    await obtenerPostulaciones();
  };

  // Cargar postulaciones al montar el componente
  useEffect(() => {
    if (idEstudiante) {
      obtenerPostulaciones();
    }
  }, [idEstudiante]);

  return {
    postulaciones,
    cargando,
    error,
    recargar,
  };
}