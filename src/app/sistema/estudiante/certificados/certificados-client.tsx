'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileText, Download, Award, Calendar, CheckCircle, Clock, AlertCircle, Trophy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generarPDFEstudiante } from './actions-client';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { StatsCard } from '../components/ui/StatsCard';
import { EmptyState } from '../components/ui/EmptyState';
import { ProgressBar } from '../components/ui/ProgressBar';

interface Certificado {
    id: string;
    total_horas: number | any;
    emitido_en: any;
    codigo_verificacion: string;
    convocatoria: {
        titulo: string;
    } | null;
    emisor: {
        primer_nombre: string;
        primer_apellido: string;
    } | null;
}

interface Props {
    initialCertificados: any[];
    initialEstadisticas: any;
    initialProgreso: any;
}

export const CertificadosClient = ({ initialCertificados, initialEstadisticas, initialProgreso }: Props) => {
    const [certificados] = useState<Certificado[]>(initialCertificados);
    const [estadisticas] = useState(initialEstadisticas);
    const [progreso] = useState(initialProgreso);
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const handleGeneratePDF = async (cert: Certificado) => {
        setIsGenerating(cert.id);
        const toastId = toast.loading('Generando PDF del certificado...');

        try {
            const pdfBase64 = await generarPDFEstudiante(cert.id);

            // Convert Base64 to Blob
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificado-${cert.convocatoria?.titulo || 'Servicio-Social'}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('✅ PDF descargado exitosamente', { id: toastId });
        } catch (error) {
            toast.error('Error al generar PDF: ' + (error as Error).message, { id: toastId });
        } finally {
            setIsGenerating(null);
        }
    };

    return (
        <PageContainer>
            <SectionHeader
                title="Mis Certificados"
                description="Visualiza y descarga tus certificados oficiales de servicio social."
            />

            {/* Certifications Progress Hero */}
            <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200 p-8 sm:p-10 mb-8 shadow-sm">
                <div className="absolute top-0 right-0 -m-8 w-64 h-64 bg-red-50/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none" />
                <div className="absolute bottom-0 left-0 -m-8 w-64 h-64 bg-emerald-50/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex-1 max-w-2xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-50 text-[#8B1E1E] rounded-xl">
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
                                colorClass={progreso.completado ? 'bg-emerald-500' : 'bg-[#8B1E1E]'}
                                bgClass="bg-slate-200"
                            />
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center justify-center bg-white border border-slate-200 p-6 rounded-2xl w-full md:w-48 text-center shadow-sm">
                        {progreso.completado ? (
                            <CheckCircle className="w-12 h-12 text-emerald-500 mb-3" />
                        ) : (
                            <Clock className="w-12 h-12 text-[#8B1E1E] mb-3" />
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
                <StatsCard title="Total Certificados" value={estadisticas.totalCertificados} description="Documentos emitidos" icon={FileText} colorClass="text-[#8B1E1E] bg-red-50" />
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
                            <Link href="/sistema/estudiante/mis-horas" className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white font-semibold rounded-xl hover:bg-[#a32424] transition">
                                <Clock className="w-4 h-4" />
                                Ver Mis Horas
                            </Link>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {certificados.map(cert => (
                            <div key={cert.id} className="group bg-white rounded-2xl border border-slate-200 p-6 flex flex-col hover:border-[#8B1E1E]/30 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-red-50 text-[#8B1E1E] rounded-xl group-hover:scale-110 group-hover:bg-[#8B1E1E] group-hover:text-white transition-all">
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
                                    {cert.emisor && (
                                        <div className="flex flex-col text-sm pt-2 border-t border-slate-200 mt-2">
                                            <span className="text-slate-500 font-medium mb-1">Emitido por:</span>
                                            <span className="font-medium text-slate-700 truncate">{cert.emisor.primer_nombre} {cert.emisor.primer_apellido}</span>
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleGeneratePDF(cert)}
                                    disabled={isGenerating === cert.id}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#8B1E1E] text-white rounded-xl font-semibold hover:bg-[#6b1717] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isGenerating === cert.id ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Generando...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Descargar PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="bg-red-50 border border-red-100 rounded-2xl p-6 flex flex-col sm:flex-row items-start gap-4 shadow-sm">
                <div className="p-2 bg-red-100/50 rounded-xl shrink-0"><AlertCircle className="w-6 h-6 text-[#8B1E1E]" /></div>
                <div>
                    <h4 className="font-bold text-red-900 mb-2">Información sobre Certificados Oficiales</h4>
                    <p className="text-sm text-red-800/80 leading-relaxed max-w-4xl">
                        Los certificados generados en esta plataforma cuentan con un código criptográfico único que garantiza su autenticidad y validez institucional. Cada documento sirve como soporte oficial de que has concluido las actividades y horas requeridas por la universidad.
                    </p>
                </div>
            </div>
        </PageContainer>
    );
}
