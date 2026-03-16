import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { id_reporte, notas_revisor, estado } = body;

        if (!id_reporte || !estado || !notas_revisor) {
            return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 });
        }

        if (!['APROBADO', 'RECHAZADO'].includes(estado)) {
            return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
        }

        // Verificar que el reporte exista y esté pendiente
        const reporte = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findUnique({
                where: { id: id_reporte },
                include: {
                    estudiante: {
                        include: {
                            perfil_estudiante: true
                        }
                    }
                }
            });
        }, 'Error al verificar reporte');

        if (!reporte) {
            return NextResponse.json({ error: 'Reporte no encontrado' }, { status: 404 });
        }

        if (reporte.estado !== 'PENDIENTE_VALIDACION') {
            return NextResponse.json({ error: 'El reporte ya ha sido revisado' }, { status: 400 });
        }

        // Actualizar el reporte
        const reporteActualizado = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.update({
                where: { id: id_reporte },
                data: {
                    estado: estado,
                    horas_aprobadas: estado === 'APROBADO' ? reporte.horas_reportadas : null,
                    notas_revisor: notas_revisor,
                    id_revisor: session.user.id,
                    revisado_en: new Date()
                }
            });
        }, 'Error al actualizar reporte');

        // Si fue aprobado, actualizar las horas acumuladas del estudiante
        if (estado === 'APROBADO') {
            await db.execute(async (prisma) => {
                // Obtener horas totales aprobadas del estudiante
                const reportesAprobados = await prisma.reporteHoras.findMany({
                    where: {
                        id_estudiante: reporte.id_estudiante,
                        estado: 'APROBADO'
                    },
                    select: {
                        horas_aprobadas: true
                    }
                });

                const totalHorasAprobadas = reportesAprobados.reduce(
                    (sum, r) => sum + Number(r.horas_aprobadas || 0), 
                    0
                );

                // Obtener programa del estudiante para calcular porcentaje
                const estudianteConPrograma = await prisma.usuario.findUnique({
                    where: { id: reporte.id_estudiante },
                    select: {
                        programa: {
                            select: {
                                horas_requeridas: true
                            }
                        }
                    }
                });

                const horasRequeridas = estudianteConPrograma?.programa?.horas_requeridas || 180;
                const porcentajeAvance = Math.min((totalHorasAprobadas / Number(horasRequeridas)) * 100, 100);

                // Actualizar perfil del estudiante
                await prisma.perfilEstudiante.update({
                    where: { id_usuario: reporte.id_estudiante },
                    data: {
                        horas_acumuladas: totalHorasAprobadas,
                        porcentaje_avance: porcentajeAvance
                    }
                });

                // Crear historial de horas
                await prisma.historialHoras.create({
                    data: {
                        id_reporte_horas: id_reporte,
                        modificado_por: session.user.id,
                        estado_anterior: 'PENDIENTE_VALIDACION',
                        estado_nuevo: 'APROBADO',
                        horas_anteriores: 0,
                        horas_nuevas: Number(reporte.horas_reportadas),
                        razon: `Reporte aprobado: ${reporte.horas_reportadas}h`
                    }
                });

                return totalHorasAprobadas;
            }, 'Error al actualizar horas del estudiante');
        } else {
            // Si fue rechazado, crear historial de rechazo
            await db.execute(async (prisma) => {
                await prisma.historialHoras.create({
                    data: {
                        id_reporte_horas: id_reporte,
                        modificado_por: session.user.id,
                        estado_anterior: 'PENDIENTE_VALIDACION',
                        estado_nuevo: 'RECHAZADO',
                        horas_anteriores: Number(reporte.horas_reportadas),
                        horas_nuevas: 0,
                        razon: `Reporte rechazado: ${notas_revisor}`
                    }
                });
            }, 'Error al crear historial de rechazo');
        }

        return NextResponse.json({
            success: true,
            message: `Reporte ${estado === 'APROBADO' ? 'aprobado' : 'rechazado'} exitosamente`,
            reporte: reporteActualizado
        });

    } catch (error) {
        console.error('Error al procesar reporte:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
