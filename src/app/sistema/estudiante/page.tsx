import React from 'react';
import Link from 'next/link';
import { getDashboardData } from './services/dashboardService';
import { PageContainer } from './components/layout/PageContainer';
import { SectionHeader } from './components/ui/SectionHeader';
import { StatsCard } from './components/ui/StatsCard';
import { DashboardCard } from './components/ui/DashboardCard';
import { ProgressBar } from './components/ui/ProgressBar';
import { Badge } from './components/ui/Badge';
import {
    Clock,
    Award,
    CheckSquare,
    TrendingUp,
    ArrowRight,
    BookOpen,
    Briefcase
} from 'lucide-react';

export const metadata = { title: 'Dashboard del Estudiante | Servicio Social' };

export default async function EstudianteDashboardPage() {
    const dashboardData = await getDashboardData();
    const { progress, activeProjects, availableOpportunities } = dashboardData;

    return (
        <PageContainer>
            {/* Header */}
            <SectionHeader
                title="Hola, Estudiante"
                description="Aquí está el resumen de tu progreso en el servicio social."
            >
                <Link
                    href="/estudiante/mis-horas/reportar"
                    className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-xl font-semibold hover:bg-[#731919] transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-[#8B1E1E]"
                >
                    <Clock className="w-4 h-4" />
                    <span className="hidden sm:inline">Reportar Horas</span>
                    <span className="sm:hidden">Reportar</span>
                </Link>
                <Link
                    href="/estudiante/certificados"
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                    <Award className="w-4 h-4" />
                    <span className="hidden sm:inline">Certificados</span>
                </Link>
            </SectionHeader>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Horas Completadas"
                    value={`${progress.currentHours}`}
                    subtitle={`de ${progress.requiredHours}h`}
                    description="Horas aprobadas este semestre"
                    icon={Clock}
                    colorClass="text-[#8B1E1E] bg-[#8B1E1E]/10"
                    progress={progress.percentage}
                />
                <StatsCard
                    title="Progreso Total"
                    value={`${Math.round(progress.percentage)}%`}
                    description="Del requisito de servicio social"
                    icon={TrendingUp}
                    colorClass="text-emerald-600 bg-emerald-50"
                    progress={progress.percentage}
                    trend={{
                        value: 12,
                        label: "vs mes anterior",
                        isPositive: true
                    }}
                />
                <StatsCard
                    title="Proyectos Activos"
                    value={activeProjects.length}
                    description="Convocatorias en participación"
                    icon={Briefcase}
                    colorClass="text-amber-600 bg-amber-50"
                    subtitle="proyectos"
                />
                <StatsCard
                    title="Certificados"
                    value={progress.percentage >= 100 ? 1 : 0}
                    description="Disponibles para descargar"
                    icon={Award}
                    colorClass="text-[#8B1E1E] bg-[#8B1E1E]/10"
                    subtitle="documento"
                />
            </div>

            {/* Progress Section */}
            <div className="mt-8">
                <DashboardCard title="Progreso del Servicio Social" icon={TrendingUp}>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="flex-1 w-full space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-slate-700">Estado general</span>
                                <span className="text-slate-500 font-medium">Meta: {progress.requiredHours}h</span>
                            </div>
                            <ProgressBar
                                value={progress.currentHours}
                                max={progress.requiredHours}
                                size="lg"
                                colorClass="bg-[#8B1E1E]"
                                bgClass="bg-[#8B1E1E]/10"
                            />
                        </div>
                        {progress.percentage >= 100 && (
                            <div className="shrink-0 flex flex-col items-center bg-emerald-50 text-emerald-700 px-6 py-4 rounded-xl border border-emerald-100">
                                <Award className="w-8 h-8 mb-2 text-emerald-600" />
                                <span className="font-bold text-lg leading-none tracking-tight">¡Completado!</span>
                            </div>
                        )}
                    </div>
                </DashboardCard>
            </div>

            {/* Grid 2 Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">

                {/* Active Projects */}
                <DashboardCard
                    title="Mis Proyectos Activos"
                    icon={CheckSquare}
                    headerAction={
                        <Link href="/sistema/estudiante/mis-postulaciones" className="text-sm font-semibold text-[#8B1E1E] hover:text-[#731919] flex items-center gap-1">
                            Ver todos <ArrowRight className="w-4 h-4" />
                        </Link>
                    }
                >
                    {activeProjects.length > 0 ? (
                        <div className="space-y-4">
                            {activeProjects.slice(0, 3).map((project: any) => (
                                <div key={project.id} className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-[#8B1E1E]/20 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 line-clamp-1 group-hover:text-[#8B1E1E] transition-colors">
                                                {project.nombre}
                                            </h4>
                                            <p className="text-sm text-slate-500 mt-1">{project.organizacion}</p>
                                        </div>
                                        <Badge variant="info">
                                            {project.estado}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            {project.horasAcumuladas}h registradas
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4">
                            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="font-medium text-slate-700">Sin proyectos activos</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Explora las convocatorias disponibles para postularte.
                            </p>
                        </div>
                    )}
                </DashboardCard>

                {/* Available Opportunities */}
                <DashboardCard
                    title="Nuevas Convocatorias"
                    icon={Briefcase}
                    headerAction={
                        <Link href="/sistema/estudiante/convocatorias" className="text-sm font-semibold text-[#8B1E1E] hover:text-[#731919] flex items-center gap-1">
                            Ver todas <ArrowRight className="w-4 h-4" />
                        </Link>
                    }
                >
                    {availableOpportunities.length > 0 ? (
                        <div className="space-y-4">
                            {availableOpportunities.slice(0, 3).map((opp: any) => (
                                <div key={opp.id} className="group p-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-800 truncate group-hover:text-[#8B1E1E] transition-colors">
                                            {opp.titulo}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{opp.organizacion}</p>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg whitespace-nowrap">
                                            {opp.horas}h disponibles
                                        </span>
                                        <Link
                                            href={`/estudiante/convocatorias/${opp.id}`}
                                            className="p-2 bg-[#8B1E1E]/10 text-[#8B1E1E] rounded-lg hover:bg-[#8B1E1E] hover:text-white transition-colors"
                                        >
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 px-4">
                            <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="font-medium text-slate-700">No hay convocatorias</p>
                            <p className="text-sm text-slate-500 mt-1">
                                Pronto habrán nuevas oportunidades publicadas.
                            </p>
                        </div>
                    )}
                </DashboardCard>
            </div>
        </PageContainer>
    );
}
