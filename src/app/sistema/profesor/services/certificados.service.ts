import { prisma } from '@/lib/prisma';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function getCertificadosForProfesor() {
  try {
    const certificados = await prisma.certificado.findMany({
      include: {
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
            numero_documento: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
                horas_acumuladas: true,
                porcentaje_avance: true,
              },
            },
            programa: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
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
    });

    return transformDecimalsToNumbers(certificados);
  } catch (error) {
    console.error('Error al obtener certificados:', error);
    throw new Error('No se pudieron cargar los certificados');
  }
}

export async function getCertificadoById(id: string) {
  try {
    const certificado = await prisma.certificado.findUnique({
      where: { id },
      include: {
        estudiante: {
          include: {
            perfil_estudiante: true,
            programa: true,
          },
        },
        convocatoria: {
          include: {
            programa: true,
            categoria: true,
            publicador: true,
          },
        },
        emisor: {
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

    return transformDecimalsToNumbers(certificado);
  } catch (error) {
    console.error('Error al obtener certificado:', error);
    throw new Error('No se pudo cargar el certificado');
  }
}

export async function createCertificado(data: {
  id_estudiante: string;
  id_convocatoria?: string;
  emitido_por: string;
  total_horas: number;
  periodo_desde?: Date;
  periodo_hasta?: Date;
  descripcion?: string;
  nombre_aliado?: string;
  nombre_convocatoria?: string;
}) {
  try {
    const certificado = await prisma.certificado.create({
      data: {
        ...data,
        codigo_verificacion: crypto.randomUUID(),
        url_pdf: '', // TODO: Generate PDF URL
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
            programa: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
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
    });

    return transformDecimalsToNumbers(certificado);
  } catch (error) {
    console.error('Error al crear certificado:', error);
    throw new Error('No se pudo crear el certificado');
  }
}

export async function updateCertificado(id: string, data: Partial<{
  total_horas: number;
  periodo_desde: Date;
  periodo_hasta: Date;
  descripcion: string;
  nombre_aliado: string;
  nombre_convocatoria: string;
  url_pdf: string;
  esta_vigente: boolean;
  motivo_anulacion: string;
}>) {
  try {
    const certificado = await prisma.certificado.update({
      where: { id },
      data,
      include: {
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
          },
        },
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
    });

    return transformDecimalsToNumbers(certificado);
  } catch (error) {
    console.error('Error al actualizar certificado:', error);
    throw new Error('No se pudo actualizar el certificado');
  }
}

export async function anularCertificado(id: string, motivo_anulacion: string, emitido_por: string) {
  try {
    const certificado = await prisma.certificado.update({
      where: { id },
      data: {
        esta_vigente: false,
        motivo_anulacion,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
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
    });

    return transformDecimalsToNumbers(certificado);
  } catch (error) {
    console.error('Error al anular certificado:', error);
    throw new Error('No se pudo anular el certificado');
  }
}

export async function getCertificadosByEstudiante(estudianteId: string) {
  try {
    const certificados = await prisma.certificado.findMany({
      where: {
        id_estudiante: estudianteId,
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
    });

    return transformDecimalsToNumbers(certificados);
  } catch (error) {
    console.error('Error al obtener certificados por estudiante:', error);
    throw new Error('No se pudieron cargar los certificados del estudiante');
  }
}

export async function verificarCertificado(codigo: string) {
  try {
    const certificado = await prisma.certificado.findUnique({
      where: {
        codigo_verificacion: codigo,
        esta_vigente: true,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            numero_documento: true,
            perfil_estudiante: {
              select: {
                codigo_estudiantil: true,
              },
            },
            programa: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
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
    });

    return transformDecimalsToNumbers(certificado);
  } catch (error) {
    console.error('Error al verificar certificado:', error);
    throw new Error('No se pudo verificar el certificado');
  }
}
