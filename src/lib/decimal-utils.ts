/**
 * Utilidades para manejar objetos Decimal de Prisma en Client Components
 * Estas funciones son seguras para usar tanto en Server como en Client Components
 */

/**
 * Convierte un objeto Decimal a un número de JavaScript
 * Si el valor es null o undefined, retorna null
 * Función segura para Client Components
 */
export function decimalToNumber(value: any): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Si ya es un número, retornarlo directamente
  if (typeof value === 'number') {
    return value;
  }
  
  // Si es un objeto Decimal de Prisma, convertirlo
  if (typeof value === 'object' && value.toNumber) {
    return value.toNumber();
  }
  
  // Si es string, intentar convertir a número
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? 0 : parsed;
  }
  
  // Por defecto, intentar convertir a número
  return Number(value) || 0;
}

/**
 * Convierte un objeto Decimal a un número de JavaScript
 * Si el valor es null o undefined, retorna 0
 * Función segura para Client Components
 */
export function decimalToNumberZero(value: any): number {
  const result = decimalToNumber(value);
  return result === null ? 0 : result;
}

/**
 * Transforma recursivamente un objeto para convertir todos los valores Decimal a números
 * Función segura para Client Components
 */
export function transformDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Si es un objeto Date, retornarlo como está
  if (obj instanceof Date) {
    return obj;
  }

  // Si es un objeto Decimal de Prisma
  if (typeof obj === 'object' && obj.toNumber) {
    return obj.toNumber();
  }

  // Si ya es un número primitivo
  if (typeof obj === 'number') {
    return obj;
  }

  // Si es un array, procesar cada elemento
  if (Array.isArray(obj)) {
    return obj.map(item => transformDecimalsToNumbers(item));
  }

  // Si es un objeto, procesar cada propiedad recursivamente
  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        transformed[key] = transformDecimalsToNumbers(obj[key]);
      }
    }
    return transformed;
  }

  // Para cualquier otro tipo, retornar como está
  return obj;
}

/**
 * Específico para modelos de Prisma con campos Decimal conocidos
 * Función segura para Client Components
 */
export function sanitizePrograma(programa: any) {
  return {
    ...programa,
    horas_requeridas: decimalToNumber(programa.horas_requeridas),
  };
}

export function sanitizeConvocatoria(convocatoria: any) {
  return {
    ...convocatoria,
    horas_totales_ofrecidas: decimalToNumber(convocatoria.horas_totales_ofrecidas),
  };
}

export function sanitizePerfilEstudiante(perfil: any) {
  return {
    ...perfil,
    horas_previas: decimalToNumber(perfil.horas_previas),
    horas_acumuladas: decimalToNumber(perfil.horas_acumuladas),
    porcentaje_avance: decimalToNumber(perfil.porcentaje_avance),
  };
}

export function sanitizeActividad(actividad: any) {
  return {
    ...actividad,
    horas_estimadas: decimalToNumber(actividad.horas_estimadas),
    horas_maximas: decimalToNumber(actividad.horas_maximas),
  };
}

export function sanitizeReporteHoras(reporte: any) {
  return {
    ...reporte,
    horas_reportadas: decimalToNumber(reporte.horas_reportadas),
    horas_aprobadas: decimalToNumber(reporte.horas_aprobadas),
  };
}

export function sanitizeHistorialHoras(historial: any) {
  return {
    ...historial,
    horas_anteriores: decimalToNumber(historial.horas_anteriores),
    horas_nuevas: decimalToNumber(historial.horas_nuevas),
  };
}

export function sanitizeCertificado(certificado: any) {
  return {
    ...certificado,
    total_horas: decimalToNumber(certificado.total_horas),
  };
}
