import { NextRequest, NextResponse } from 'next/server';
import { canAccessArchivo } from '@/lib/file-authorization';
import { prisma } from '@/lib/prisma';
import { join } from 'path';
import { readFile } from 'fs/promises';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Descargando archivo:', params.id);
    
    // Verificar autorización
    const tieneAcceso = await canAccessArchivo(params.id, 'view');
    if (!tieneAcceso) {
      console.log('No autorizado para archivo:', params.id);
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener información del archivo
    const evidencia = await prisma.evidenciaReporte.findUnique({
      where: { id: params.id }
    });
    
    if (!evidencia?.archivo_url) {
      console.log('Archivo no encontrado o sin URL:', params.id);
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }
    
    console.log('Archivo URL:', evidencia.archivo_url);
    console.log('MIME type:', evidencia.archivo_mime);
    
    // Leer archivo del sistema de archivos
    const filePath = join(process.cwd(), 'public', evidencia.archivo_url);
    console.log('Ruta archivo:', filePath);
    
    const fileBuffer = await readFile(filePath);
    console.log('Tamaño buffer:', fileBuffer.length);
    
    // Codificar nombre del archivo para Content-Disposition
    const nombreArchivo = evidencia.archivo_nombre || 'archivo';
    const encodedNombre = encodeURIComponent(nombreArchivo);
    console.log('Nombre archivo:', nombreArchivo);
    
    // Retornar archivo con headers correctos
    const response = new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': evidencia.archivo_mime || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${encodedNombre}"`,
        'Content-Length': fileBuffer.length.toString(),
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
      }
    });
    
    console.log('Archivo enviado correctamente');
    return response;
    
  } catch (error) {
    console.error('Error sirviendo archivo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autorización para eliminar
    const tieneAcceso = await canAccessArchivo(params.id, 'delete');
    if (!tieneAcceso) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Obtener información del archivo
    const evidencia = await prisma.evidenciaReporte.findUnique({
      where: { id: params.id },
      include: {
        reporte: {
          select: {
            estado: true
          }
        }
      }
    });
    
    if (!evidencia) {
      return NextResponse.json({ error: 'Archivo no encontrado' }, { status: 404 });
    }
    
    // Solo permitir eliminar si el reporte está en estado REPORTADO
    if (evidencia.reporte.estado !== 'REPORTADO') {
      return NextResponse.json(
        { error: 'Solo se pueden eliminar archivos de reportes en estado REPORTADO' },
        { status: 400 }
      );
    }
    
    // Eliminar registro de evidencia
    await prisma.evidenciaReporte.delete({
      where: { id: params.id }
    });
    
    // Intentar eliminar archivo físico (opcional, no fallar si falla)
    if (evidencia.archivo_url) {
      try {
        const filePath = join(process.cwd(), 'public', evidencia.archivo_url);
        const fs = await import('fs/promises');
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('No se pudo eliminar archivo físico:', fileError);
        // No fallar la petición por esto
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado correctamente'
    });
    
  } catch (error) {
    console.error('Error eliminando archivo:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
