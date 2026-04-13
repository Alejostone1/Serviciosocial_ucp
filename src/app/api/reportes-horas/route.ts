import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { ReporteHorasService } from '@/lib/services/reporte-horas.service';
import { uploadMultipleFilesForReporte, UploadedFile } from '@/lib/fileUpload';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const formData = await req.formData();
    
    // Extraer datos básicos
    const id_actividad = formData.get('id_actividad') as string;
    const descripcion_trabajo = formData.get('descripcion_trabajo') as string;
    const notas_estudiante = formData.get('notas_estudiante') as string | null || undefined;
    
    // Extraer fechas (viene como JSON string)
    const fechasJson = formData.get('fechas') as string;
    if (!fechasJson) {
      return NextResponse.json({ error: 'Fechas son requeridas' }, { status: 400 });
    }
    
    let fechas;
    try {
      fechas = JSON.parse(fechasJson);
    } catch {
      return NextResponse.json({ error: 'Formato de fechas inválido' }, { status: 400 });
    }
    
    // Procesar archivos
    const archivos = formData.getAll('archivos') as File[];
    let archivosSubidos: UploadedFile[] = [];
    
    if (archivos && archivos.length > 0) {
      const archivosValidos = archivos.filter(f => f.size > 0);
      if (archivosValidos.length > 0) {
        // Primero crear el reporte para obtener el ID
        const reporteTemporal = await ReporteHorasService.crearConFechas({
          id_actividad,
          descripcion_trabajo,
          notas_estudiante,
          fechas
        }, session.user.id);
        
        // Luego subir archivos con la estructura segura
        archivosSubidos = await uploadMultipleFilesForReporte(
          archivosValidos,
          session.user.id,
          reporteTemporal.id
        );
        
        // Crear evidencias en BD
        if (archivosSubidos.length > 0) {
          await prisma.evidenciaReporte.createMany({
            data: archivosSubidos.map(archivo => ({
              id_reporte: reporteTemporal.id,
              tipo: archivo.tipo.startsWith('image/') ? 'IMAGEN' : 'DOCUMENTO',
              archivo_url: archivo.url,
              archivo_nombre: archivo.nombre,
              archivo_mime: archivo.tipo,
              peso_bytes: archivo.tamaño
            }))
          });
        }
        
        // Notificar (existente)
        try {
          const actividad = await prisma.actividad.findUnique({
            where: { id: id_actividad },
            select: { nombre: true, creado_por: true }
          });
          
          if (actividad?.creado_por) {
            const { createNotificationToUser } = await import('@/lib/notifications');
            await createNotificationToUser(
              actividad.creado_por,
              'REPORTE_ENVIADO',
              'Nuevo Reporte de Horas',
              `Estudiante reportó múltiples fechas en "${actividad.nombre}". Revisar evidencias.`,
              '/sistema/auxiliar/validacion'
            );
          }
          
          const { createAdminNotifications } = await import('@/lib/notifications');
          await createAdminNotifications(
            'REPORTE_ENVIADO',
            'Nuevo Reporte de Horas Pendiente',
            `Estudiante reportó horas en actividad "${actividad?.nombre}". Requiere validación.`,
            '/administrador/reportes'
          );
        } catch (notifError) {
          console.warn('No se pudieron enviar notificaciones:', notifError);
        }
        
        // Revalidar rutas
        revalidatePath('/sistema/estudiante/mis-horas');
        revalidatePath('/sistema/estudiante/mis-horas/reportar');
        
        return NextResponse.json({
          success: true,
          message: `Reporte creado con ${fechas.length} fecha(s)${archivosSubidos.length > 0 ? ` y ${archivosSubidos.length} archivo(s)` : ''}`,
          data: {
            id: reporteTemporal.id,
            horas_reportadas: reporteTemporal.horas_reportadas,
            estado: reporteTemporal.estado
          }
        });
      }
    }
    
    // Si no hay archivos, crear el reporte directamente
    const reporte = await ReporteHorasService.crearConFechas({
      id_actividad,
      descripcion_trabajo,
      notas_estudiante: notas_estudiante || undefined,
      fechas
    }, session.user.id);
    
    // Notificar
    try {
      const actividad = await prisma.actividad.findUnique({
        where: { id: id_actividad },
        select: { nombre: true, creado_por: true }
      });
      
      if (actividad?.creado_por) {
        const { createNotificationToUser } = await import('@/lib/notifications');
        await createNotificationToUser(
          actividad.creado_por,
          'REPORTE_ENVIADO',
          'Nuevo Reporte de Horas',
          `Estudiante reportó múltiples fechas en "${actividad.nombre}".`,
          '/sistema/auxiliar/validacion'
        );
      }
    } catch (notifError) {
      console.warn('No se pudieron enviar notificaciones:', notifError);
    }
    
    // Revalidar rutas
    revalidatePath('/sistema/estudiante/mis-horas');
    revalidatePath('/sistema/estudiante/mis-horas/reportar');
    
    return NextResponse.json({
      success: true,
      message: `Reporte creado con ${fechas.length} fecha(s)`,
      data: reporte
    });
    
  } catch (error) {
    console.error('Error creando reporte:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error interno' },
      { status: 500 }
    );
  }
}
