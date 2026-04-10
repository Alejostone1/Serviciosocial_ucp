import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Clock, Plus, FileText, Calendar, TrendingUp, AlertCircle, Award, CheckCircle } from 'lucide-react';
import { db } from '@/lib/prisma';
import { EstadoReporte } from '@prisma/client';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { DashboardCard } from '../components/ui/DashboardCard';
import { Badge, BadgeVariant } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { ReportActionButton } from './components/ReportActionButton';

export const metadata = { title: 'Mis Horas | Estudiante' };

async function getStudentHours(userId: string) {
    const hours = await db.execute(async (prisma) => {
        return await prisma.reporteHoras.findMany({
            where: { id_estudiante: userId },
            include: {
                actividad: {
                    include: {
                        convocatoria: {
                            include: {
                                publicador: {
                                    select: { primer_nombre: true, primer_apellido: true }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { reportado_en: 'desc' }
        });
    }, 'Error al obtener reportes de horas');
    return transformDecimalsToNumbers(hours);
}

async function getStudentStats(userId: string) {
    const stats = await db.execute(async (prisma) => {
        const totalHours = await prisma.reporteHoras.aggregate({
            where: { id_estudiante: userId, estado: 'APROBADO' },
            _sum: { horas_reportadas: true }
        });

        const thisMonthHours = await prisma.reporteHoras.aggregate({
            where: {
                id_estudiante: userId,
                estado: 'APROBADO',
                reportado_en: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
            },
            _sum: { horas_reportadas: true }
        });

        const totalPendiente = await prisma.reporteHoras.aggregate({
            where: { id_estudiante: userId, estado: 'REPORTADO' },
            _sum: { horas_reportadas: true }
        });

        return {
            totalHours: Number(totalHours._sum.horas_reportadas || 0),
            thisMonthHours: Number(thisMonthHours._sum.horas_reportadas || 0),
            totalPendientes: Number(totalPendiente._sum.horas_reportadas || 0)
        };
    }, 'Error al obtener estadísticas de horas');
    return transformDecimalsToNumbers(stats);
}

export default async function MisHorasPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') redirect('/login');

    const [hours, stats] = await Promise.all([
        getStudentHours(session.user.id),
        getStudentStats(session.user.id)
    ]);

    const requisitoHoras = 180;
    const completado = stats.totalHours >= requisitoHoras;

    const getEstadoBadge = (estado: EstadoReporte): { variant: BadgeVariant, label: string } => {
        switch (estado) {
            case EstadoReporte.APROBADO: return { variant: 'success', label: 'Aprobado' };
            case EstadoReporte.REPORTADO: return { variant: 'warning', label: 'En revisión' };
            case EstadoReporte.RECHAZADO: return { variant: 'error', label: 'Rechazado' };
            default: return { variant: 'default', label: estado };
        }
    };

    return (
        <PageContainer>
            <SectionHeader
                title="Mis Horas de Servicio"
                description="Lleva el control de tus horas de servicio social y reporta nuevas actividades."
            >
                <Link
                    href="/sistema/estudiante/certificados"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm font-medium"
                >
                    <FileText className="w-4 h-4" />
                    <span className="hidden sm:inline">Certificados</span>
                </Link>
                <ReportActionButton />
            </SectionHeader>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard
                    title="Horas Aprobadas"
                    value={stats.totalHours}
                    description={`De ${requisitoHoras} requeridas`}
                    icon={CheckCircle}
                    colorClass="text-emerald-600 bg-emerald-50"
                />
                <StatsCard
                    title="Este Mes"
                    value={`+${stats.thisMonthHours}h`}
                    description="Horas aprobadas este mes"
                    icon={Calendar}
                    colorClass="text-[#8B1E1E] bg-red-50"
                />
                <StatsCard
                    title="En Revisión"
                    value={`${stats.totalPendientes}h`}
                    description="Esperando validación"
                    icon={Clock}
                    colorClass="text-amber-600 bg-amber-50"
                />
                <StatsCard
                    title="Estado Global"
                    value={completado ? 'Completado' : 'En Progreso'}
                    description={completado ? 'Requisito cumplido' : `Faltan ${Math.max(0, requisitoHoras - stats.totalHours)}h`}
                    icon={completado ? Award : TrendingUp}
                    colorClass={completado ? "text-emerald-600 bg-emerald-50" : "text-blue-600 bg-blue-50"}
                />
            </div>

            <DashboardCard title="Historial de Reportes" icon={Clock}>
                {hours.length === 0 ? (
                    <EmptyState
                        icon={Clock}
                        title="No hay horas registradas"
                        description="Comienza a reportar tus horas de servicio social para llevar un seguimiento de tu progreso."
                        action={
                            <Link
                                href="/sistema/estudiante/mis-horas/reportar"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#a32424] transition font-semibold mt-4 shadow-lg shadow-red-900/10"
                            >
                                <Plus className="w-5 h-5" />
                                Reportar mis primeras horas
                            </Link>
                        }
                    />
                ) : (
                    <div className="-mx-6 -my-6 overflow-x-auto hide-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Fecha</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Actividad</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600">Horas</th>
                                    <th className="px-6 py-4 font-semibold text-slate-600 text-right">Estado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                                {hours.map((hour: any) => {
                                    const { variant, label } = getEstadoBadge(hour.estado);
                                    return (
                                        <tr key={hour.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 text-slate-600 font-medium">
                                                {new Date(hour.reportado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    href={`/sistema/estudiante/mis-horas/${hour.id}`}
                                                    className="font-semibold text-slate-900 hover:text-[#8B1E1E] transition-colors"
                                                >
                                                    {hour.actividad?.nombre || 'Sin nombre'}
                                                </Link>
                                                {hour.actividad?.convocatoria?.titulo && (
                                                    <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{hour.actividad.convocatoria.titulo}</p>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-slate-700">{Number(hour.horas_reportadas)}h</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant={variant}>{label}</Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </DashboardCard>
        </PageContainer>
    );
}
