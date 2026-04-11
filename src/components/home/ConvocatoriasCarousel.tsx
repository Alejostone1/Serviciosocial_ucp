'use client';

import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight, Clock, Building2, ArrowRight, CheckCircle2, Calendar, MapPin, Search } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ConvocatoriasSkeleton } from './ConvocatoriaSkeleton';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';
import { useSearch } from './SearchContext';

interface Convocatoria {
    id: string;
    titulo: string;
    descripcion: string;
    horas_totales_ofrecidas: number | null;
    modalidad: string;
    lugar: string | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    programa: {
        nombre: string;
    } | null;
    categoria: {
        nombre: string;
        color_hex: string | null;
    } | null;
}

interface ConvocatoriasCarouselProps {
    initialData?: Convocatoria[];
}

export function ConvocatoriasCarousel({ initialData }: ConvocatoriasCarouselProps) {

    const { searchQuery, isSearching } = useSearch();
    const [convocatorias, setConvocatorias] = useState<Convocatoria[]>(initialData || []);
    const [loading, setLoading] = useState(!initialData);

    const [emblaRef, emblaApi] = useEmblaCarousel({
        align: 'start',
        loop: true,
        skipSnaps: false,
        dragFree: true,
    });

    const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
    const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    const onSelect = useCallback(() => {
        if (!emblaApi) return;
        setPrevBtnEnabled(emblaApi.canScrollPrev());
        setNextBtnEnabled(emblaApi.canScrollNext());
    }, [emblaApi]);

    useEffect(() => {
        if (!emblaApi) return;
        onSelect();
        emblaApi.on('select', onSelect);
        emblaApi.on('reInit', onSelect);
    }, [emblaApi, onSelect]);

    // Auto-scroll functionality
    useEffect(() => {
        if (!emblaApi) return;
        if (isHovered) return; // Pause on hover

        const intervalId = setInterval(() => {
            emblaApi.scrollNext();
        }, 4000);

        return () => clearInterval(intervalId);
    }, [emblaApi, isHovered]);

    // Fetch convocatorias from API
    useEffect(() => {
        // Si ya tenemos datos iniciales y no estamos buscando, no hace falta el fetch inicial
        if (initialData && convocatorias.length > 0) {
            setLoading(false);
            return;
        }

        const fetchConvocatorias = async () => {
            try {
                const response = await fetch('/api/convocatorias/public');
                if (response.ok) {
                    const data = await response.json();
                    const validData = Array.isArray(data) ? data.filter(conv =>
                        conv &&
                        typeof conv.id === 'string' &&
                        typeof conv.titulo === 'string'
                    ) : [];
                    setConvocatorias(validData);
                }
            } catch (error) {
                console.error('Error fetching convocatorias:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConvocatorias();
    }, [initialData, convocatorias.length]);


    // Filter convocatorias based on search query
    const filteredConvocatorias = React.useMemo(() => {
        if (!searchQuery.trim()) return convocatorias;
        
        const query = searchQuery.toLowerCase();
        return convocatorias.filter((conv: Convocatoria) => 
            conv.titulo.toLowerCase().includes(query) ||
            conv.descripcion.toLowerCase().includes(query) ||
            conv.categoria?.nombre?.toLowerCase().includes(query) ||
            conv.programa?.nombre?.toLowerCase().includes(query) ||
            conv.modalidad?.toLowerCase().includes(query) ||
            (conv.lugar && conv.lugar.toLowerCase().includes(query))
        );
    }, [convocatorias, searchQuery]);

    if (!loading && filteredConvocatorias.length === 0) {
        return (
            <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
            >
                {/* Background with blur effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-[#8B1E1E]/5 rounded-full blur-3xl" />
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

                <div className="relative z-10 container mx-auto text-center">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">
                        {isSearching ? 'No se encontraron convocatorias' : 'No hay convocatorias disponibles'}
                    </h2>
                    <p className="text-slate-600">
                        {isSearching 
                            ? `No hay convocatorias que coincidan con "${searchQuery}". Intenta con otros términos.` 
                            : 'Pronto habrá nuevas oportunidades de servicio social.'}
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
                    <ConvocatoriasSkeleton />
                </motion.div>
            ) : (
                <motion.section
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white"
                >
                    {/* Background with blur effects */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50" />
                    <div className="absolute top-20 left-10 w-72 h-72 bg-[#8B1E1E]/5 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-slate-200/30 rounded-full blur-3xl" />

                    <div className="relative z-10 container mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="max-w-2xl"
                            >
                                {/* Search indicator */}
                                {isSearching && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 flex items-center gap-2 text-sm text-[#8B1E1E] font-medium"
                                    >
                                        <Search className="w-4 h-4" />
                                        <span>Mostrando {filteredConvocatorias.length} resultado{filteredConvocatorias.length !== 1 ? 's' : ''} para &quot;{searchQuery}&quot;</span>
                                    </motion.div>
                                )}

                                <h2 className="text-4xl font-bold text-slate-900 mb-4">
                                    Convocatorias <span className="text-[#8B1E1E]">Abiertas</span>
                                </h2>
                                <p className="text-lg text-slate-600 leading-relaxed">
                                    Explora las oportunidades disponibles para realizar tu servicio social y aportar al desarrollo de la comunidad.
                                </p>
                            </motion.div>

                            {/* Navigation Buttons */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4, delay: 0.4 }}
                                className="flex gap-2 shrink-0"
                            >
                                <button
                                    onClick={scrollPrev}
                                    className="p-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]/30 hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Anterior convocatoria"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={scrollNext}
                                    className="p-3 rounded-full border border-slate-200 bg-white/80 backdrop-blur-sm text-slate-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]/30 hover:bg-white transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    aria-label="Siguiente convocatoria"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </motion.div>
                        </div>

                        {/* Embla Carousel Viewport */}
                        <div
                            className="overflow-hidden -mx-4 px-4 sm:mx-0 sm:px-0"
                            ref={emblaRef}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            <div className="flex gap-6 touch-pan-y" style={{ WebkitTapHighlightColor: 'transparent' }}>
                                {filteredConvocatorias.map((conv, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: idx * 0.1 }}
                                        key={conv.id || `conv-${idx}`}
                                        className="flex-[0_0_100%] min-w-0 sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)]"
                                    >
                                        <div className="group h-full bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                                            {/* Header accent */}
                                            <div className="h-1.5 bg-[#8B1E1E]" />

                                            <div className="p-6 flex flex-col h-full">
                                                {/* Category and hours */}
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex items-center gap-2">
                                                        {conv.categoria && conv.categoria.nombre && (
                                                            <div className="flex items-center gap-1.5">
                                                                <div
                                                                    className="w-2 h-2 rounded-full"
                                                                    style={{ backgroundColor: conv.categoria.color_hex || '#8B1E1E' }}
                                                                />
                                                                <span className="text-xs font-medium text-slate-600 uppercase tracking-wider">
                                                                    {conv.categoria.nombre}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {conv.horas_totales_ofrecidas ? `${Number(conv.horas_totales_ofrecidas)}h` : 'N/A'}
                                                    </div>
                                                </div>

                                                {/* Title */}
                                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                                                    {conv.titulo}
                                                </h3>

                                                {/* Organization */}
                                                <div className="flex items-center gap-2 mb-4 text-sm font-medium text-slate-600">
                                                    <Building2 className="w-4 h-4 shrink-0 text-slate-400" />
                                                    <span className="truncate">{conv.programa?.nombre || 'No especificada'}</span>
                                                </div>

                                                {/* Description */}
                                                <p className="text-sm text-slate-600 leading-relaxed mb-6 flex-grow line-clamp-3">
                                                    {conv.descripcion}
                                                </p>

                                                {/* Meta info */}
                                                <div className="flex items-center gap-4 mb-6 text-xs text-slate-500">
                                                    <div className="flex items-center gap-1">
                                                        <MapPin className="w-3 h-3" />
                                                        <span>{conv.modalidad || 'No especificada'}</span>
                                                    </div>
                                                    {conv.fecha_inicio && (
                                                        <div className="flex items-center gap-1">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>
                                                                {new Date(conv.fecha_inicio).toLocaleDateString('es-PE', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Actions */}
                                                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100">
                                                    <Link
                                                        href={`/Publico/convocatorias/${conv.id}`}
                                                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 transition-all"
                                                    >
                                                        Ver detalles
                                                    </Link>
                                                    <Link
                                                        href={`/login?redirect=/Publico/convocatorias/${conv.id}`}
                                                        className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-bold text-white bg-[#8B1E1E] hover:bg-[#6b1818] active:bg-[#5a1515] transition-all gap-1.5 group/btn shadow-sm hover:shadow"
                                                    >
                                                        Postularme
                                                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>
            )}
        </AnimatePresence>
    );
}
