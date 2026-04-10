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

        if (estado !== 'RECHAZADO') {
            return NextResponse.json({ error: 'Estado no válido' }, { status: 400 });
        }

        // Verificar que el reporte exista y esté pendiente
        const reporte = await db.execute(async (prisma) => {
            return await prisma.reporteHoras.findUnique({
                where: { id: id_reporte }
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
                    estado: 'RECHAZADO',
                    horas_aprobadas: null,
                    notas_revisor: notas_revisor,
                    id_revisor: session.user.id,
                    revisado_en: new Date()
                }
            });
        }, 'Error al actualizar reporte');

        // Crear historial de rechazo
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

        return NextResponse.json({
            success: true,
            message: 'Reporte rechazado exitosamente',
            reporte: reporteActualizado
        });

    } catch (error) {
        console.error('Error al rechazar reporte:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}
