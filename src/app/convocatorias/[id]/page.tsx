import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ExternalLink, Building2, Briefcase, FileText, CheckCircle2, LogIn } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';

async function getConvocatoria(id: string) {
    const convocatoria = await db.execute(async (prisma) => {
        return await prisma.convocatoria.findUnique({
            where: {
                id,
                estado: 'PUBLICADA'
            },
            include: {
                categoria: true,
                programa: true,
                publicador: {
                    select: {
                        primer_nombre: true,
                        primer_apellido: true,
                    }
                },
                actividades: {
                    where: { esta_activa: true },
                    orderBy: { fecha_inicio: 'asc' }
                }
            }
        });
    }, 'Error al obtener convocatoria');

    return convocatoria;
}

export async function generateMetadata({ params }: { params: { id: string } }) {
    const convocatoria = await getConvocatoria(params.id);

    if (!convocatoria) {
        return {
            title: 'Convocatoria no encontrada',
        };
    }

    return {
        title: `${convocatoria.titulo} | Servicio Social UCP`,
        description: convocatoria.descripcion.substring(0, 160),
    };
}

export default async function ConvocatoriaDetallePage({ params }: { params: { id: string } }) {
    const convocatoria = await getConvocatoria(params.id);

    if (!convocatoria) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex flex-col">
            <Navbar />

            {/* Breadcrumb - Subtle and integrated */}
            <div className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/convocatorias"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-[#8B1E1E] text-sm font-semibold transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Volver al explorador
                    </Link>
                </div>
            </div>

            {/* Header Section - Human-Centric Typography */}
            <header className="bg-white border-b border-slate-100 py-16">
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col md:flex-row gap-10 items-start">
                            {/* Logo/Icon Container */}
                            <div className="w-24 h-24 rounded-2xl bg-[#f8fafc] border border-slate-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                {convocatoria.url_banner ? (
                                    <Image
                                        src={convocatoria.url_banner}
                                        alt="Banner"
                                        width={96}
                                        height={96}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <Building2 className="w-10 h-10 text-slate-200" />
                                )}
                            </div>

                            <div className="flex-grow space-y-5">
                                <div className="flex flex-wrap gap-2">
                                    {convocatoria.categoria && (
                                        <span
                                            className="px-3 py-1 rounded-md text-[11px] font-semibold text-white shadow-sm"
                                            style={{ backgroundColor: convocatoria.categoria.color_hex || '#8B1E1E' }}
                                        >
                                            {convocatoria.categoria.nombre}
                                        </span>
                                    )}
                                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-md text-[11px] font-semibold border border-slate-200">
                                        {convocatoria.modalidad}
                                    </span>
                                </div>

                                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight">
                                    {convocatoria.titulo}
                                </h1>

                                <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-slate-500 font-medium text-[15px]">
                                    <div className="flex items-center gap-2.5">
                                        <Building2 className="w-4.5 h-4.5 text-slate-400" />
                                        <span>{convocatoria.publicador ? `${convocatoria.publicador.primer_nombre} ${convocatoria.publicador.primer_apellido}` : 'Universidad Católica de Pereira'}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <MapPin className="w-4.5 h-4.5 text-slate-400" />
                                        <span>{convocatoria.lugar || 'Instalaciones UCP'}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Users className="w-4.5 h-4.5 text-slate-400" />
                                        <span>{convocatoria.cupo_disponible || 'Sin límite de'} cupos</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content Body */}
            <main className="container mx-auto px-4 py-16 flex-grow">
                <div className="max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-16">

                            {convocatoria.url_banner && (
                                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                                    <Image
                                        src={convocatoria.url_banner}
                                        alt={convocatoria.titulo}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}

                            <section className="space-y-8">
                                <div className="space-y-2">
                                    <h3 className="text-xs font-bold text-[#8B1E1E] uppercase tracking-widest">General</h3>
                                    <h2 className="text-2xl font-bold text-slate-900">Descripción del Proyecto</h2>
                                </div>
                                <div className="prose prose-slate prose-lg max-w-none">
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {convocatoria.descripcion}
                                    </p>
                                </div>
                            </section>

                            {convocatoria.objetivo && (
                                <section className="space-y-8 pt-8 border-t border-slate-100 font-sans">
                                    <h2 className="text-2xl font-bold text-slate-900">Objetivos principales</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
                                        {convocatoria.objetivo}
                                    </p>
                                </section>
                            )}

                            {convocatoria.competencias_requeridas.length > 0 && (
                                <section className="space-y-8 pt-8 border-t border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900">Perfil del estudiante</h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {convocatoria.competencias_requeridas.map((item, idx) => (
                                            <div key={idx} className="flex items-start gap-3 bg-white p-5 rounded-xl border border-slate-100 shadow-sm transition-all hover:shadow-md">
                                                <div className="bg-blue-50/50 p-2 rounded-lg shrink-0">
                                                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700 leading-tight pt-1">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {convocatoria.actividades.length > 0 && (
                                <section className="space-y-8 pt-8 border-t border-slate-100">
                                    <h2 className="text-2xl font-bold text-slate-900">Plan de Actividades</h2>
                                    <div className="space-y-5">
                                        {convocatoria.actividades.map((act) => (
                                            <div key={act.id} className="bg-white border border-slate-100 rounded-2xl p-6 transition-all hover:border-[#8B1E1E]/20 shadow-sm">
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                                    <h4 className="text-lg font-bold text-slate-900">{act.nombre}</h4>
                                                    <span className="bg-slate-50 text-slate-500 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap self-start md:self-auto border border-slate-100">
                                                        {Number(act.horas_estimadas)} Horas de labor
                                                    </span>
                                                </div>
                                                <p className="text-slate-600 text-[15px] leading-relaxed mb-6">
                                                    {act.descripcion}
                                                </p>
                                                <div className="flex flex-wrap gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                                    {act.fecha_inicio && (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-3.5 h-3.5" />
                                                            {format(new Date(act.fecha_inicio), 'dd MMM yyyy', { locale: es })}
                                                        </div>
                                                    )}
                                                    {act.ubicacion && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            {act.ubicacion}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-10">

                            {/* Simple Login/Action Card */}
                            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-sm space-y-6">
                                <div className="space-y-4">
                                    <p className="text-slate-600 text-sm leading-relaxed text-center font-medium">
                                        Para postularte a esta convocatoria o ver detalles adicionales, debes iniciar sesión con tu cuenta universitaria.
                                    </p>

                                    <Link
                                        href="/auth/login"
                                        className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-bold text-sm shadow-md hover:shadow-lg active:scale-[0.98]"
                                    >
                                        <LogIn className="w-4 h-4" />
                                        Iniciar sesión para postularme
                                    </Link>

                                    {convocatoria.url_documento_adicional && (
                                        <Link
                                            href={convocatoria.url_documento_adicional}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Ver documentos anexos
                                        </Link>
                                    )}
                                </div>
                            </div>

                            {/* Technical Details - Clean & Minimal */}
                            <div className="bg-white border border-slate-100 rounded-2xl p-8 space-y-8 shadow-sm">
                                <h3 className="font-bold text-slate-900 text-sm border-b border-slate-50 pb-4">Detalles técnicos</h3>

                                <div className="space-y-6">
                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <Clock className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-semibold text-slate-400">Duración total</dt>
                                            <dd className="text-base font-bold text-slate-900">{convocatoria.horas_totales_ofrecidas ? `${convocatoria.horas_totales_ofrecidas} Horas` : '120 Horas'}</dd>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-semibold text-slate-400">Inicio estimado</dt>
                                            <dd className="text-base font-bold text-slate-900">{format(new Date(convocatoria.fecha_inicio), 'dd MMMM, yyyy', { locale: es })}</dd>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 items-center">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <Briefcase className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <dt className="text-[11px] font-semibold text-slate-400">Modalidad</dt>
                                            <dd className="text-base font-bold text-slate-900">{convocatoria.modalidad}</dd>
                                        </div>
                                    </div>

                                    {convocatoria.fecha_cierre_postulacion && (
                                        <div className="flex gap-4 items-center p-4 bg-red-50/30 rounded-xl border border-red-50/50">
                                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-red-100/50">
                                                <Clock className="w-5 h-5 text-[#8B1E1E]" />
                                            </div>
                                            <div>
                                                <dt className="text-[11px] font-semibold text-[#8B1E1E]/60">Límite de registro</dt>
                                                <dd className="text-base font-bold text-[#8B1E1E]">{format(new Date(convocatoria.fecha_cierre_postulacion), 'dd MMMM', { locale: es })}</dd>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
