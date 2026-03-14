import { Decimal } from '@prisma/client/runtime/library';

/**
 * Convierte un objeto Decimal a un número de JavaScript
 * Si el valor es null o undefined, retorna null
 */
export function decimalToNumber(value: Decimal | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return value.toNumber();
}

/**
 * Convierte un objeto Decimal a un número de JavaScript
 * Si el valor es null o undefined, retorna 0
 */
export function decimalToNumberZero(value: Decimal | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return value.toNumber();
}

/**
 * Transforma recursivamente un objeto para convertir todos los valores Decimal a números
 */
export function transformDecimalsToNumbers(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (obj instanceof Decimal) {
    return obj.toNumber();
  }

  if (Array.isArray(obj)) {
    return obj.map(item => transformDecimalsToNumbers(item));
  }

  if (typeof obj === 'object') {
    const transformed: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        transformed[key] = transformDecimalsToNumbers(obj[key]);
      }
    }
    return transformed;
  }

  return obj;
}

/**
 * Específico para modelos de Prisma con campos Decimal conocidos
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
