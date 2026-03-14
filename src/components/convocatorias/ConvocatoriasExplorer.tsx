'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, Users, Filter, ArrowRight, Clock, Building2, Briefcase, CheckCircle2, ChevronDown, Sparkles, Flame, Timer } from 'lucide-react';
import Link from 'next/link';
import { format, isAfter, subDays, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// Tipado basado en el fetch de Prisma
interface Convocatoria {
    id: string;
    titulo: string;
    descripcion: string;
    modalidad: string;
    lugar: string | null;
    fecha_inicio: any; // Date o string dependiendo de cómo llegue
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

    // Extraer categorías únicas
    const categories = useMemo(() => {
        const cats = initialConvocatorias
            .map(c => c.categoria)
            .filter((cat): cat is { id: string; nombre: string; color_hex: string | null } => cat !== null);

        // Unificar por ID
        const uniqueCats = Array.from(new Map(cats.map(item => [item.id, item])).values());
        return uniqueCats.sort((a, b) => a.nombre.localeCompare(b.nombre));
    }, [initialConvocatorias]);

    // Estadísticas
    const stats = useMemo(() => {
        const activeCount = initialConvocatorias.length;
        const totalSpots = initialConvocatorias.reduce((acc, curr) => acc + (curr.cupo_disponible || 0), 0);
        const orgs = new Set(initialConvocatorias.map(c => c.publicador?.primer_nombre + (c.publicador?.primer_apellido || ''))).size;

        return { activeCount, totalSpots, orgs };
    }, [initialConvocatorias]);

    // Filtrado y búsqueda
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

        // Ordenar con seguridad
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
        <div className="flex flex-col space-y-0">
            {/* Hero Section Institucional */}
            <section className="relative bg-[#8B1E1E] pt-20 pb-28 overflow-hidden">
                {/* Background Decor - Simple geometric lines instead of dots */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-10">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0 100 L100 0 V100 H0 Z" fill="white" />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="space-y-4">
                                <motion.h1
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="text-4xl md:text-6xl font-bold text-white leading-tight"
                                >
                                    Plataforma de Servicio Social
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto font-medium"
                                >
                                    Conectamos estudiantes con proyectos de impacto social en la Universidad Católica de Pereira.
                                    Busca, filtra y postúlate a las convocatorias vigentes.
                                </motion.p>
                            </div>

                            {/* Métricas Reales - Institucionales */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="grid grid-cols-3 gap-8 md:gap-16 py-6 border-y border-white/10"
                            >
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white">{stats.activeCount}</div>
                                    <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">Convocatorias</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white">{stats.totalSpots}</div>
                                    <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">Cupos Libres</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl md:text-3xl font-bold text-white">{stats.orgs}</div>
                                    <div className="text-xs uppercase tracking-widest text-white/50 font-bold mt-1">Instituciones</div>
                                </div>
                            </motion.div>

                            {/* Herramienta de Búsqueda Robusta */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
                            >
                                <div className="flex flex-col md:flex-row items-stretch">
                                    <div className="flex-grow flex items-center px-6 py-4 border-b md:border-b-0 md:border-r border-slate-100">
                                        <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                                        <input
                                            type="text"
                                            placeholder="Buscar por proyecto, programa o entidad..."
                                            className="w-full text-slate-800 placeholder:text-slate-400 focus:outline-none font-medium bg-transparent"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center px-6 py-4 bg-slate-50/50">
                                        <Filter className="w-4 h-4 text-slate-500 mr-2 shrink-0" />
                                        <select
                                            className="bg-transparent text-slate-700 font-semibold focus:outline-none cursor-pointer text-sm"
                                            value={selectedModality || ''}
                                            onChange={(e) => setSelectedModality(e.target.value || null)}
                                        >
                                            <option value="">Todas las modalidades</option>
                                            <option value="PRESENCIAL">Presencial</option>
                                            <option value="VIRTUAL">Virtual</option>
                                            <option value="HIBRIDA">Híbrida</option>
                                        </select>
                                    </div>

                                    <button className="bg-[#8B1E1E] hover:bg-[#731919] text-white px-10 py-4 font-bold transition-all text-sm uppercase tracking-wide">
                                        Actualizar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Listado y Filtros */}
            <main className="flex-grow bg-[#f8fafc] py-16 relative">
                <div className="container mx-auto px-4">
                    {/* Filtros de Categoría */}
                    <div className="mb-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Filtrar por Área</h2>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={cn(
                                    "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                                    selectedCategory === null
                                        ? "bg-slate-900 border-slate-900 text-white shadow-lg shadow-slate-900/10"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                )}
                            >
                                Todas
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border",
                                        selectedCategory === cat.id
                                            ? "bg-[#8B1E1E] border-[#8B1E1E] text-white shadow-lg shadow-red-900/10"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                    )}
                                >
                                    {cat.nombre}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Barra de Herramientas de Resultados */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                        <p className="text-slate-500 font-medium">
                            Mostrando <span className="text-slate-900 font-bold">{filteredConvocatorias.length}</span> convocatorias encontradas
                        </p>

                        <div className="flex items-center gap-3">
                            <span className="text-slate-400 text-sm font-medium">Ordenar por:</span>
                            <select
                                className="bg-transparent text-slate-900 font-bold focus:outline-none cursor-pointer border-b-2 border-slate-200 pb-0.5"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as any)}
                            >
                                <option value="newest">Más recientes</option>
                                <option value="closing-soon">Cierran pronto</option>
                                <option value="most-spots">Más cupos</option>
                            </select>
                        </div>
                    </div>

                    {/* Grid de Resultados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredConvocatorias.map((conv, idx) => (
                                <ConvocatoriaRedesignedCard key={conv.id} conv={conv} index={idx} />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Estado Vacío */}
                    {filteredConvocatorias.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-slate-200"
                        >
                            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search className="w-10 h-10 text-slate-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">No encontramos resultados</h2>
                            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                                Intenta ajustando tus filtros o buscando con palabras clave diferentes.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory(null);
                                    setSelectedModality(null);
                                }}
                                className="text-[#8B1E1E] font-bold hover:underline"
                            >
                                Limpiar todos los filtros
                            </button>
                        </motion.div>
                    )}
                </div>
            </main>
        </div>
    );
}

const ConvocatoriaRedesignedCard = React.forwardRef<HTMLElement, { conv: Convocatoria, index: number }>(
    ({ conv, index }, ref) => {
        // Función auxiliar para formatear fechas de forma segura
        const safeFormat = (date: any, formatStr: string) => {
            if (!date) return 'No definida';
            const d = new Date(date);
            if (!isValid(d)) return 'Fecha inválida';
            try {
                return format(d, formatStr, { locale: es });
            } catch (e) {
                return 'Error en fecha';
            }
        };

        const isNew = useMemo(() => {
            const publishedDate = new Date(conv.publicado_en || conv.creado_en);
            if (!isValid(publishedDate)) return false;
            return isAfter(publishedDate, subDays(new Date(), 3));
        }, [conv]);

        const isHot = conv._count.postulaciones > (conv.cupo_disponible ? conv.cupo_disponible * 0.5 : 5);

        const endsSoon = useMemo(() => {
            if (!conv.fecha_cierre_postulacion) return false;
            const closingDate = new Date(conv.fecha_cierre_postulacion);
            if (!isValid(closingDate)) return false;

            const now = new Date();
            return isAfter(closingDate, now) && !isAfter(closingDate, subDays(now, -7));
        }, [conv.fecha_cierre_postulacion]);

        return (
            <motion.article
                ref={ref}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="group relative bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col"
            >
                {/* Imagen con Badges */}
                <div className="relative h-44 w-full overflow-hidden shrink-0 bg-slate-100">
                    {conv.url_banner ? (
                        <img
                            src={conv.url_banner}
                            alt={conv.titulo}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full bg-[#f1f5f9] flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-slate-200" />
                        </div>
                    )}

                    {/* Badges Institucionales */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        {conv.categoria && (
                            <span
                                className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-white shadow-sm"
                                style={{ backgroundColor: conv.categoria.color_hex || '#8B1E1E' }}
                            >
                                {conv.categoria.nombre}
                            </span>
                        )}
                        {isNew && (
                            <span className="bg-blue-600 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                Nueva
                            </span>
                        )}
                    </div>

                    {/* Badge de Modalidad - Sólido */}
                    <div className="absolute bottom-3 left-3">
                        <div className="bg-slate-900 text-white px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                            {conv.modalidad}
                        </div>
                    </div>
                </div>

                {/* Contenido Principal */}
                <div className="p-6 flex flex-col flex-grow">
                    {/* Organización */}
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-[#8B1E1E] uppercase tracking-widest">
                                {conv.publicador ? `${conv.publicador.primer_nombre} ${conv.publicador.primer_apellido}` : 'Organización'}
                            </span>
                        </div>

                        {/* Indicador de Disponibilidad */}
                        <div className="flex items-center gap-1.5">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                (conv.cupo_disponible || 0) > 0 ? "bg-green-500" : "bg-red-500"
                            )} />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                                {(conv.cupo_disponible || 0) > 0 ? 'Disponible' : 'Sin cupos'}
                            </span>
                        </div>
                    </div>

                    {/* Título */}
                    <h3 className="text-lg font-bold text-slate-900 mb-6 group-hover:text-[#8B1E1E] transition-colors leading-tight line-clamp-2 min-h-[3rem]">
                        {conv.titulo}
                    </h3>

                    {/* Info Grid - Más compacta e institucional */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-500">
                                <MapPin className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-medium truncate">{conv.lugar || 'UCP'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Users className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-medium">{conv.cupo_disponible || 0} vacantes</span>
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-medium">{safeFormat(conv.fecha_inicio, 'dd/MM/yyyy')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <Clock className="w-4 h-4 text-slate-300" />
                                <span className="text-xs font-medium">{conv.horas_totales_ofrecidas || '120'} hrs</span>
                            </div>
                        </div>
                    </div>

                    {/* Acción Final */}
                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Cod: {conv.id.substring(0, 8)}</span>
                        <Link
                            href={`/convocatorias/${conv.id}`}
                            className="text-[#8B1E1E] hover:text-[#731919] text-xs font-bold uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all"
                        >
                            Ver convocatoria
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </motion.article>
        );
    }
);

ConvocatoriaRedesignedCard.displayName = 'ConvocatoriaRedesignedCard';
