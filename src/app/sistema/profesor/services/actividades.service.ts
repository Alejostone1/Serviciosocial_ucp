import { prisma } from '@/lib/prisma';
import { TipoActividad } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getActividadesForProfesor() {
  try {
    const actividades = await prisma.actividad.findMany({
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
        creador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            rol: true,
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
    });

    return transformDecimalsToNumbers(actividades);
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    throw new Error('No se pudieron cargar las actividades');
  }
}

export async function getActividadById(id: string) {
  try {
    const actividad = await prisma.actividad.findUnique({
      where: { id },
      include: {
        convocatoria: {
          include: {
            programa: true,
            categoria: true,
            publicador: true,
          },
        },
        creador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            rol: true,
          },
        },
        reportes: {
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
            reportado_en: 'desc',
          },
        },
      },
    });

    return transformDecimalsToNumbers(actividad);
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    throw new Error('No se pudo cargar la actividad');
  }
}

export async function getActividadesActivas() {
  try {
    const actividades = await prisma.actividad.findMany({
      where: {
        esta_activa: true,
      },
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
        _count: {
          select: {
            reportes: true,
          },
        },
      },
      orderBy: {
        fecha_limite: 'asc',
      },
    });

    return transformDecimalsToNumbers(actividades);
  } catch (error) {
    console.error('Error al obtener actividades activas:', error);
    throw new Error('No se pudieron cargar las actividades activas');
  }
}

export async function createActividad(data: {
  id_convocatoria: string;
  nombre: string;
  descripcion?: string;
  tipo_actividad: TipoActividad;
  horas_estimadas: number;
  horas_maximas?: number;
  fecha_inicio?: Date;
  fecha_limite?: Date;
  ubicacion?: string;
  materiales_requeridos?: string[];
  creado_por: string;
}) {
  try {
    const actividad = await prisma.actividad.create({
      data: {
        ...data,
        horas_estimadas: data.horas_estimadas,
        horas_maximas: data.horas_maximas,
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
        creador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
          },
        },
      },
    });

    return transformDecimalsToNumbers(actividad);
  } catch (error) {
    console.error('Error al crear actividad:', error);
    throw new Error('No se pudo crear la actividad');
  }
}

export async function updateActividad(id: string, data: Partial<{
  nombre: string;
  descripcion: string;
  tipo_actividad: TipoActividad;
  horas_estimadas: number;
  horas_maximas: number;
  fecha_inicio: Date;
  fecha_limite: Date;
  ubicacion: string;
  materiales_requeridos: string[];
  esta_activa: boolean;
}>) {
  try {
    const actividad = await prisma.actividad.update({
      where: { id },
      data,
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
        creador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
          },
        },
      },
    });

    return transformDecimalsToNumbers(actividad);
  } catch (error) {
    console.error('Error al actualizar actividad:', error);
    throw new Error('No se pudo actualizar la actividad');
  }
}
