'use client';

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar, User, ChevronRight, Search } from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { NewsSectionSkeleton } from './NewsSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from './SearchContext';

interface Noticia {
    id: string;
    titulo: string;
    resumen: string;
    autor: string;
    slug: string;
    fecha_publicacion: string;
    creado_en: string;
    imagenes: Array<{
        id: string;
        url_imagen: string;
        orden: number;
    }>;
}

interface NewsSectionProps {
    initialData?: Noticia[];
}

export function NewsSection({ initialData }: NewsSectionProps) {

    const { searchQuery, isSearching } = useSearch();
    const [noticias, setNoticias] = useState<Noticia[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);


    useEffect(() => {
        // Preferir datos iniciales del SSR
        if (initialData && noticias.length > 0) {
            setLoading(false);
            return;
        }

        const fetchNoticias = async () => {
            try {
                const response = await fetch('/api/noticias?publicadas=true');
                if (response.ok) {
                    const data = await response.json();
                    setNoticias(data.slice(0, 3));
                }
            } catch (error) {
                console.error('Error fetching noticias:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNoticias();
    }, [initialData, noticias.length]);


    // Filter noticias based on search query
    const filteredNoticias = React.useMemo(() => {
        if (!searchQuery.trim()) return noticias;
        
        const query = searchQuery.toLowerCase();
        return noticias.filter((noticia: Noticia) => 
            noticia.titulo.toLowerCase().includes(query) ||
            noticia.resumen.toLowerCase().includes(query) ||
            noticia.autor.toLowerCase().includes(query)
        );
    }, [noticias, searchQuery]);

    if (filteredNoticias.length === 0 && !loading) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-24 bg-white"
            >
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        {isSearching ? 'No se encontraron noticias' : 'No hay noticias disponibles'}
                    </h2>
                    <p className="text-slate-600 max-w-2xl mx-auto">
                        {isSearching 
                            ? `No hay noticias que coincidan con "${searchQuery}". Intenta con otros términos.` 
                            : 'Pronto habrá nuevas noticias y eventos.'}
                    </p>
                </div>
            </motion.section>
        );
    }

    return (
        <AnimatePresence mode="wait">
            {loading ? (
                <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <NewsSectionSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="py-24 bg-white"
                >
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Header Section - Refined & Institutional */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
                            <div className="space-y-4">
                                {isSearching && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 flex items-center gap-2 text-sm text-[#8B1E1E] font-medium"
                                    >
                                        <Search className="w-4 h-4" />
                                        <span>Mostrando {filteredNoticias.length} resultado{filteredNoticias.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;</span>
                                    </motion.div>
                                )}

                                <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight">
                                    Noticias y <span className="text-[#8B1E1E]">Eventos</span>
                                </h2>
                                <p className="text-slate-500 text-lg max-w-2xl font-medium">
                                    Entérate de las últimas actividades, proyectos sociales e iniciativas que transforman nuestra comunidad universitaria.
                                </p>
                            </div>

                            <Link
                                href="/noticias"
                                className="group inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white text-[13px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#8B1E1E] transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                            >
                                Ver todas las noticias
                                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>

                        {/* News Grid - Editorial Style */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredNoticias.map((noticia, idx) => (
                                <motion.article
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                                    key={noticia.id}
                                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all hover:border-[#8B1E1E]/20 hover:shadow-2xl hover:shadow-slate-200"
                                >
                                    {/* Elevated Image Section */}
                                    <Link href={`/noticias/${noticia.slug}`} className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                                        {noticia.imagenes.length > 0 ? (
                                            <Image
                                                src={noticia.imagenes[0].url_imagen}
                                                alt={noticia.titulo}
                                                fill
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                                                <Image src="/logo-ucp.png" alt="UCP" width={80} height={80} className="opacity-20 contrast-0" />
                                            </div>
                                        )}

                                        {/* Tag Overlay */}
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-white/95 backdrop-blur-sm text-[#8B1E1E] px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border border-white/20">
                                                Noticia
                                            </span>
                                        </div>
                                    </Link>

                                    {/* Refined Content Area */}
                                    <div className="p-8 flex flex-col flex-grow">
                                        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">
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

                                        <Link href={`/noticias/${noticia.slug}`} className="block group/title">
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 transition-colors group-hover/title:text-[#8B1E1E] leading-tight line-clamp-2">
                                                {noticia.titulo}
                                            </h3>
                                        </Link>

                                        <p className="text-slate-500 text-sm mb-8 flex-grow leading-relaxed line-clamp-3 font-medium">
                                            {noticia.resumen}
                                        </p>

                                        <Link
                                            href={`/noticias/${noticia.slug}`}
                                            className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-900 hover:text-[#8B1E1E] transition-colors group/link"
                                        >
                                            <span className="relative">
                                                Seguir leyendo
                                                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#8B1E1E]/10 group-hover/link:bg-[#8B1E1E] transition-colors" />
                                            </span>
                                            <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                                        </Link>
                                    </div>
                                </motion.article>
                            ))}
                        </div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
}
