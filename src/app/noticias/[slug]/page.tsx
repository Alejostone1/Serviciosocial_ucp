import React from 'react';
import { notFound } from 'next/navigation';
import { db } from '@/lib/prisma';
import { Calendar, User, ArrowLeft, Share2, Tag, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';

async function getNoticia(slug: string) {
    const noticia = await db.execute(async (prisma) => {
        return await prisma.noticia.findUnique({
            where: {
                slug,
                publicada: true
            },
            include: {
                imagenes: {
                    orderBy: { orden: 'asc' }
                }
            }
        });
    }, 'Error al obtener noticia');

    return noticia;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const noticia = await getNoticia(params.slug);

    if (!noticia) {
        return {
            title: 'Noticia no encontrada',
        };
    }

    return {
        title: `${noticia.titulo} | Servicio Social UCP`,
        description: noticia.resumen,
    };
}

export default async function NoticiaDetallePage({ params }: { params: { slug: string } }) {
    const noticia = await getNoticia(params.slug);

    if (!noticia) {
        notFound();
    }

    const imagenPrincipal = noticia.imagenes.find(img => img.orden === 0) || noticia.imagenes[0];
    const galeriaImagenes = noticia.imagenes.filter(img => img.orden > 0);

    return (
        <div className="min-h-screen bg-[#fcfcfd] flex flex-col font-sans">
            <Navbar />

            {/* Breadcrumb - Subtle & Integrated */}
            <nav className="bg-white border-b border-slate-100">
                <div className="container mx-auto px-4 py-4">
                    <div className="max-w-4xl mx-auto flex items-center gap-2 text-[13px] font-semibold text-slate-400">
                        <Link href="/" className="hover:text-[#8B1E1E] transition-colors">Inicio</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <Link href="/noticias" className="hover:text-[#8B1E1E] transition-colors">Noticias</Link>
                        <ChevronRight className="w-3.5 h-3.5" />
                        <span className="text-[#8B1E1E] truncate max-w-[200px] md:max-w-md">Actualidad</span>
                    </div>
                </div>
            </nav>

            <main className="flex-grow py-12 md:py-20">
                <article className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">

                        {/* Article Header */}
                        <header className="space-y-8 mb-12">
                            <div className="space-y-4 text-center md:text-left">
           

                                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight">
                                    {noticia.titulo}
                                </h1>

                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[15px] font-medium text-slate-500 pt-2 border-t border-slate-100">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[#8B1E1E]">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span>Por <span className="text-slate-900 font-bold">{noticia.autor}</span></span>
                                    </div>

                                    <div className="flex items-center gap-2.5">
                                        <Calendar className="w-4.5 h-4.5 text-slate-300" />
                                        <span>
                                            {format(new Date(noticia.fecha_publicacion || noticia.creado_en), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Main Featured Image */}
                            {imagenPrincipal && (
                                <div className="relative aspect-[21/9] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100">
                                    <Image
                                        src={imagenPrincipal.url_imagen}
                                        alt={noticia.titulo}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            )}
                        </header>

                        {/* Article Content */}
                        <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">

                            <div className="space-y-12">
                                {/* Lead / Resumen */}
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#8B1E1E] rounded-full hidden md:block" />
                                    <p className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed pl-0 md:pl-2">
                                        {noticia.resumen}
                                    </p>
                                </div>

                                {/* Body Text */}
                                <div className="prose prose-slate prose-lg md:prose-xl max-w-none prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-loose">
                                    <div className="text-slate-700 whitespace-pre-wrap">
                                        {noticia.contenido}
                                    </div>
                                </div>

                                {/* Multi-Image Gallery */}
                                {galeriaImagenes.length > 0 && (
                                    <div className="space-y-8 pt-12 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <h2 className="text-2xl font-bold text-slate-900">Registro Fotográfico</h2>
                                            <span className="text-sm font-semibold text-slate-400 capitalize">{galeriaImagenes.length} Imágenes</span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {galeriaImagenes.map((imagen, index) => (
                                                <div
                                                    key={imagen.id}
                                                    className={`relative overflow-hidden rounded-2xl border border-slate-100 shadow-sm group cursor-pointer ${index % 3 === 0 ? 'md:col-span-2 aspect-[21/9]' : 'aspect-square md:aspect-video'
                                                        }`}
                                                >
                                                    <Image
                                                        src={imagen.url_imagen}
                                                        alt={`Registro fotográfico de ${noticia.titulo}`}
                                                        fill
                                                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Share / Footer info */}
                                <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <Link
                                        href="/noticias"
                                        className="inline-flex items-center gap-2 group text-slate-500 hover:text-[#8B1E1E] font-bold text-sm uppercase tracking-widest transition-colors"
                                    >
                                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                        Volver a todas las noticias
                                    </Link>

                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Compartir:</span>
                                        <div className="flex gap-2">
                                            <button className="p-2 rounded-full border border-slate-100 text-slate-400 hover:text-[#8B1E1E] hover:bg-red-50 transition-all">
                                                <Share2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <Footer />
        </div>
    );
}
