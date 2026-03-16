import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');
        const programa = searchParams.get('programa');
        const facultad = searchParams.get('facultad');
        const fechaDesde = searchParams.get('fechaDesde');
        const fechaHasta = searchParams.get('fechaHasta');
        const busqueda = searchParams.get('busqueda');

        const reportes = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findMany({
                where: {
                    ...(estado && { estado: estado as any }),
                    ...(fechaDesde && {
                        fecha_actividad: {
                            gte: new Date(fechaDesde)
                        }
                    }),
                    ...(fechaHasta && {
                        fecha_actividad: {
                            lte: new Date(fechaHasta)
                        }
                    })
                },
                include: {
                    estudiante: {
                        include: {
                            programa: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    },
                    actividad: {
                        include: {
                            convocatoria: true
                        }
                    },
                    convocatoria: true,
                    revisor: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true
                        }
                    },
                    evidencias: true
                },
                orderBy: {
                    reportado_en: 'desc'
                }
            });
        }, 'Error al obtener reportes');

        const transformedReportes = transformDecimalsToNumbers(reportes);

        // Transformar los datos al formato esperado por el cliente
        const reportesFormateados = transformedReportes.map((reporte: any) => ({
            id: reporte.id,
            id_estudiante: reporte.id_estudiante,
            id_actividad: reporte.id_actividad,
            id_convocatoria: reporte.id_convocatoria,
            horas_reportadas: Number(reporte.horas_reportadas),
            horas_aprobadas: reporte.horas_aprobadas ? Number(reporte.horas_aprobadas) : undefined,
            estado: reporte.estado,
            descripcion_trabajo: reporte.descripcion_trabajo,
            fecha_actividad: reporte.fecha_actividad,
            reportado_en: reporte.reportado_en,
            revisado_en: reporte.revisado_en || undefined,
            notas_estudiante: reporte.notas_estudiante || undefined,
            notas_revisor: reporte.notas_revisor || undefined,
            id_revisor: reporte.id_revisor || undefined,
            revisor: reporte.revisor || undefined,
            estudiante: {
                id: reporte.estudiante.id,
                primer_nombre: reporte.estudiante.primer_nombre,
                primer_apellido: reporte.estudiante.primer_apellido,
                correo: reporte.estudiante.correo,
                numero_documento: reporte.estudiante.numero_documento,
                programa: reporte.estudiante.programa ? {
                    nombre: reporte.estudiante.programa.nombre,
                    facultad: reporte.estudiante.programa.facultad ? {
                        nombre: reporte.estudiante.programa.facultad.nombre
                    } : undefined
                } : undefined
            },
            actividad: {
                id: reporte.actividad.id,
                nombre: reporte.actividad.nombre,
                descripcion: reporte.actividad.descripcion,
                horas_estimadas: Number(reporte.actividad.horas_estimadas),
                tipo_actividad: reporte.actividad.tipo_actividad,
                fecha_inicio: reporte.actividad.fecha_inicio,
                fecha_limite: reporte.actividad.fecha_limite || undefined,
                ubicacion: reporte.actividad.ubicacion || undefined
            },
            convocatoria: {
                id: reporte.convocatoria.id,
                titulo: reporte.convocatoria.titulo,
                descripcion: reporte.convocatoria.descripcion || '',
                modalidad: reporte.convocatoria.modalidad,
                estado: reporte.convocatoria.estado,
                horas_totales_ofrecidas: reporte.convocatoria.horas_totales_ofrecidas ? Number(reporte.convocatoria.horas_totales_ofrecidas) : undefined
            },
            evidencias: reporte.evidencias?.map((evidencia: any) => ({
                id: evidencia.id,
                tipo: evidencia.tipo,
                contenido_texto: evidencia.contenido_texto || undefined,
                url_archivo: evidencia.archivo_url || undefined,
                nombre_archivo: evidencia.archivo_nombre || undefined,
                subido_por: evidencia.subido_por
            })) || []
        }));

        // Aplicar filtros adicionales que no se pueden hacer en la consulta SQL
        let reportesFiltrados = reportesFormateados;

        // Filtrar por programa
        if (programa) {
            reportesFiltrados = reportesFiltrados.filter((reporte: any) => 
                reporte.estudiante.programa?.nombre?.toLowerCase().includes(programa.toLowerCase())
            );
        }

        // Filtrar por facultad
        if (facultad) {
            reportesFiltrados = reportesFiltrados.filter((reporte: any) => 
                reporte.estudiante.programa?.facultad?.nombre?.toLowerCase().includes(facultad.toLowerCase())
            );
        }

        // Filtrar por búsqueda
        if (busqueda) {
            const busquedaLower = busqueda.toLowerCase();
            reportesFiltrados = reportesFiltrados.filter((reporte: any) => 
                reporte.descripcion_trabajo.toLowerCase().includes(busquedaLower) ||
                reporte.estudiante.primer_nombre.toLowerCase().includes(busquedaLower) ||
                reporte.estudiante.primer_apellido.toLowerCase().includes(busquedaLower) ||
                reporte.actividad.nombre.toLowerCase().includes(busquedaLower) ||
                reporte.convocatoria.titulo.toLowerCase().includes(busquedaLower)
            );
        }

        return NextResponse.json(reportesFiltrados);
    } catch (error) {
        console.error('Error al obtener reportes:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
