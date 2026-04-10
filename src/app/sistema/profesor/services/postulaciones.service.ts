import { prisma } from '@/lib/prisma';
import { EstadoPostulacion } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getPostulacionesForProfesor() {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      include: {
        convocatoria: {
          select: {
            id: true,
            titulo: true,
            estado: true,
            programa: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
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
            telefono: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                semestre_actual: true,
                horas_acumuladas: true,
                porcentaje_avance: true,
                habilidades: true,
                intereses: true,
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
        postulado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(postulaciones);
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    throw new Error('No se pudieron cargar las postulaciones');
  }
}

export async function getPostulacionById(id: string) {
  try {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id },
      include: {
        convocatoria: {
          include: {
            programa: true,
            categoria: true,
            publicador: true,
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
      },
    });

    return transformDecimalsToNumbers(postulacion);
  } catch (error) {
    console.error('Error al obtener postulación:', error);
    throw new Error('No se pudo cargar la postulación');
  }
}

export async function getPostulacionesPendientes() {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      where: {
        estado: EstadoPostulacion.PENDIENTE,
      },
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
              },
            },
          },
        },
      },
      orderBy: {
        postulado_en: 'asc',
      },
    });

    return transformDecimalsToNumbers(postulaciones);
  } catch (error) {
    console.error('Error al obtener postulaciones pendientes:', error);
    throw new Error('No se pudieron cargar las postulaciones pendientes');
  }
}

export async function updatePostulacion(
  id: string,
  data: {
    estado: EstadoPostulacion;
    revisado_por: string;
    notas_revision?: string;
    fecha_entrevista?: Date;
    url_acta_entrevista?: string;
  }
) {
  try {
    const postulacion = await prisma.postulacion.update({
      where: { id },
      data: {
        ...data,
        revisado_en: new Date(),
      },
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
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
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

    return transformDecimalsToNumbers(postulacion);
  } catch (error) {
    console.error('Error al actualizar postulación:', error);
    throw new Error('No se pudo actualizar la postulación');
  }
}

export async function getPostulacionesByConvocatoria(convocatoriaId: string) {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      where: {
        id_convocatoria: convocatoriaId,
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
                semestre_actual: true,
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
      },
      orderBy: {
        postulado_en: 'desc',
      },
    });

    return transformDecimalsToNumbers(postulaciones);
  } catch (error) {
    console.error('Error al obtener postulaciones por convocatoria:', error);
    throw new Error('No se pudieron cargar las postulaciones');
  }
}
