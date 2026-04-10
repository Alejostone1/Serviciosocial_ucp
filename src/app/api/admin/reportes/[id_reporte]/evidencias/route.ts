import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id_reporte: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id_reporte } = params;

        // Obtener el reporte con sus evidencias
        const reporte = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findUnique({
                where: { id: id_reporte },
                include: {
                    estudiante: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    },
                    actividad: {
                        select: {
                            nombre: true
                        }
                    },
                    evidencias: true
                }
            });
        }, 'Error al obtener reporte');

        if (!reporte) {
            return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
        }

        // Crear un ZIP con las evidencias (simulado - en producción usarías una librería como JSZip)
        const evidenciasData = reporte.evidencias.map(evidencia => ({
            id: evidencia.id,
            tipo: evidencia.tipo,
            contenido_texto: evidencia.contenido_texto,
            archivo_url: evidencia.archivo_url,
            archivo_nombre: evidencia.archivo_nombre,
            subido_en: evidencia.subido_en
        }));

        // Para este ejemplo, devolvemos los datos de las evidencias como JSON
        // En producción, generarías un archivo ZIP real
        return NextResponse.json({
            reporte: {
                id: reporte.id,
                estudiante: `${reporte.estudiante.primer_nombre} ${reporte.estudiante.primer_apellido}`,
                correo: reporte.estudiante.correo,
                actividad: reporte.actividad.nombre,
                fecha_reporte: reporte.reportado_en,
                horas_reportadas: reporte.horas_reportadas
            },
            evidencias: evidenciasData,
            mensaje: 'Datos de evidencias obtenidos. En producción se descargaría un archivo ZIP.'
        });

    } catch (error) {
        console.error('Error al obtener evidencias:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
