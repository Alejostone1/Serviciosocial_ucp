import React from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { FileText, Download, Award, Calendar, CheckCircle, Clock, AlertCircle, Search, Trophy } from 'lucide-react';
import { db } from '@/lib/prisma';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';

export const metadata = { title: 'Mis Certificados | Estudiante' };

async function getCertificadosEstudiante(userId: string) {
    const certificados = await db.execute(async (prisma) => {
        return await prisma.certificado.findMany({
            where: { id_estudiante: userId },
            include: {
                convocatoria: {
                    select: { titulo: true, descripcion: true, categoria: { select: { nombre: true, color_hex: true } } }
                },
                emisor: {
                    select: { primer_nombre: true, primer_apellido: true }
                }
            },
            orderBy: { emitido_en: 'desc' }
        });
    }, 'Error al obtener certificados');
    return certificados;
}

async function getEstadisticasCertificados(userId: string) {
    const stats = await db.execute(async (prisma) => {
        const total = await prisma.certificado.count({ where: { id_estudiante: userId } });
        const horas = await prisma.certificado.aggregate({ where: { id_estudiante: userId }, _sum: { total_horas: true } });
        const esteAno = await prisma.certificado.count({ where: { id_estudiante: userId, emitido_en: { gte: new Date(new Date().getFullYear(), 0, 1) } } });
        const ultimo = await prisma.certificado.findFirst({ where: { id_estudiante: userId }, orderBy: { emitido_en: 'desc' }, select: { emitido_en: true } });

        return {
            totalCertificados: total,
            totalHorasCertificadas: Number(horas._sum.total_horas || 0),
            certificadosEsteAnio: esteAno,
            ultimoCertificado: ultimo?.emitido_en || null
        };
    }, 'Error al obtener estadísticas');
    return stats;
}

async function getProgresoCertificacion(userId: string) {
    const perfil = await db.execute(async (prisma) => {
        return await prisma.perfilEstudiante.findUnique({
            where: { id_usuario: userId },
            select: { horas_acumuladas: true, porcentaje_avance: true }
        });
    }, 'Error al obtener perfil');

    const horasRequeridas = 180;
    const horasAcumuladas = Number(perfil?.horas_acumuladas || 0);
    const porcentajeAvance = Number(perfil?.porcentaje_avance || 0);
    const completado = horasAcumuladas >= horasRequeridas;

    return {
        horasRequeridas,
        horasAcumuladas,
        porcentajeAvance,
        horasRestantes: Math.max(0, horasRequeridas - horasAcumuladas),
        completado
    };
}

export default async function CertificadosPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ESTUDIANTE') redirect('/login');

    const [certificados, estadisticas, progreso] = await Promise.all([
        getCertificadosEstudiante(session.user.id),
        getEstadisticasCertificados(session.user.id),
        getProgresoCertificacion(session.user.id)
    ]);

    return (
        <PageContainer>
            <SectionHeader
                title="Mis Certificados"
                description="Visualiza y descarga tus certificados oficiales de servicio social."
            />

            {/* Certifications Progress Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 mb-8 shadow-sm">
                <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-indigo-50/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-emerald-50/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                <Trophy className="w-5 h-5" />
                            </div>
                            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                {progreso.completado ? '¡Felicitaciones! Has completado el requisito.' : 'Progreso de Certificación Principal'}
                            </h2>
                        </div>
                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6">
                            {progreso.completado
                                ? 'Ya puedes generar tu certificado oficial que valida la culminación de tu servicio social universitario.'
                                : 'Continúa sumando horas de servicio social para alcanzar la meta y obtener tu certificado principal de culminación.'}
                        </p>
                        <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                            <ProgressBar
                                value={progreso.horasAcumuladas}
                                max={progreso.horasRequeridas}
                                showLabel={true}
                                size="lg"
                                colorClass={progreso.completado ? 'bg-emerald-500' : 'bg-indigo-600'}
                                bgClass="bg-slate-200"
                            />
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center bg-white border border-slate-200 p-6 rounded-2xl w-full md:w-48 text-center shadow-sm">
                        {progreso.completado ? (
                            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                        ) : (
                            <Clock className="w-12 h-12 text-indigo-500 mb-3" />
                        )}
                        <span className="font-bold text-lg text-slate-900">
                            {progreso.completado ? 'Completado' : `${progreso.horasRestantes}h`}
                        </span>
                        <span className="text-sm text-slate-500 font-medium">
                            {progreso.completado ? 'Meta superada' : 'horas restantes'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatsCard title="Total Certificados" value={estadisticas.totalCertificados} description="Documentos emitidos" icon={FileText} colorClass="text-indigo-600 bg-indigo-50" />
                <StatsCard title="Horas Certificadas" value={`${estadisticas.totalHorasCertificadas}h`} description="Validadas oficialmente" icon={Award} colorClass="text-emerald-600 bg-emerald-50" />
                <StatsCard title="Este Año" value={estadisticas.certificadosEsteAnio} description="Certificados recientes" icon={Calendar} colorClass="text-amber-600 bg-amber-50" />
                <StatsCard
                    title="Último"
                    value={estadisticas.ultimoCertificado ? new Date(estadisticas.ultimoCertificado).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) : 'N/A'}
                    description={estadisticas.ultimoCertificado ? 'Fecha de emisión' : 'Sin certificados'}
                    icon={Clock}
                    colorClass="text-purple-600 bg-purple-50"
                />
            </div>

            {/* Lista */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900 tracking-tight">Historial de Certificados</h3>
                </div>

                {certificados.length === 0 ? (
                    <EmptyState
                        icon={Award}
                        title="No tienes certificados aún"
                        description="Completa horas y culmina proyectos para empezar a recibir certificados."
                        action={
                            <Link href="/estudiante/mis-horas" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition">
                                <Clock className="w-4 h-4" />
                                Ver Mis Horas
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificados.map(cert => (
                            <div key={cert.id} className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-indigo-300 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                        <Award className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-slate-900 line-clamp-2">Certificado de Servicio Social</h4>
                                        <p className="text-sm text-slate-500 mt-1 line-clamp-1 truncate">{cert.convocatoria?.titulo || 'General'}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 mb-6 bg-slate-50/50 p-4 rounded-xl border border-slate-100 flex-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Horas Certificadas</span>
                                        <span className="font-bold text-slate-700">{Number(cert.total_horas)}h</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Fecha Emisión</span>
                                        <span className="font-semibold text-slate-700">{new Date(cert.emitido_en).toLocaleDateString('es-ES')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500 font-medium">Código Verificación</span>
                                        <span className="font-semibold text-slate-700 font-mono text-xs mt-0.5">{cert.codigo_verificacion.slice(0, 8)}</span>
                                    </div>
                                    <div className="flex flex-col text-sm pt-2 border-t border-slate-200 mt-2">
                                        <span className="text-slate-500 font-medium mb-1">Emitido por:</span>
                                        <span className="font-medium text-slate-700 truncate">{cert.emisor.primer_nombre} {cert.emisor.primer_apellido}</span>
                                    </div>
                                </div>

                                <a
                                    href={cert.url_pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-indigo-600 transition-colors"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar PDF
                                </a>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
                <div className="p-2 bg-indigo-100/50 rounded-xl shrink-0"><AlertCircle className="w-6 h-6 text-indigo-600" /></div>
                <div>
                    <h4 className="font-bold text-indigo-900 mb-2">Información sobre Certificados Oficiales</h4>
                    <p className="text-sm text-indigo-800/80 leading-relaxed max-w-4xl">
                        Los certificados generados en esta plataforma cuentan con un código criptográfico único que garantiza su autenticidad y validez institucional. Cada documento sirve como soporte oficial de que has concluido las actividades y horas requeridas por la universidad.
                    </p>
                </div>
            </div>
        </PageContainer>
    );
}
