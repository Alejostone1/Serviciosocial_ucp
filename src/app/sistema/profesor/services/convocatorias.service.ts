import { prisma } from '@/lib/prisma';
import { EstadoConvocatoria } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getConvocatoriasForProfesor() {
  try {
    const convocatorias = await prisma.convocatoria.findMany({
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            color_hex: true,
          },
        },
        publicador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
          },
        },
        _count: {
          select: {
            postulaciones: true,
            actividades: true,
          },
        },
      },
      orderBy: {
        creado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(convocatorias);
  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    throw new Error('No se pudieron cargar las convocatorias');
  }
}

export async function getConvocatoriaById(id: string) {
  try {
    const convocatoria = await prisma.convocatoria.findUnique({
      where: { id },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            nivel_formacion: true,
          },
        },
        categoria: true,
        publicador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            rol: true,
          },
        },
        postulaciones: {
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
                    semestre_actual: true,
                    horas_acumuladas: true,
                    porcentaje_avance: true,
                  },
                },
              },
            },
          },
          orderBy: {
            postulado_en: 'desc',
          },
        },
        actividades: {
          include: {
            creador: {
              select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
              },
            },
            _count: {
              select: {
                reportes: true,
              },
            },
          },
          orderBy: {
            creado_en: 'desc',
          },
        },
        certificados: {
          include: {
            estudiante: {
              select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
              },
            },
          },
          orderBy: {
            emitido_en: 'desc',
          },
        },
      },
    });

    return transformDecimalsToNumbers(convocatoria);
  } catch (error) {
    console.error('Error al obtener convocatoria:', error);
    throw new Error('No se pudo cargar la convocatoria');
  }
}

export async function getConvocatoriasActivas() {
  try {
    const convocatorias = await prisma.convocatoria.findMany({
      where: {
        estado: {
          in: [EstadoConvocatoria.PUBLICADA, EstadoConvocatoria.EN_CURSO],
        },
      },
      include: {
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        categoria: {
          select: {
            id: true,
            nombre: true,
            color_hex: true,
          },
        },
        _count: {
          select: {
            postulaciones: true,
            actividades: true,
          },
        },
      },
      orderBy: {
        fecha_inicio: 'asc',
      },
    });

    return transformDecimalsToNumbers(convocatorias);
  } catch (error) {
    console.error('Error al obtener convocatorias activas:', error);
    throw new Error('No se pudieron cargar las convocatorias activas');
  }
}
