import { prisma } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { z } from 'zod';

// Schema de validación para crear reporte con múltiples fechas
const crearReporteConFechasSchema = z.object({
  id_actividad: z.string().uuid('Actividad inválida'),
  descripcion_trabajo: z.string().min(10, 'Mínimo 10 caracteres').max(1000, 'Máximo 1000 caracteres'),
  notas_estudiante: z.string().max(300, 'Máximo 300 caracteres').optional(),
  fechas: z.array(z.object({
    fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)'),
    horas: z.number().min(0.5, 'Mínimo 0.5 horas por fecha').max(24, 'Máximo 24 horas por fecha'),
    descripcion: z.string().max(500, 'Máximo 500 caracteres').optional()
  })).min(1, 'Debe haber al menos una fecha').max(20, 'Máximo 20 fechas por reporte')
});

export interface CrearReporteConFechasInput {
  id_actividad: string;
  descripcion_trabajo: string;
  notas_estudiante?: string;
  fechas: Array<{
    fecha: string;
    horas: number;
    descripcion?: string;
  }>;
}

export class ReporteHorasService {
  /**
   * Crear un reporte con múltiples fechas
   */
  static async crearConFechas(data: CrearReporteConFechasInput, estudianteId: string) {
    // Validar datos
    const validated = crearReporteConFechasSchema.parse(data);
    
    // Verificar actividad existe y está activa
    const actividad = await prisma.actividad.findUnique({
      where: { id: validated.id_actividad },
      include: {
        convocatoria: true
      }
    });
    
    if (!actividad) {
      throw new Error('Actividad no encontrada');
    }
    
    if (!actividad.esta_activa) {
      throw new Error('La actividad no está activa');
    }
    
    // Validar rango de fechas de la convocatoria
    const fechaInicio = actividad.fecha_inicio 
      ? new Date(actividad.fecha_inicio) 
      : new Date('2020-01-01');
    const fechaFin = actividad.fecha_limite 
      ? new Date(actividad.fecha_limite) 
      : new Date('2030-12-31');
    
    for (const detalle of validated.fechas) {
      const fecha = new Date(detalle.fecha);
      if (fecha < fechaInicio || fecha > fechaFin) {
        throw new Error(
          `Fecha ${detalle.fecha} fuera del rango de la convocatoria (${fechaInicio.toISOString().split('T')[0]} - ${fechaFin.toISOString().split('T')[0]})`
        );
      }
    }
    
    // Validar que no haya fechas duplicadas
    const fechasUnicas = new Set(validated.fechas.map(f => f.fecha));
    if (fechasUnicas.size !== validated.fechas.length) {
      throw new Error('Hay fechas duplicadas en el reporte');
    }
    
    // Calcular total de horas
    const totalHoras = validated.fechas.reduce((sum, f) => sum + f.horas, 0);
    
    // Validar que el total no exceda el límite (3x las estimadas para permitir reportar todas las horas)
    const horasEstimadas = Number(actividad.horas_estimadas);
    if (totalHoras > horasEstimadas * 3) {
      throw new Error(
        `El total de horas (${totalHoras}h) excede el límite permitido (${horasEstimadas * 3}h)`
      );
    }
    
    // Crear reporte y detalles en transacción atómica
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear reporte principal
      const reporte = await tx.reporteHoras.create({
        data: {
          id_estudiante: estudianteId,
          id_actividad: validated.id_actividad,
          id_convocatoria: actividad.id_convocatoria,
          horas_reportadas: totalHoras,
          descripcion_trabajo: validated.descripcion_trabajo,
          notas_estudiante: validated.notas_estudiante,
          estado: EstadoReporte.REPORTADO,
          reportado_en: new Date()
        }
      });
      
      // Crear detalles de fechas
      for (const f of validated.fechas) {
        await tx.$executeRaw`
          INSERT INTO "detalles_fechas_reportes" (id, id_reporte, fecha, horas, descripcion, creado_en)
          VALUES (gen_random_uuid(), ${reporte.id}::uuid, ${new Date(f.fecha)}, ${f.horas}, ${f.descripcion || null}, NOW())
        `;
      }
      
      return reporte;
    });
    
    // Convertir Decimal a number para serialización
    return {
      ...resultado,
      horas_reportadas: Number(resultado.horas_reportadas),
      horas_aprobadas: resultado.horas_aprobadas ? Number(resultado.horas_aprobadas) : null
    };
  }
  
  /**
   * Obtener reporte con todos sus detalles
   */
  static async obtenerConDetalles(id: string) {
    const reporte = await prisma.reporteHoras.findUnique({
      where: { id },
      include: {
        actividad: {
          include: {
            convocatoria: {
              select: {
                titulo: true,
                fecha_inicio: true,
                fecha_fin: true,
                modalidad: true
              }
            }
          }
        },
        evidencias: true,
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            segundo_nombre: true,
            primer_apellido: true,
            segundo_apellido: true,
            correo: true
          }
        }
      }
    });
    
    if (!reporte) return null;
    
    // Obtener detalles con raw query
    const detalles = await prisma.$queryRaw<Array<{
      id: string;
      fecha: Date;
      horas: number;
      descripcion: string | null;
      creado_en: Date;
    }>>`
      SELECT id, fecha, horas, descripcion, creado_en
      FROM "detalles_fechas_reportes"
      WHERE id_reporte = ${id}
      ORDER BY fecha ASC
    `;
    
    return {
      ...reporte,
      detalles_fechas: detalles.map(d => ({
        ...d,
        horas: Number(d.horas)
      }))
    };
  }
  
  /**
   * Obtener reportes de un estudiante con detalles
   */
  static async obtenerPorEstudiante(estudianteId: string, opciones?: {
    estado?: EstadoReporte;
    limit?: number;
    offset?: number;
  }) {
    return await prisma.reporteHoras.findMany({
      where: {
        id_estudiante: estudianteId,
        ...(opciones?.estado && { estado: opciones.estado })
      },
      include: {
        actividad: {
          select: {
            nombre: true,
            tipo_actividad: true,
            convocatoria: {
              select: {
                titulo: true
              }
            }
          }
        },
        evidencias: true
      },
      orderBy: {
        reportado_en: 'desc'
      },
      take: opciones?.limit,
      skip: opciones?.offset
    });
  }
  
  /**
   * Validar que un estudiante no tenga reportes duplicados para las mismas fechas
   */
  static async validarSinDuplicadosFechas(
    estudianteId: string,
    idActividad: string,
    fechas: string[],
    idReporteExcluir?: string
  ) {
    // Verificar duplicados en el array
    const fechasUnicas = new Set(fechas);
    if (fechasUnicas.size !== fechas.length) {
      throw new Error('Hay fechas duplicadas en el reporte');
    }
    
    // Verificar duplicados en BD (excluyendo el reporte actual si es edición)
    // Usar raw query mientras el cliente Prisma no se actualiza
    const detallesExistentes = await prisma.$queryRaw<Array<{fecha: Date}>>`
      SELECT dfr.fecha 
      FROM "detalles_fechas_reportes" dfr
      INNER JOIN "reportes_horas" rh ON dfr.id_reporte = rh.id
      WHERE rh.id_estudiante = ${estudianteId}
        AND rh.id_actividad = ${idActividad}
        ${idReporteExcluir ? prisma.$queryRaw`AND rh.id != ${idReporteExcluir}` : prisma.$queryRaw``}
    `;
    
    const fechasExistentes = new Set<string>();
    for (const detalle of detallesExistentes) {
      fechasExistentes.add(detalle.fecha.toISOString().split('T')[0]);
    }
    
    for (const fecha of fechas) {
      if (fechasExistentes.has(fecha)) {
        throw new Error(`La fecha ${fecha} ya fue reportada en otro reporte para esta actividad`);
      }
    }
  }
}
