import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { EstadoPostulacion, TipoNotificacion } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_estudiante = searchParams.get('id_estudiante');
    const id_convocatoria = searchParams.get('id_convocatoria');
    const estado = searchParams.get('estado');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '10');

    // Validar que los IDs sean UUIDs válidos si se proporcionan
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (id_estudiante && !uuidRegex.test(id_estudiante)) {
      return NextResponse.json(
        { error: 'ID de estudiante inválido' },
        { status: 400 }
      );
    }
    
    if (id_convocatoria && !uuidRegex.test(id_convocatoria)) {
      return NextResponse.json(
        { error: 'ID de convocatoria inválido' },
        { status: 400 }
      );
    }

    const skip = (pagina - 1) * limite;

    // Construir filtro dinámico
    const where: any = {};

    if (id_estudiante) {
      where.id_estudiante = id_estudiante;
    }

    if (id_convocatoria) {
      where.id_convocatoria = id_convocatoria;
    }

    if (estado && estado !== 'todas') {
      where.estado = estado as EstadoPostulacion;
    }

    const [postulaciones, total] = await Promise.all([
      prisma.postulacion.findMany({
        where,
        include: {
          convocatoria: {
            include: {
              categoria: true,
              programa: true,
            },
          },
          estudiante: {
            select: {
              id: true,
              primer_nombre: true,
              primer_apellido: true,
              correo: true,
              numero_documento: true,
            },
          },
          revisor: {
            select: {
              id: true,
              primer_nombre: true,
              primer_apellido: true,
              correo: true,
            },
          },
        },
        orderBy: [
          { postulado_en: 'desc' },
          { revisado_en: 'desc' },
        ],
        skip,
        take: limite,
      }),
      prisma.postulacion.count({ where }),
    ]);

    return NextResponse.json({
      postulaciones,
      paginacion: {
        pagina_actual: pagina,
        total_paginas: Math.ceil(total / limite),
        total_registros: total,
        registros_por_pagina: limite,
      },
    });
  } catch (error) {
    console.error('Error al obtener postulaciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener postulaciones' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any = null;
  
  try {
    // Verificar sesión del usuario
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }
    
    const id_estudiante = session.user.id;
    
    body = await request.json();
    const {
      id_convocatoria,
      motivacion,
      url_hoja_vida,
      habilidades_relevantes,
    } = body;

    // Validar que el ID de convocatoria sea UUID válido
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    if (!id_convocatoria || !uuidRegex.test(id_convocatoria)) {
      return NextResponse.json(
        { error: 'ID de convocatoria inválido' },
        { status: 400 }
      );
    }

    // Verificar que la convocatoria exista y esté publicada
    const convocatoria = await prisma.convocatoria.findUnique({
      where: { id: id_convocatoria },
      include: {
        postulaciones: {
          where: { id_estudiante },
        },
      },
    });

    if (!convocatoria) {
      return NextResponse.json(
        { error: 'La convocatoria no existe' },
        { status: 404 }
      );
    }

    if (convocatoria.estado !== 'PUBLICADA') {
      return NextResponse.json(
        { error: 'La convocatoria no está disponible para postulaciones' },
        { status: 400 }
      );
    }

    // Verificar si ya existe una postulación
    if (convocatoria.postulaciones.length > 0) {
      return NextResponse.json(
        { error: 'Ya tienes una postulación activa para esta convocatoria' },
        { status: 400 }
      );
    }

    // Verificar que la convocatoria no haya cerrado postulaciones
    if (convocatoria.fecha_cierre_postulacion && new Date(convocatoria.fecha_cierre_postulacion) < new Date()) {
      return NextResponse.json(
        { error: 'El plazo de postulaciones ha cerrado' },
        { status: 400 }
      );
    }

    // Verificar si hay cupos disponibles
    if (convocatoria.cupo_maximo) {
      const totalPostulaciones = await prisma.postulacion.count({
        where: { id_convocatoria },
      });

      if (totalPostulaciones >= convocatoria.cupo_maximo) {
        return NextResponse.json(
          { error: 'No hay cupos disponibles para esta convocatoria' },
          { status: 400 }
        );
      }
    }

    // Crear la postulación
    const postulacion = await prisma.postulacion.create({
      data: {
        id_convocatoria,
        id_estudiante,
        motivacion,
        url_hoja_vida,
        habilidades_relevantes,
        estado: EstadoPostulacion.PENDIENTE,
      },
      include: {
        convocatoria: {
          include: {
            categoria: true,
            programa: true,
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
      },
    });

    // Registrar en el log de actividad
    await prisma.logActividad.create({
      data: {
        accion: 'POSTULACION_CREADA',
        entidad: 'POSTULACION',
        id_entidad: postulacion.id,
        descripcion: `Nueva postulación de ${postulacion.estudiante.primer_nombre} ${postulacion.estudiante.primer_apellido} para la convocatoria: ${convocatoria.titulo}`,
        id_usuario: id_estudiante,
        resultado: 'EXITOSO'
      }
    });

    // Crear notificación para el estudiante que se postuló
    await prisma.notificacion.create({
      data: {
        id_usuario: id_estudiante,
        tipo: TipoNotificacion.POSTULACION_RECIBIDA,
        titulo: 'Postulación Recibida',
        mensaje: `Hemos recibido tu postulación a la convocatoria "${convocatoria.titulo}" exitosamente. Estado actual: EN REVISIÓN. Estaremos revisando tu solicitud y te notificaremos el resultado a la brevedad posible.`,
        leida: false,
        creado_en: new Date()
      }
    });

    // Crear notificaciones para administradores sobre la nueva postulación
    const administradores = await prisma.usuario.findMany({
      where: { rol: 'ADMINISTRADOR' },
      select: { id: true }
    });

    if (administradores.length > 0) {
      const notificacionesAdmin = administradores.map(admin => ({
        id_usuario: admin.id,
        tipo: TipoNotificacion.POSTULACION_RECIBIDA,
        titulo: 'Nueva Postulación Recibida',
        mensaje: `El estudiante ${postulacion.estudiante.primer_nombre} ${postulacion.estudiante.primer_apellido} se ha postulado a la convocatoria: "${convocatoria.titulo}"`,
        leida: false,
        creado_en: new Date()
      }));

      await prisma.notificacion.createMany({
        data: notificacionesAdmin
      });
    }

    return NextResponse.json(postulacion, { status: 201 });
  } catch (error) {
    console.error('Error al crear postulación:', error);
    console.error('Request body:', body);
    
    // Si es un error de Prisma, dar más detalles
    if (error instanceof Error && 'code' in error) {
      console.error('Prisma error code:', (error as any).code);
      console.error('Prisma error meta:', (error as any).meta);
    }
    
    return NextResponse.json(
      { error: 'Error al crear postulación', details: error instanceof Error ? error.message : 'Error desconocido' },
      { status: 500 }
    );
  }
}
