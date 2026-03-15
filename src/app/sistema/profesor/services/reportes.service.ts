import { prisma } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getReportesForProfesor() {
  try {
    const reportes = await prisma.reporteHoras.findMany({
      include: {
        actividad: {
          include: {
            convocatoria: {
              select: {
                id: true,
                titulo: true,
                programa: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                horas_acumuladas: true,
                porcentaje_avance: true,
              },
            },
          },
        },
        revisor: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            rol: true,
          },
        },
        historial: {
          include: {
            modificador: {
              select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                rol: true,
              },
            },
          },
          orderBy: {
            modificado_en: 'desc',
          },
        },
      },
      orderBy: {
        reportado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(reportes);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    throw new Error('No se pudieron cargar los reportes');
  }
}

export async function getReporteById(id: string) {
  try {
    const reporte = await prisma.reporteHoras.findUnique({
      where: { id },
      include: {
        actividad: {
          include: {
            convocatoria: {
              include: {
                programa: true,
                categoria: true,
              },
            },
          },
        },
        estudiante: {
          include: {
            perfil_estudiante: true,
            programa: true,
          },
        },
        revisor: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            rol: true,
          },
        },
        historial: {
          include: {
            modificador: {
              select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                rol: true,
              },
            },
          },
          orderBy: {
            modificado_en: 'desc',
          },
        },
      },
    });

    return transformDecimalsToNumbers(reporte);
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    throw new Error('No se pudo cargar el reporte');
  }
}

export async function getReportesPendientesRevision() {
  try {
    const reportes = await prisma.reporteHoras.findMany({
      where: {
        estado: {
          in: [EstadoReporte.PENDIENTE_VALIDACION, EstadoReporte.EN_REVISION, 'VALIDADO_AUXILIAR' as any],
        },
      },
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            convocatoria: {
              select: {
                id: true,
                titulo: true,
                programa: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                horas_acumuladas: true,
              },
            },
          },
        },
      },
      orderBy: {
        reportado_en: 'asc',
      },
    });

    return transformDecimalsToNumbers(reportes);
  } catch (error) {
    console.error('Error al obtener reportes pendientes:', error);
    throw new Error('No se pudieron cargar los reportes pendientes');
  }
}

export async function updateReporte(
  id: string,
  data: {
    estado: EstadoReporte;
    id_revisor: string;
    horas_aprobadas?: number;
    notas_revisor?: string;
    motivo_rechazo?: string;
  }
) {
  try {
    const reporte = await prisma.reporteHoras.update({
      where: { id },
      data: {
        ...data,
        revisado_en: new Date(),
      },
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            convocatoria: {
              select: {
                id: true,
                titulo: true,
                programa: {
                  select: {
                    id: true,
                    nombre: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                horas_acumuladas: true,
              },
            },
          },
        },
        revisor: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            rol: true,
          },
        },
      },
    });

    return transformDecimalsToNumbers(reporte);
  } catch (error) {
    console.error('Error al actualizar reporte:', error);
    throw new Error('No se pudo actualizar el reporte');
  }
}

export async function getReportesByEstudiante(estudianteId: string) {
  try {
    const reportes = await prisma.reporteHoras.findMany({
      where: {
        id_estudiante: estudianteId,
      },
      include: {
        actividad: {
          select: {
            id: true,
            nombre: true,
            convocatoria: {
              select: {
                id: true,
                titulo: true,
              },
            },
          },
        },
        revisor: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            rol: true,
          },
        },
      },
      orderBy: {
        reportado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(reportes);
  } catch (error) {
    console.error('Error al obtener reportes por estudiante:', error);
    throw new Error('No se pudieron cargar los reportes del estudiante');
  }
}

export async function getReportesByActividad(actividadId: string) {
  try {
    const reportes = await prisma.reporteHoras.findMany({
      where: {
        id_actividad: actividadId,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                horas_acumuladas: true,
              },
            },
          },
        },
        revisor: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            rol: true,
          },
        },
      },
      orderBy: {
        reportado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(reportes);
  } catch (error) {
    console.error('Error al obtener reportes por actividad:', error);
    throw new Error('No se pudieron cargar los reportes de la actividad');
  }
}
