'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, MapPin, Calendar, Users, Filter, ArrowRight, 
  Clock, Building2, ChevronDown, Bookmark, ArrowUpRight,
  Target, Layers, Compass, Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, subDays, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Interfaces mantenidas exactamente igual
interface Convocatoria {
    id: string;
    titulo: string;
    descripcion: string;
    modalidad: string;
    lugar: string | null;
    fecha_inicio: any;
    fecha_fin: any | null;
    fecha_cierre_postulacion: any | null;
    cupo_maximo: number | null;
    cupo_disponible: number | null;
    horas_totales_ofrecidas: any | null;
    url_banner: string | null;
    publicado_en: any | null;
    creado_en: any;
    categoria: {
        id: string;
        nombre: string;
        color_hex: string | null;
    } | null;
    programa: {
        id: string;
        nombre: string;
    } | null;
    publicador: {
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
    } | null;
    _count: {
        postulaciones: number;
    };
}

interface ConvocatoriasExplorerProps {
    initialConvocatorias: Convocatoria[];
}

export function ConvocatoriasExplorer({ initialConvocatorias }: ConvocatoriasExplorerProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedModality, setSelectedModality] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'newest' | 'closing-soon' | 'most-spots'>('newest');
    const [isSearchFocused, setIsSearchFocused] = useState(false);

    // Lógica de categorías preservada
    const categories = useMemo(() => {
        const cats = initialConvocatorias
            .map(c => c.categoria)
            .filter((cat): cat is { id: string; nombre: string; color_hex: string | null } => cat !== null);
        const uniqueCats = Array.from(new Map(cats.map(item => [item.id, item])).values());
        return uniqueCats.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [initialConvocatorias]);

    // Estadísticas preservadas
    const stats = useMemo(() => {
        const activeCount = initialConvocatorias.length;
        const totalSpots = initialConvocatorias.reduce((acc, curr) => acc + (curr.cupo_disponible || 0), 0);
        const orgs = new Set(initialConvocatorias.map(c => 
            c.publicador?.primer_nombre + (c.publicador?.primer_apellido || '')
        )).size;
        return { activeCount, totalSpots, orgs };
    }, [initialConvocatorias]);

    // Filtrado y ordenamiento preservados exactamente igual
    const filteredConvocatorias = useMemo(() => {
        let filtered = initialConvocatorias.filter(conv => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                conv.titulo.toLowerCase().includes(searchLower) ||
                conv.descripcion.toLowerCase().includes(searchLower) ||
                (conv.publicador?.primer_nombre || '').toLowerCase().includes(searchLower) ||
                (conv.lugar || '').toLowerCase().includes(searchLower);

            const matchesCategory = selectedCategory ? conv.categoria?.id === selectedCategory : true;
            const matchesModality = selectedModality ? conv.modalidad === selectedModality : true;

            return matchesSearch && matchesCategory && matchesModality;
        });

        if (sortBy === 'newest') {
            filtered.sort((a, b) => {
                const dateA = new Date(a.publicado_en || a.creado_en);
                const dateB = new Date(b.publicado_en || b.creado_en);
                const timeA = isValid(dateA) ? dateA.getTime() : 0;
                const timeB = isValid(dateB) ? dateB.getTime() : 0;
                return timeB - timeA;
            });
        } else if (sortBy === 'closing-soon') {
            filtered.sort((a, b) => {
                const dateA = a.fecha_cierre_postulacion ? new Date(a.fecha_cierre_postulacion) : null;
                const dateB = b.fecha_cierre_postulacion ? new Date(b.fecha_cierre_postulacion) : null;
                const timeA = (dateA && isValid(dateA)) ? dateA.getTime() : Infinity;
                const timeB = (dateB && isValid(dateB)) ? dateB.getTime() : Infinity;
                return timeA - timeB;
            });
        } else if (sortBy === 'most-spots') {
            filtered.sort((a, b) => (b.cupo_disponible || 0) - (a.cupo_disponible || 0));
        }

        return filtered;
    }, [initialConvocatorias, searchTerm, selectedCategory, selectedModality, sortBy]);

    return (
        <div className="min-h-screen bg-[#fafaf9]">
            {/* Header Editorial - Responsivo */}
            <header className="relative bg-[#8B1E1E] min-h-[400px] md:min-h-[450px] flex items-center pt-12 pb-20 md:py-0">
                {/* Background Design Elements */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] md:w-[40%] h-[40%] bg-[#A82D2D] rounded-full blur-[80px] md:blur-[100px] opacity-60" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] md:w-[50%] h-[50%] bg-[#731919] rounded-full blur-[80px] md:blur-[100px] opacity-40" />
                    
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />
                        </svg>
                    </div>
                </div>

                <div className="relative z-10 container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid lg:grid-cols-12 gap-8 md:gap-12 items-center">
                            
                            {/* Left Column: Content */}
                            <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                                {/* Institutional Badge */}
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl border border-white/20"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                    <span className="text-white font-bold text-[10px] uppercase tracking-[0.2em]">
                                        U. Católica de Pereira
                                    </span>
                                </motion.div>

                                {/* Main Headline */}
                                <div className="space-y-3">
                                    <motion.h1
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6 }}
                                        className="text-4xl sm:text-5xl md:text-7xl font-black text-white leading-[1.1] md:leading-[0.9] tracking-tighter"
                                    >
                                        <span className="block opacity-80 font-light text-xl sm:text-2xl md:text-3xl tracking-normal mb-1">Plataforma de</span>
                                        Servicio <span className="text-[#FECACA] italic font-serif">Social</span>
                                    </motion.h1>
                                    
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                        className="text-base md:text-lg text-white/70 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium"
                                    >
                                        Encuentra proyectos que transforman comunidades y potencian tu talento académico.
                                    </motion.p>
                                </div>
                            </div>

                            {/* Right Column: Stats Display */}
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="lg:col-span-4 lg:pl-8"
                            >
                                <div className="flex flex-row lg:flex-col flex-wrap justify-center lg:justify-start gap-6 md:gap-8">
                                    {[
                                        { label: 'Activas', value: stats.activeCount },
                                        { label: 'Vacantes', value: stats.totalSpots },
                                        { label: 'Aliados', value: stats.orgs },
                                    ].map((stat, i) => (
                                        <div key={i} className="flex items-center gap-3 md:gap-4">
                                            <div className="text-3xl md:text-4xl font-black text-white lining-nums tracking-tighter">
                                                {stat.value}
                                            </div>
                                            <div className="h-5 md:h-6 w-[1px] bg-white/20" />
                                            <div className="text-white/50 text-[9px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                                                {stat.label}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                        </div>
                    </div>
                </div>

                {/* Floating Search Bridge - Ajustado para móvil */}
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2 z-20">
                    <div className="container mx-auto px-4 md:px-6">
                        <div className="max-w-5xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className={cn(
                                    "bg-white rounded-3xl md:rounded-[2rem] shadow-2xl p-2 md:p-1.5 border border-stone-100",
                                    isSearchFocused ? "ring-4 ring-[#8B1E1E]/5" : ""
                                )}
                            >
                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                                    {/* Main Search Input */}
                                    <div className="flex-1 flex items-center px-4 md:px-5 h-12 md:h-14">
                                        <Search className={cn(
                                            "w-5 h-5 mr-3 transition-colors",
                                            isSearchFocused ? "text-[#8B1E1E]" : "text-stone-300"
                                        )} />
                                        <input
                                            type="text"
                                            placeholder="Buscar proyectos..."
                                            className="w-full bg-transparent text-base md:text-lg text-stone-800 placeholder:text-stone-300 focus:outline-none font-bold tracking-tight"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onFocus={() => setIsSearchFocused(true)}
                                            onBlur={() => setIsSearchFocused(false)}
                                        />
                                    </div>

                                    {/* Modalidades y Botón */}
                                    <div className="flex items-center gap-2 p-1 md:p-0">
                                        {/* Modality Filter Pill */}
                                        <div className="flex-1 md:flex-none flex items-center px-3 md:px-4 border-l border-stone-100 h-10 md:h-10 bg-stone-50 md:bg-transparent rounded-xl md:rounded-none">
                                            <Layers className="w-4 h-4 text-stone-400 md:text-stone-300 mr-2" />
                                            <select
                                                className="w-full bg-transparent text-[11px] md:text-xs font-bold text-stone-600 focus:outline-none cursor-pointer appearance-none"
                                                value={selectedModality || ''}
                                                onChange={(e) => setSelectedModality(e.target.value || null)}
                                            >
                                                <option value="">Modalidad</option>
                                                <option value="PRESENCIAL">Presencial</option>
                                                <option value="VIRTUAL">Virtual</option>
                                                <option value="HIBRIDA">Híbrida</option>
                                            </select>
                                        </div>

                                        {/* Elevated Search Button */}
                                        <button 
                                            className="flex-1 md:flex-none bg-[#8B1E1E] hover:bg-stone-900 text-white px-6 md:px-8 h-10 md:h-12 rounded-xl md:rounded-[1.5rem] font-bold text-[11px] md:text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all duration-300"
                                        >
                                            <span className="hidden sm:inline">Buscar</span>
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido Principal con espaciado responsivo */}
            <main className="container mx-auto px-4 md:px-6 pt-20 md:pt-24 pb-20">
                <div className="max-w-7xl mx-auto">
                        
                        {/* Filtros de Categoría - Estilo Pills con carácter */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-stone-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target className="w-4 h-4" />
                                    Áreas de impacto
                                </h2>
                                <span className="text-xs text-stone-400 font-medium">
                                    {categories.length} categorías disponibles
                                </span>
                            </div>
                            
                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2",
                                        selectedCategory === null
                                            ? "bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-lg shadow-[#8B1E1E]/20"
                                            : "bg-white border-stone-200 text-stone-600 hover:border-[#8B1E1E] hover:text-[#8B1E1E]"
                                    )}
                                >
                                    Todas las áreas
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={cn(
                                            "px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 flex items-center gap-2",
                                            selectedCategory === cat.id
                                                ? "bg-stone-900 border-stone-900 text-white shadow-lg"
                                                : "bg-white border-stone-200 text-stone-600 hover:border-stone-400"
                                        )}
                                    >
                                        {selectedCategory === cat.id && (
                                            <motion.span 
                                                layoutId="activeDot"
                                                className="w-1.5 h-1.5 rounded-full bg-white"
                                            />
                                        )}
                                        {cat.nombre}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* Barra de herramientas y resultados */}
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-stone-200">
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-stone-900 tabular-nums">
                                    {filteredConvocatorias.length}
                                </span>
                                <span className="text-stone-500 font-medium">
                                    {filteredConvocatorias.length === 1 ? 'oportunidad encontrada' : 'oportunidades encontradas'}
                                </span>
                            </div>

                            <div className="flex items-center gap-4 bg-white rounded-xl p-1.5 border border-stone-200 shadow-sm">
                                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider pl-3">
                                    Ordenar:
                                </span>
                                <div className="flex gap-1">
                                    {[
                                        { id: 'newest', label: 'Más recientes' },
                                        { id: 'closing-soon', label: 'Cierran pronto' },
                                        { id: 'most-spots', label: 'Más cupos' }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => setSortBy(option.id as any)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                                                sortBy === option.id
                                                    ? "bg-stone-900 text-white shadow-sm"
                                                    : "text-stone-600 hover:bg-stone-100"
                                            )}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Grid de Tarjetas - Layout Masonry-like */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredConvocatorias.map((conv, idx) => (
                                    <ConvocatoriaCard key={conv.id} conv={conv} index={idx} />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Estado Vacío Rediseñado */}
                        {filteredConvocatorias.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center justify-center py-24 text-center"
                            >
                                <div className="relative mb-8">
                                    <div className="w-32 h-32 bg-stone-100 rounded-full flex items-center justify-center">
                                        <Search className="w-12 h-12 text-stone-300" />
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-6 h-6 text-[#8B1E1E]" />
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-stone-900 mb-3">
                                    No hay coincidencias
                                </h3>
                                <p className="text-stone-500 max-w-md mb-8 leading-relaxed">
                                    Intenta con términos más amplios o ajusta los filtros para descubrir más oportunidades de servicio social.
                                </p>
                                <button
                                    onClick={() => {
                                        setSearchTerm('');
                                        setSelectedCategory(null);
                                        setSelectedModality(null);
                                    }}
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white rounded-xl font-semibold hover:bg-[#6b1818] transition-colors shadow-lg shadow-[#8B1E1E]/20"
                                >
                                    Limpiar filtros
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </motion.div>
                        )}
                    </div>
            </main>
        </div>
    );
}

// Componente de Tarjeta completamente rediseñado
const ConvocatoriaCard = React.forwardRef<HTMLElement, { conv: Convocatoria, index: number }>(
    ({ conv, index }, ref) => {
        const safeFormat = (date: any, formatStr: string) => {
            if (!date) return null;
            const d = new Date(date);
            if (!isValid(d)) return null;
            try {
                return format(d, formatStr, { locale: es });
            } catch (e) {
                return null;
            }
        };

        const daysUntilClosing = useMemo(() => {
            if (!conv.fecha_cierre_postulacion) return null;
            const closing = new Date(conv.fecha_cierre_postulacion);
            if (!isValid(closing)) return null;
            const diff = differenceInDays(closing, new Date());
            return diff >= 0 ? diff : null;
        }, [conv.fecha_cierre_postulacion]);

        const isNew = useMemo(() => {
            const publishedDate = new Date(conv.publicado_en || conv.creado_en);
            if (!isValid(publishedDate)) return false;
            return isAfter(publishedDate, subDays(new Date(), 5));
        }, [conv]);

        const availabilityRatio = useMemo(() => {
            const max = conv.cupo_maximo || 0;
            const avail = conv.cupo_disponible || 0;
            if (max === 0) return 0;
            return avail / max;
        }, [conv]);

        return (
            <motion.article
                ref={ref}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="group relative bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 transition-all duration-500 hover:shadow-xl hover:shadow-stone-900/5 flex flex-col h-full"
            >
                {/* Header de imagen con overlay gradiente */}
                <div className="relative h-48 overflow-hidden bg-stone-100">
                    {conv.url_banner ? (
                        <Image
                            src={conv.url_banner}
                            alt={conv.titulo}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-stone-300" />
                        </div>
                    )}
                    
                    {/* Overlay gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                    {/* Badges superiores */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                        <div className="flex flex-wrap gap-2">
                            {conv.categoria && (
                                <span 
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg backdrop-blur-sm"
                                    style={{ backgroundColor: conv.categoria.color_hex || '#8B1E1E' }}
                                >
                                    {conv.categoria.nombre}
                                </span>
                            )}
                            {isNew && (
                                <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-[#8B1E1E] shadow-lg">
                                    Nuevo
                                </span>
                            )}
                        </div>
                        
                        {/* Bookmark opcional */}
                        <button className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white hover:text-[#8B1E1E] transition-all opacity-0 group-hover:opacity-100">
                            <Bookmark className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Info inferior de imagen */}
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                        <div className="flex items-center gap-2 text-white">
                            <MapPin className="w-4 h-4 opacity-80" />
                            <span className="text-sm font-medium drop-shadow-md">
                                {conv.lugar || 'UCP Principal'}
                            </span>
                        </div>
                        
                        {daysUntilClosing !== null && daysUntilClosing <= 7 && daysUntilClosing >= 0 && (
                            <div className="px-3 py-1.5 rounded-lg bg-white/95 backdrop-blur text-[#8B1E1E] text-xs font-bold shadow-lg animate-pulse">
                                {daysUntilClosing === 0 ? 'Cierra hoy' : `Cierra en ${daysUntilClosing}d`}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-6 flex flex-col flex-grow">
                    {/* Meta info */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center">
                                <span className="text-xs font-bold text-[#8B1E1E]">
                                    {(conv.publicador?.primer_nombre?.[0] || 'U')}
                                    {(conv.publicador?.primer_apellido?.[0] || '')}
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
                                {conv.publicador 
                                    ? `${conv.publicador.primer_nombre} ${conv.publicador.primer_apellido}` 
                                    : 'Universidad'}
                            </span>
                        </div>
                        
                        <span className={cn(
                            "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            conv.modalidad === 'VIRTUAL' ? "bg-blue-50 border-blue-200 text-blue-700" :
                            conv.modalidad === 'PRESENCIAL' ? "bg-emerald-50 border-emerald-200 text-emerald-700" :
                            "bg-amber-50 border-amber-200 text-amber-700"
                        )}>
                            {conv.modalidad}
                        </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-xl font-bold text-stone-900 mb-3 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                        {conv.titulo}
                    </h3>

                    {/* Descripción truncada */}
                    <p className="text-sm text-stone-500 mb-6 line-clamp-2 leading-relaxed">
                        {conv.descripcion}
                    </p>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
                                <Calendar className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-stone-400 font-medium">Inicio</div>
                                <div className="text-sm font-semibold text-stone-700">
                                    {safeFormat(conv.fecha_inicio, 'dd MMM') || 'Por definir'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center text-stone-400">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <div className="text-xs text-stone-400 font-medium">Duración</div>
                                <div className="text-sm font-semibold text-stone-700">
                                    {conv.horas_totales_ofrecidas ? `${conv.horas_totales_ofrecidas}h` : '120h'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de disponibilidad */}
                    <div className="mb-6">
                        <div className="flex justify-between text-xs mb-2">
                            <span className="font-medium text-stone-600">Disponibilidad</span>
                            <span className={cn(
                                "font-bold",
                                availabilityRatio > 0.5 ? "text-emerald-600" : 
                                availabilityRatio > 0.2 ? "text-amber-600" : "text-red-600"
                            )}>
                                {conv.cupo_disponible || 0} de {conv.cupo_maximo || '?'}
                            </span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(availabilityRatio * 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={cn(
                                    "h-full rounded-full",
                                    availabilityRatio > 0.5 ? "bg-emerald-500" : 
                                    availabilityRatio > 0.2 ? "bg-amber-500" : "bg-red-500"
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer con acción */}
                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-mono text-stone-400">
                            #{conv.id.substring(0, 6).toUpperCase()}
                        </span>
                        
                        <Link
                            href={`/convocatorias/${conv.id}`}
                            className="inline-flex items-center gap-2 text-sm font-bold text-[#8B1E1E] hover:text-[#6b1818] transition-colors group/link"
                        >
                            Ver detalles
                            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                        </Link>
                    </div>
                </div>
            </motion.article>
        );
    }
);

ConvocatoriaCard.displayName = 'ConvocatoriaCard';