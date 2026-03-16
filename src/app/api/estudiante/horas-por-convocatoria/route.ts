import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        
        if (!session?.user || session.user.role !== 'ESTUDIANTE') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { idConvocatoria } = await request.json();

        if (!idConvocatoria) {
            return NextResponse.json({ error: 'ID de convocatoria requerido' }, { status: 400 });
        }

        // 🔥 OBTENER HORAS ESPECÍFICAS DE ESTA CONVOCATORIA
        const reportesConvocatoria = await prisma.reporteHoras.findMany({
            where: {
                id_estudiante: session.user.id,
                id_convocatoria: idConvocatoria,
                estado: 'APROBADO' // Solo contar horas aprobadas
            },
            select: {
                horas_reportadas: true,
                id_actividad: true,
                actividad: {
                    select: {
                        nombre: true,
                        horas_estimadas: true
                    }
                }
            }
        });

        // Calcular totales
        const horasReportadas = reportesConvocatoria.reduce(
            (sum, reporte) => sum + Number(reporte.horas_reportadas), 
            0
        );

        // Obtener información de la convocatoria
        const convocatoria = await prisma.convocatoria.findUnique({
            where: { id: idConvocatoria },
            select: {
                horas_totales_ofrecidas: true,
                titulo: true
            }
        });

        // Obtener detalle por actividad
        const detallePorActividad = reportesConvocatoria.reduce((acc, reporte) => {
            const actividadId = reporte.id_actividad;
            if (!acc[actividadId]) {
                acc[actividadId] = {
                    nombre: reporte.actividad.nombre,
                    horasEstimadas: reporte.actividad.horas_estimadas,
                    horasReportadas: 0,
                    reportes: []
                };
            }
            acc[actividadId].horasReportadas += Number(reporte.horas_reportadas);
            acc[actividadId].reportes.push({
                horas: Number(reporte.horas_reportadas)
            });
            return acc;
        }, {} as any);

        return NextResponse.json({
            horasReportadas,
            horasTotalesOfrecidas: Number(convocatoria?.horas_totales_ofrecidas) || 0,
            convocatoriaTitulo: convocatoria?.titulo || '',
            totalActividades: Object.keys(detallePorActividad).length,
            detallePorActividad
        });

    } catch (error) {
        console.error('Error al obtener horas por convocatoria:', error);
        return NextResponse.json(
            { error: 'Error al obtener horas por convocatoria' },
            { status: 500 }
        );
    }
}
