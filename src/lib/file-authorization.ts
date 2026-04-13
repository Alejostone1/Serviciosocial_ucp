import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export type ArchivoAction = 'view' | 'download' | 'delete';

/**
 * Verifica si un usuario tiene acceso a un archivo de evidencia
 * Implementa RBAC basado en roles y relaciones
 */
export async function canAccessArchivo(
  archivoId: string,
  action: ArchivoAction = 'view'
): Promise<boolean> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return false;
  }
  
  const userId = session.user.id;
  const userRole = session.user.role;
  
  // ADMINISTRADOR: Acceso total a todo
  if (userRole === 'ADMINISTRADOR') {
    return true;
  }
  
  // Obtener el reporte asociado al archivo
  const evidencia = await prisma.evidenciaReporte.findUnique({
    where: { id: archivoId },
    include: {
      reporte: {
        include: {
          estudiante: true,
          actividad: {
            include: {
              creador: true,
              convocatoria: {
                select: {
                  id: true,
                  publicado_por: true,
                  id_programa: true
                }
              }
            }
          }
        }
      }
    }
  });
  
  if (!evidencia || !evidencia.reporte) {
    return false;
  }
  
  const reporte = evidencia.reporte;
  
  // ESTUDIANTE: Solo sus propios reportes
  if (userRole === 'ESTUDIANTE') {
    if (action === 'delete') {
      // Solo puede eliminar si el reporte está en estado REPORTADO
      return reporte.id_estudiante === userId && reporte.estado === 'REPORTADO';
    }
    return reporte.id_estudiante === userId;
  }
  
  // PROFESOR: Creador de la actividad o convocatoria
  if (userRole === 'PROFESOR') {
    return reporte.actividad.creador.id === userId ||
           reporte.actividad.convocatoria?.publicado_por === userId;
  }
  
  // AUXILIAR: Verificar si está vinculado a la convocatoria
  if (userRole === 'AUXILIAR') {
    if (!reporte.id_convocatoria) {
      return false;
    }
    
    const idPrograma = reporte.actividad.convocatoria?.id_programa;
    if (!idPrograma) {
      return false;
    }
    
    const vinculado = await prisma.vinculacionAliado.findFirst({
      where: {
        id_aliado: userId,
        id_programa: idPrograma,
        estado: 'APROBADA'
      }
    });
    
    return !!vinculado;
  }
  
  // ALIADO: Verificar vinculación a la convocatoria
  if (userRole === 'ALIADO') {
    if (!reporte.id_convocatoria) {
      return false;
    }
    
    const idPrograma = reporte.actividad.convocatoria?.id_programa;
    if (!idPrograma) {
      return false;
    }
    
    const vinculado = await prisma.vinculacionAliado.findFirst({
      where: {
        id_aliado: userId,
        id_programa: idPrograma,
        estado: 'APROBADA'
      }
    });
    
    return !!vinculado;
  }
  
  return false;
}

/**
 * Verifica si un usuario puede acceder a un reporte específico
 */
export async function canAccessReporte(
  reporteId: string,
  userId: string,
  userRole: string
): Promise<boolean> {
  // ADMINISTRADOR: Acceso total
  if (userRole === 'ADMINISTRADOR') {
    return true;
  }
  
  const reporte = await prisma.reporteHoras.findUnique({
    where: { id: reporteId },
    include: {
      estudiante: true,
      actividad: {
        include: {
          creador: true,
          convocatoria: {
            select: {
              id: true,
              publicado_por: true,
              id_programa: true
            }
          }
        }
      }
    }
  });
  
  if (!reporte) {
    return false;
  }
  
  // ESTUDIANTE: Solo sus propios reportes
  if (userRole === 'ESTUDIANTE') {
    return reporte.id_estudiante === userId;
  }
  
  // PROFESOR: Creador de actividad o convocatoria
  if (userRole === 'PROFESOR') {
    return reporte.actividad.creador.id === userId ||
           reporte.actividad.convocatoria?.publicado_por === userId;
  }
  
  // AUXILIAR/ALIADO: Verificar vinculación
  if (userRole === 'AUXILIAR' || userRole === 'ALIADO') {
    if (!reporte.id_convocatoria) {
      return false;
    }
    
    const idPrograma = reporte.actividad.convocatoria?.id_programa;
    if (!idPrograma) {
      return false;
    }
    
    const vinculado = await prisma.vinculacionAliado.findFirst({
      where: {
        id_aliado: userId,
        id_programa: idPrograma,
        estado: 'APROBADA'
      }
    });
    
    return !!vinculado;
  }
  
  return false;
}
