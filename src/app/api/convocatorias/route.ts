import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EstadoConvocatoria } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get('estado');
    const categoria = searchParams.get('categoria');
    const modalidad = searchParams.get('modalidad');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');
    const buscar = searchParams.get('buscar');

    const skip = (pagina - 1) * limite;

    // Construir filtro dinámico
    const where: any = {
      estado: EstadoConvocatoria.PUBLICADA, // Solo convocatorias publicadas
    };

    if (estado && estado !== 'todas') {
      where.estado = estado as EstadoConvocatoria;
    }

    if (categoria && categoria !== 'todas') {
      where.id_categoria = categoria;
    }

    if (modalidad && modalidad !== 'todas') {
      where.modalidad = modalidad;
    }

    if (buscar) {
      where.OR = [
        { titulo: { contains: buscar, mode: 'insensitive' } },
        { descripcion: { contains: buscar, mode: 'insensitive' } },
        { lugar: { contains: buscar, mode: 'insensitive' } },
      ];
    }

    // Obtener convocatorias con relaciones
    const [convocatorias, total] = await Promise.all([
      prisma.convocatoria.findMany({
        where,
        include: {
          categoria: true,
          programa: true,
          publicador: {
            select: {
              id: true,
              primer_nombre: true,
              primer_apellido: true,
              correo: true,
            },
          },
          actividades: {
            select: {
              id: true,
              nombre: true,
              horas_estimadas: true,
              tipo_actividad: true,
            },
          },
          postulaciones: {
            select: {
              id: true,
              estado: true,
            },
          },
          _count: {
            select: {
              postulaciones: true,
            },
          },
        },
        orderBy: [
          { fecha_inicio: 'desc' },
          { creado_en: 'desc' },
        ],
        skip,
        take: limite,
      }),
      prisma.convocatoria.count({ where }),
    ]);

    // Calcular cupos disponibles y estadísticas
    const convocatoriasConEstadisticas = transformDecimalsToNumbers(convocatorias.map(conv => ({
      ...conv,
      cupos_disponibles: conv.cupo_maximo ? conv.cupo_maximo - conv._count.postulaciones : null,
      porcentaje_ocupacion: conv.cupo_maximo ? (conv._count.postulaciones / conv.cupo_maximo) * 100 : null,
      total_horas_estimadas: conv.actividades.reduce((sum, act) => sum + Number(act.horas_estimadas), 0),
      ya_postulado: false, // Esto se establecerá en el frontend con el ID del usuario
    })));

    return NextResponse.json({
      convocatorias: convocatoriasConEstadisticas,
      paginacion: {
        pagina_actual: pagina,
        total_paginas: Math.ceil(total / limite),
        total_registros: total,
        registros_por_pagina: limite,
      },
    });
  } catch (error) {
    console.error('Error al obtener convocatorias:', error);
    return NextResponse.json(
      { error: 'Error al obtener convocatorias' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titulo,
      descripcion,
      objetivo,
      id_categoria,
      id_programa,
      modalidad,
      lugar,
      url_convocatoria_externa,
      competencias_requeridas,
      fecha_inicio,
      fecha_fin,
      fecha_cierre_postulacion,
      cupo_maximo,
      horas_totales_ofrecidas,
      url_banner,
      url_documento_adicional,
      requiere_entrevista,
      publicado_por,
    } = body;

    // Validaciones básicas
    if (!titulo || !descripcion || !id_categoria || !modalidad || !fecha_inicio || !publicado_por) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios' },
        { status: 400 }
      );
    }

    const convocatoria = await prisma.convocatoria.create({
      data: {
        titulo,
        descripcion,
        objetivo,
        id_categoria,
        id_programa,
        modalidad,
        lugar,
        url_convocatoria_externa,
        competencias_requeridas,
        estado: EstadoConvocatoria.BORRADOR,
        fecha_inicio: new Date(fecha_inicio),
        fecha_fin: fecha_fin ? new Date(fecha_fin) : null,
        fecha_cierre_postulacion: fecha_cierre_postulacion ? new Date(fecha_cierre_postulacion) : null,
        cupo_maximo,
        cupo_disponible: cupo_maximo,
        horas_totales_ofrecidas,
        url_banner,
        url_documento_adicional,
        requiere_entrevista,
        publicado_por,
      },
      include: {
        categoria: true,
        programa: true,
        publicador: {
          select: {
            id: true,
            primer_nombre: true,
            primer_apellido: true,
            correo: true,
          },
        },
      },
    });

    return NextResponse.json(transformDecimalsToNumbers(convocatoria), { status: 201 });
  } catch (error) {
    console.error('Error al crear convocatoria:', error);
    return NextResponse.json(
      { error: 'Error al crear convocatoria' },
      { status: 500 }
    );
  }
}
