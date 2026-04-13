export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { decision, motivo_rechazo } = await req.json();

    if (!decision || (decision === 'RECHAZAR' && !motivo_rechazo)) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    const solicitud = await prisma.solicitudCambioPerfil.findUnique({
      where: { id: params.id },
      include: { usuario: true }
    });

    if (!solicitud || solicitud.estado !== 'PENDIENTE') {
      return NextResponse.json({ error: 'Solicitud no encontrada or procesada' }, { status: 404 });
    }

    if (decision === 'RECHAZAR') {
      await prisma.$transaction([
        prisma.solicitudCambioPerfil.update({
          where: { id: params.id },
          data: {
            estado: 'RECHAZADA',
            motivo_rechazo,
            revisado_en: new Date(),
            revisado_por: session.user.id
          }
        }),
        // Auditoría de Rechazo
        prisma.logActividad.create({
          data: {
            accion: 'RECHAZO_CAMBIO_PERFIL',
            entidad: 'USUARIO',
            id_entidad: solicitud.id_usuario,
            id_usuario: session.user.id,
            descripcion: `El administrador rechazó la solicitud de cambios de perfil. Motivo: ${motivo_rechazo}`,
            resultado: 'EXITOSO'
          }
        })
      ]);

      return NextResponse.json({ message: 'Solicitud rechazada' });
    }

    // APROBACIÓN
    const datosNuevos = solicitud.datos_nuevos as any;
    const datosAnteriores: any = {};
    Object.keys(datosNuevos).forEach(key => {
      datosAnteriores[key] = (solicitud.usuario as any)[key];
    });

    await prisma.$transaction([
      // 1. Actualizar Usuario
      prisma.usuario.update({
        where: { id: solicitud.id_usuario },
        data: {
          primer_nombre: datosNuevos.primer_nombre,
          segundo_nombre: datosNuevos.segundo_nombre,
          primer_apellido: datosNuevos.primer_apellido,
          segundo_apellido: datosNuevos.segundo_apellido,
          correo_personal: datosNuevos.correo_personal,
          telefono: datosNuevos.telefono,
          foto_url: datosNuevos.foto_url,
          actualizado_en: new Date()
        }
      }),
      // 2. Actualizar Perfil Estudiante
      prisma.perfilEstudiante.update({
        where: { id_usuario: solicitud.id_usuario },
        data: {
          semestre_actual: datosNuevos.semestre_actual,
          codigo_estudiantil: datosNuevos.codigo_estudiantil,
          url_hoja_de_vida: datosNuevos.url_hoja_de_vida,
          habilidades: datosNuevos.habilidades,
          intereses: datosNuevos.intereses,
          disponibilidad: datosNuevos.disponibilidad,
          modalidad_preferida: datosNuevos.modalidad_preferida,
          horas_previas: datosNuevos.horas_previas,
          actualizado_en: new Date()
        }
      }),
      // 3. Marcar solicitud como APROBADA
      prisma.solicitudCambioPerfil.update({
        where: { id: params.id },
        data: {
          estado: 'APROBADA',
          revisado_en: new Date(),
          revisado_por: session.user.id
        }
      }),
      // 4. Auditoría de Aprobación Detallada
      prisma.logActividad.create({
        data: {
          accion: 'APROBACION_CAMBIO_PERFIL',
          entidad: 'USUARIO',
          id_entidad: solicitud.id_usuario,
          id_usuario: session.user.id,
          descripcion: 'El administrador aprobó la solicitud de cambio de perfil tras validar la identidad del estudiante.',
          datos_anteriores: datosAnteriores,
          datos_nuevos: datosNuevos,
          resultado: 'EXITOSO'
        }
      }),
      // 5. Notificación
      prisma.notificacion.create({
        data: {
          id_usuario: solicitud.id_usuario,
          tipo: 'SISTEMA',
          titulo: 'Solicitud Procesada',
          mensaje: 'Tu solicitud de cambio de perfil ha sido seleccionada y aprobada. Los cambios ya son visibles.',
          url_accion: '/sistema/estudiante/perfil'
        }
      })
    ]);

    return NextResponse.json({ message: 'Solicitud aprobada con auditoría registrada' });

  } catch (error) {
    console.error('[patch_solicitud] Error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
