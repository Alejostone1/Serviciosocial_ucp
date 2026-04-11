import React from 'react';
import { db } from '@/lib/prisma';
import { Calendar, User, ArrowRight, ChevronRight, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';

async function getNoticiasPublicadas() {
    const noticias = await db.execute(async (prisma) => {
        return await prisma.noticia.findMany({
            where: {
                publicada: true
            },
            include: {
                imagenes: {
                    where: { orden: 0 },
                    take: 1
                }
            },
            orderBy: {
                fecha_publicacion: 'desc'
            },
            take: 12
        });
    }, 'Error al obtener noticias publicadas');

    return noticias;
}

export const metadata = {
    title: 'Actualidad Universitaria | Servicio Social UCP',
    description: 'Entérate de las últimas noticias, eventos y proyectos sociales realizados por la comunidad universitaria de la UCP.',
};

export default async function NoticiasPage() {
    const noticias = await getNoticiasPublicadas();

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
            <Navbar />

            {/* Institutional Hero Section */}
            <div className="relative bg-white border-b border-slate-100 overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-[#8B1E1E]/[0.02] -skew-x-12 translate-x-32" />
                <div className="container mx-auto px-4 py-20 relative">
                    <div className="max-w-4xl mx-auto text-center md:text-left">
                
                        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6 tracking-tight leading-none">
                            Actualidad <span className="text-[#8B1E1E]">UCP</span>
                        </h1>
                        <p className="text-xl text-slate-500 max-w-2xl leading-relaxed font-medium">
                            Crónicas, noticias y eventos que documentan el compromiso social y la formación integral de nuestros estudiantes en el territorio.
                        </p>
                    </div>
                </div>
            </div>

            {/* Breadcrumb Section */}
            <nav className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-2 text-[13px] font-semibold text-slate-400">
                        <Link href="/" className="hover:text-[#8B1E1E] transition-colors">Inicio</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[#8B1E1E]">Noticias</span>
                    </div>
                </div>
            </nav>

            {/* Main Content - News Inventory */}
            <main className="max-w-7xl mx-auto px-4 py-20 w-full mb-auto">
                {noticias.length === 0 ? (
                    <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="max-w-md mx-auto space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900">
                                Sin noticias publicadas
                            </h2>
                            <p className="text-slate-500 font-medium">
                                En este momento no hay noticias vigentes. Por favor regresa más tarde para estar informado.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {noticias.map((noticia, idx) => (
                            <article
                                key={noticia.id}
                                className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all hover:border-[#8B1E1E]/20 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-1"
                            >
                                {/* Editorial Image */}
                                <Link href={`/Publico/noticias/${noticia.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                                    {noticia.imagenes.length > 0 ? (
                                        <Image
                                            src={noticia.imagenes[0].url_imagen}
                                            alt={noticia.titulo}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-100">
                                            <Tag className="w-12 h-12 text-slate-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className="bg-white/95 backdrop-blur-sm text-[#8B1E1E] px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm border border-white/20">
                                            Institucional
                                        </span>
                                    </div>
                                </Link>

                                {/* Article Body */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            {format(new Date(noticia.fecha_publicacion || noticia.creado_en), 'dd MMM, yyyy', { locale: es })}
                                        </div>
                                        <div className="w-1 h-1 bg-slate-200 rounded-full" />
                                        <div className="flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5" />
                                            {noticia.autor}
                                        </div>
                                    </div>

                                    <Link href={`/Publico/noticias/${noticia.slug}`} className="block mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-[#8B1E1E] leading-snug line-clamp-2">
                                            {noticia.titulo}
                                        </h3>
                                    </Link>

                                    <p className="text-slate-500 text-sm mb-8 flex-grow leading-relaxed line-clamp-3 font-medium">
                                        {noticia.resumen}
                                    </p>

                                    <Link
                                        href={`/Publico/noticias/${noticia.slug}`}
                                        className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-900 group/btn transition-colors hover:text-[#8B1E1E]"
                                    >
                                        <span className="border-b-2 border-slate-100 group-hover/btn:border-[#8B1E1E] transition-colors pb-1">
                                            Leer artículo completo
                                        </span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </Link>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
