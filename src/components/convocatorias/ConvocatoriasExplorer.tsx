'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Search, MapPin, Calendar, Users, Filter, ArrowRight, 
  Clock, Building2, ChevronDown, Bookmark, ArrowUpRight, Layers
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

// Generar tonos de alto contraste entre gris y rojo institucional
function generateRedTone(categoryId: string): string {
    const highContrastColors = [
        '#8B1E1E', // Rojo institucional base
        '#A82D2D', // Rojo brillante
        '#6B1818', // Rojo oscuro profundo
        '#4A4A4A', // Gris oscuro
        '#5C5C5C', // Gris medio oscuro
        '#731919', // Rojo vino intenso
        '#3D3D3D', // Gris muy oscuro
        '#C04E4E', // Rojo coral fuerte
        '#2E2E2E', // Gris casi negro
        '#9B2C2C', // Rojo terracota
    ];
    
    // Usar el ID para seleccionar un color consistente
    const hash = categoryId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return highContrastColors[hash % highContrastColors.length];
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
            {/* Header Compacto y Elegante */}
            <header className="relative bg-[#8B1E1E]">
                {/* Background sutil */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 right-0 w-[50%] h-full bg-[#A82D2D] opacity-20" />
                    <div className="absolute bottom-0 left-0 w-[30%] h-[60%] bg-[#731919] opacity-30 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 container mx-auto px-4 md:px-6">
                    <div className="max-w-6xl mx-auto py-8 md:py-10">
                        {/* Badge Institucional */}
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full mb-4"
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                            <span className="text-white/90 text-[11px] font-semibold uppercase tracking-wider">
                                Universidad Católica de Pereira
                            </span>
                        </motion.div>

                        {/* Título Principal - Compacto */}
                        <motion.h1
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="text-2xl md:text-3xl font-bold text-white mb-2"
                        >
                            Plataforma de Servicio Social
                        </motion.h1>
                        
                        <motion.p
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="text-sm text-white/70 max-w-xl mb-6"
                        >
                            Encuentra proyectos que transforman comunidades y potencian tu talento académico.
                        </motion.p>

                        {/* Stats - Diseño Horizontal Compacto */}
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="flex flex-wrap items-center gap-6 md:gap-8"
                        >
                            {[
                                { label: 'Convocatorias activas', value: stats.activeCount },
                                { label: 'Vacantes disponibles', value: stats.totalSpots },
                                { label: 'Aliados', value: stats.orgs },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-baseline gap-2">
                                    <span className="text-2xl md:text-3xl font-bold text-white">
                                        {stat.value}
                                    </span>
                                    <span className="text-white/60 text-xs font-medium">
                                        {stat.label}
                                    </span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Search Bar - Integrado en el flujo */}
                <div className="relative z-10 border-t border-white/10">
                    <div className="container mx-auto px-4 md:px-6 py-4">
                        <div className="max-w-4xl mx-auto">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                                className="flex flex-col sm:flex-row gap-3"
                            >
                                {/* Search Input */}
                                <div className="flex-1 flex items-center px-4 h-11 bg-white rounded-lg shadow-sm">
                                    <Search className="w-4 h-4 text-stone-400 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Buscar proyectos..."
                                        className="w-full bg-transparent text-sm text-stone-700 placeholder:text-stone-400 focus:outline-none"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>

                                {/* Filters */}
                                <div className="flex gap-2">
                                    <select
                                        className="px-4 h-11 bg-white rounded-lg text-sm font-medium text-stone-600 focus:outline-none cursor-pointer"
                                        value={selectedModality || ''}
                                        onChange={(e) => setSelectedModality(e.target.value || null)}
                                    >
                                        <option value="">Todas las modalidades</option>
                                        <option value="PRESENCIAL">Presencial</option>
                                        <option value="VIRTUAL">Virtual</option>
                                        <option value="HIBRIDA">Híbrida</option>
                                    </select>

                                    <button className="px-6 h-11 bg-[#6B1818] hover:bg-[#5a1515] text-white rounded-lg text-sm font-semibold transition-colors">
                                        Buscar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Contenido Principal */}
            <main className="container mx-auto px-4 md:px-6 pt-8 pb-20">
                <div className="max-w-7xl mx-auto">
                        
                        {/* Filtros de Categoría - Estilo limpio */}
                        <section className="mb-12">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-sm font-bold text-stone-500 uppercase tracking-widest">
                                    Áreas de impacto
                                </h2>
                                <span className="text-xs text-stone-400 font-medium">
                                    {categories.length} categorías
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
                                    <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                                        <Search className="w-10 h-10 text-stone-300" />
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
                {/* Header neutro sin color de categoría */}
                <div className="relative h-28 overflow-hidden bg-stone-50 border-b border-stone-100">
                    {/* Línea decorativa roja institucional */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-[#8B1E1E]" />
                    
                    {/* Patrón sutil */}
                    <div className="absolute inset-0 opacity-[0.03]">
                        <svg width="100%" height="100%">
                            <pattern id={`dots-${conv.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="#8B1E1E"/>
                            </pattern>
                            <rect width="100%" height="100%" fill={`url(#dots-${conv.id})`}/>
                        </svg>
                    </div>

                    {/* Badges superiores */}
                    <div className="absolute top-3 left-4 right-4 flex justify-between items-start">
                        <div className="flex flex-wrap gap-2">
                            {conv.categoria && (
                                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-stone-200 text-stone-600 shadow-sm">
                                    {conv.categoria.nombre}
                                </span>
                            )}
                            {isNew && (
                                <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-[#8B1E1E] text-white shadow-sm">
                                    Nuevo
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Info inferior */}
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <div className="flex items-center gap-1.5 text-stone-500">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">
                                {conv.lugar || 'UCP Principal'}
                            </span>
                        </div>
                        
                        {daysUntilClosing !== null && daysUntilClosing <= 7 && daysUntilClosing >= 0 && (
                            <div className="px-2 py-1 rounded bg-[#8B1E1E] text-white text-[10px] font-semibold">
                                {daysUntilClosing === 0 ? 'Cierra hoy' : `Cierra en ${daysUntilClosing}d`}
                            </div>
                        )}
                    </div>
                </div>

                {/* Contenido */}
                <div className="p-5 flex flex-col flex-grow">
                    {/* Modalidad badge */}
                    <div className="mb-3">
                        <span className={cn(
                            "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                            conv.modalidad === 'VIRTUAL' ? "bg-red-50 border-red-200 text-red-700" :
                            conv.modalidad === 'PRESENCIAL' ? "bg-rose-50 border-rose-200 text-rose-700" :
                            "bg-[#8B1E1E]/10 border-[#8B1E1E]/30 text-[#8B1E1E]"
                        )}>
                            {conv.modalidad}
                        </span>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-bold text-stone-900 mb-2 leading-tight group-hover:text-[#8B1E1E] transition-colors line-clamp-2">
                        {conv.titulo}
                    </h3>

                    {/* Descripción truncada */}
                    <p className="text-sm text-stone-500 mb-4 line-clamp-2 leading-relaxed">
                        {conv.descripcion}
                    </p>

                    {/* Publicador */}
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-stone-100">
                        <span className="text-xs text-stone-400">
                            Publicado por:
                        </span>
                        <span className="text-xs font-medium text-stone-600">
                            {conv.publicador 
                                ? `${conv.publicador.primer_nombre} ${conv.publicador.primer_apellido}` 
                                : 'Universidad Católica de Pereira'}
                        </span>
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-stone-400" />
                            <div>
                                <div className="text-[10px] text-stone-400 uppercase">Inicio</div>
                                <div className="text-sm font-semibold text-stone-700">
                                    {safeFormat(conv.fecha_inicio, 'dd MMM') || 'Por definir'}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-stone-400" />
                            <div>
                                <div className="text-[10px] text-stone-400 uppercase">Horas</div>
                                <div className="text-sm font-semibold text-stone-700">
                                    {conv.horas_totales_ofrecidas ? `${conv.horas_totales_ofrecidas}h` : '120h'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Barra de disponibilidad */}
                    <div className="mb-4">
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="font-medium text-stone-500">Cupos disponibles</span>
                            <span className={cn(
                                "font-bold",
                                availabilityRatio > 0.5 ? "text-[#8B1E1E]" : 
                                availabilityRatio > 0.2 ? "text-[#A82D2D]" : "text-red-700"
                            )}>
                                {conv.cupo_disponible || 0} / {conv.cupo_maximo || '?'}
                            </span>
                        </div>
                        <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(availabilityRatio * 100)}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className={cn(
                                    "h-full rounded-full",
                                    availabilityRatio > 0.5 ? "bg-[#8B1E1E]" : 
                                    availabilityRatio > 0.2 ? "bg-[#A82D2D]" : "bg-red-600"
                                )}
                            />
                        </div>
                    </div>

                    {/* Footer con acción */}
                    <div className="mt-auto pt-3 border-t border-stone-100">
                        <Link
                            href={`/Publico/convocatorias/${conv.id}`}
                            className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#6b1818] transition-colors"
                        >
                            Ver detalles
                            <ArrowUpRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.article>
        );
    }
);

ConvocatoriaCard.displayName = 'ConvocatoriaCard';