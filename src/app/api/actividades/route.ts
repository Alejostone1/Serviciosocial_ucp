import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TipoActividad } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { convocatoria_ids, id_estudiante } = body;

    // Validar que los IDs sean UUIDs válidos
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!convocatoria_ids || !Array.isArray(convocatoria_ids)) {
      return NextResponse.json(
        { error: 'IDs de convocatorias inválidos' },
        { status: 400 }
      );
    }

    if (!id_estudiante || !uuidRegex.test(id_estudiante)) {
      return NextResponse.json(
        { error: 'ID de estudiante inválido' },
        { status: 400 }
      );
    }

    // Validar cada ID de convocatoria
    for (const id of convocatoria_ids) {
      if (!uuidRegex.test(id)) {
        return NextResponse.json(
          { error: `ID de convocatoria inválido: ${id}` },
          { status: 400 }
        );
      }
    }

    const actividades = await prisma.actividad.findMany({
      where: {
        id_convocatoria: {
          in: convocatoria_ids
        },
        esta_activa: true
      },
      include: {
        convocatoria: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            modalidad: true,
            lugar: true,
            categoria: {
              select: {
                id: true,
                nombre: true,
                color_hex: true
              }
            }
          }
        },
        reportes: {
          select: {
            id_estudiante: true,
            horas_reportadas: true
          },
          where: {
            id_estudiante: id_estudiante
          },
          orderBy: {
            reportado_en: 'desc'
          }
        }
      },
      orderBy: [
        { fecha_inicio: 'asc' },
        { tipo_actividad: 'asc' }
      ]
    });

    // Enriquecer datos de actividades con información de reportes
    const actividadesEnriquecidas = actividades.map(actividad => ({
      ...actividad,
      horas_reportadas: actividad.reportes?.reduce((total, reporte) => 
        total + Number(reporte.horas_reportadas || 0), 0
      ) || 0,
      estado: actividad.reportes?.length > 0 ? 'CON_REPORTE' : 'SIN_REPORTE'
    }));

    return NextResponse.json({
      actividades: actividadesEnriquecidas,
      total: actividadesEnriquecidas.length
    });

  } catch (error) {
    console.error('Error al obtener actividades:', error);
    return NextResponse.json(
      { error: 'Error al obtener actividades' },
      { status: 500 }
    );
  }
}
