import { prisma } from '@/lib/prisma';
import { Rol } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getEstudiantesForProfesor() {
  try {
    const estudiantes = await prisma.usuario.findMany({
      where: {
        rol: Rol.ESTUDIANTE,
      },
      include: {
        perfil_estudiante: true,
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            nivel_formacion: true,
            horas_requeridas: true,
            facultad: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        postulaciones_enviadas: {
          include: {
            convocatoria: {
              select: {
                id: true,
                titulo: true,
                estado: true,
              },
            },
          },
        },
        reportes_como_estudiante: {
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
          },
        },
        certificados_obtenidos: {
          select: {
            id: true,
            total_horas: true,
            emitido_en: true,
            esta_vigente: true,
          },
        },
      },
      orderBy: {
        primer_apellido: 'asc',
        primer_nombre: 'asc',
      },
    });

    return transformDecimalsToNumbers(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes:', error);
    throw new Error('No se pudieron cargar los estudiantes');
  }
}

export async function getEstudianteById(id: string) {
  try {
    const estudiante = await prisma.usuario.findUnique({
      where: { 
        id,
        rol: Rol.ESTUDIANTE,
      },
      include: {
        perfil_estudiante: true,
        programa: {
          include: {
            facultad: true,
          },
        },
        postulaciones_enviadas: {
          include: {
            convocatoria: {
              include: {
                programa: true,
                categoria: true,
                publicador: true,
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
        },
        reportes_como_estudiante: {
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
            },
          },
          orderBy: {
            reportado_en: 'desc',
          },
        },
        certificados_obtenidos: {
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
            emisor: {
              select: {
                id: true,
                primer_nombre: true,
                primer_apellido: true,
                rol: true,
              },
            },
          },
          orderBy: {
            emitido_en: 'desc',
          },
        },
      },
    });

    return transformDecimalsToNumbers(estudiante);
  } catch (error) {
    console.error('Error al obtener estudiante:', error);
    throw new Error('No se pudo cargar el estudiante');
  }
}

export async function getEstudiantesByPrograma(programaId: string) {
  try {
    const estudiantes = await prisma.usuario.findMany({
      where: {
        rol: Rol.ESTUDIANTE,
        id_programa: programaId,
      },
      include: {
        perfil_estudiante: true,
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            nivel_formacion: true,
            horas_requeridas: true,
          },
        },
        _count: {
          select: {
            postulaciones_enviadas: true,
            reportes_como_estudiante: true,
            certificados_obtenidos: true,
          },
        },
      },
      orderBy: {
        primer_apellido: 'asc',
        primer_nombre: 'asc',
      },
    });

    return transformDecimalsToNumbers(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes por programa:', error);
    throw new Error('No se pudieron cargar los estudiantes del programa');
  }
}

export async function getEstudiantesActivos() {
  try {
    const estudiantes = await prisma.usuario.findMany({
      where: {
        rol: Rol.ESTUDIANTE,
        esta_bloqueado: false,
      },
      include: {
        perfil_estudiante: true,
        programa: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            nivel_formacion: true,
          },
        },
        _count: {
          select: {
            postulaciones_enviadas: {
              where: {
                estado: 'ACEPTADA',
              },
            },
            reportes_como_estudiante: {
              where: {
                estado: 'APROBADO',
              },
            },
          },
        },
      },
      orderBy: {
        ultimo_acceso: 'desc',
      },
    });

    return transformDecimalsToNumbers(estudiantes);
  } catch (error) {
    console.error('Error al obtener estudiantes activos:', error);
    throw new Error('No se pudieron cargar los estudiantes activos');
  }
}

export async function getEstadisticasEstudiantes() {
  try {
    const [
      totalEstudiantes,
      estudiantesActivos,
      estudiantesPorPrograma,
      estudiantesConPostulacionesAceptadas,
      estudiantesConCertificados,
    ] = await Promise.all([
      // Total de estudiantes
      prisma.usuario.count({
        where: { rol: Rol.ESTUDIANTE },
      }),
      
      // Estudiantes activos (no bloqueados)
      prisma.usuario.count({
        where: { 
          rol: Rol.ESTUDIANTE,
          esta_bloqueado: false,
        },
      }),
      
      // Estudiantes por programa
      prisma.usuario.groupBy({
        by: ['id_programa'],
        where: { rol: Rol.ESTUDIANTE },
        _count: true,
      }),
      
      // Estudiantes con postulaciones aceptadas
      prisma.usuario.count({
        where: {
          rol: Rol.ESTUDIANTE,
          postulaciones_enviadas: {
            some: {
              estado: 'ACEPTADA',
            },
          },
        },
      }),
      
      // Estudiantes con certificados
      prisma.usuario.count({
        where: {
          rol: Rol.ESTUDIANTE,
          certificados_obtenidos: {
            some: {
              esta_vigente: true,
            },
          },
        },
      }),
    ]);

    return {
      total: totalEstudiantes,
      activos: estudiantesActivos,
      porPrograma: estudiantesPorPrograma,
      conPostulacionesAceptadas: estudiantesConPostulacionesAceptadas,
      conCertificados: estudiantesConCertificados,
    };
  } catch (error) {
    console.error('Error al obtener estadísticas de estudiantes:', error);
    throw new Error('No se pudieron cargar las estadísticas');
  }
}
