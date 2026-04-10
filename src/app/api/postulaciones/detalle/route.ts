import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { postulacion_id } = await request.json();

    if (!postulacion_id) {
      return NextResponse.json({ error: 'ID de postulación requerido' }, { status: 400 });
    }

    const postulacion = await db.execute(async (prisma) => {
      return await prisma.postulacion.findFirst({
        where: {
          id: postulacion_id,
          id_estudiante: session.user.id
        },
        include: {
          convocatoria: {
            include: {
              categoria: true,
              programa: true,
              actividades: {
                where: {
                  esta_activa: true
                },
                orderBy: {
                  fecha_inicio: 'asc'
                }
              }
            }
          }
        }
      });
    }, 'Error al obtener detalles de postulación');

    if (!postulacion) {
      return NextResponse.json({ error: 'Postulación no encontrada' }, { status: 404 });
    }

    // Obtener reportes de horas por separado para evitar el error de tipo
    const reportesHoras = await db.execute(async (prisma) => {
      return await prisma.reporteHoras.findMany({
        where: {
          id_estudiante: session.user.id,
          id_convocatoria: postulacion.id_convocatoria
        },
        include: {
          actividad: {
            select: {
              nombre: true
            }
          }
        },
        orderBy: {
          reportado_en: 'desc'
        }
      });
    }, 'Error al obtener reportes de horas');

    return NextResponse.json({ postulacion: { ...postulacion, reportesHoras } });
  } catch (error) {
    console.error('Error en API de postulaciones:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
