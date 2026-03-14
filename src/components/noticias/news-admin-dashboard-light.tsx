'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Filter, Grid, List, FileText, Image as ImageIcon, ChevronDown, X } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DeleteNoticiaButton } from './delete-noticia-button';
import { NoticiaPreviewModal } from './noticia-preview-modal';

interface Noticia {
    id: string;
    titulo: string;
    resumen: string;
    contenido: string;
    autor: string;
    publicada: boolean;
    creado_en: string;
    slug?: string;
    fecha_publicacion?: string | null;
    imagenes: Array<{
        id: string;
        url_imagen: string;
        orden: number;
    }>;
}

interface NewsAdminDashboardLightProps {
    noticias: Noticia[];
}

export function NewsAdminDashboardLight({ noticias }: NewsAdminDashboardLightProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [previewNoticia, setPreviewNoticia] = useState<Noticia | null>(null);

    // Filtrar noticias
    const filteredNoticias = useMemo(() => {
        return noticias.filter(noticia => {
            const matchesSearch = noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                noticia.resumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
                noticia.autor.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'published' && noticia.publicada) ||
                (statusFilter === 'draft' && !noticia.publicada);

            return matchesSearch && matchesStatus;
        });
    }, [noticias, searchTerm, statusFilter]);

    const stats = {
        total: noticias.length,
        published: noticias.filter(n => n.publicada).length,
        draft: noticias.filter(n => !n.publicada).length
    };

    const handleEditNoticia = (noticia: Noticia) => {
        setPreviewNoticia(null);
        // Redirigir a edición
        window.location.href = `/administrador/noticias/${noticia.id}/editar`;
    };

    return (
        <div className="space-y-6">
            {/* Header y Estadísticas */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-[#8B1E1E]/10 rounded-lg">
                                    <FileText className="w-6 h-6 text-[#8B1E1E]" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Noticias</h1>
                            </div>
                            <p className="text-gray-500 text-lg ml-11">Administra el contenido informativo institucional</p>
                        </div>

                        <Link
                            href="/administrador/noticias/nueva"
                            className="group inline-flex items-center gap-3 px-6 py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-bold shadow-md hover:shadow-lg active:scale-95"
                        >
                            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                            Nueva Noticia
                        </Link>
                    </div>

                    {/* Estadísticas Institucionales */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-[#8B1E1E]/30 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Total Noticias</p>
                                    <p className="text-3xl font-extrabold text-gray-900">{stats.total}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-[#8B1E1E]/5 transition-colors">
                                    <FileText className="w-6 h-6 text-gray-400 group-hover:text-[#8B1E1E]" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-green-500/30 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Publicadas</p>
                                    <p className="text-3xl font-extrabold text-gray-900">{stats.published}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-green-50 transition-colors">
                                    <Eye className="w-6 h-6 text-gray-400 group-hover:text-green-600" />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:border-amber-500/30 transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Borradores</p>
                                    <p className="text-3xl font-extrabold text-gray-900">{stats.draft}</p>
                                </div>
                                <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                                    <FileText className="w-6 h-6 text-gray-400 group-hover:text-amber-600" />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título, resumen o autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10 focus:border-[#8B1E1E] transition-all bg-gray-50/30 font-medium text-sm"
                        />
                    </div>

                    {/* Filtros rápidos en fila */}
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="appearance-none pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/10 focus:border-[#8B1E1E] transition-all bg-white font-bold text-xs uppercase tracking-wider text-gray-600 cursor-pointer"
                            >
                                <option value="all">Todas</option>
                                <option value="published">Publicadas</option>
                                <option value="draft">Borradores</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        <div className="h-8 w-px bg-gray-100"></div>

                        {/* Vista modes */}
                        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                                    ? 'bg-white text-[#8B1E1E] shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="Vista Grid"
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                                    ? 'bg-white text-[#8B1E1E] shadow-sm'
                                    : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                title="Vista Lista"
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resultados */}
            <div className="flex items-center justify-between">
                <p className="text-slate-600">
                    Mostrando <span className="font-semibold text-slate-900">{filteredNoticias.length}</span> de{' '}
                    <span className="font-semibold text-slate-900">{noticias.length}</span> noticias
                </p>

                {filteredNoticias.length === 0 && (
                    <div className="text-slate-500">
                        {searchTerm || statusFilter !== 'all'
                            ? 'No hay noticias que coincidan con los filtros'
                            : 'No hay noticias registradas'}
                    </div>
                )}
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && filteredNoticias.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredNoticias.map((noticia, idx) => (
                        <motion.article
                            key={noticia.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            {/* Imagen */}
                            <div className="aspect-video relative overflow-hidden bg-gray-100">
                                {noticia.imagenes.length > 0 ? (
                                    <img
                                        src={noticia.imagenes[0].url_imagen}
                                        alt={noticia.titulo}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-gray-200" />
                                    </div>
                                )}

                                {/* Badge de estado - Más elegante */}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-sm ${noticia.publicada
                                        ? 'bg-green-600/90 text-white'
                                        : 'bg-[#8B1E1E]/90 text-white'
                                        }`}>
                                        {noticia.publicada ? 'Publicada' : 'Borrador'}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-5">
                                <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#8B1E1E] transition-colors leading-tight min-h-[2.5rem]">
                                    {noticia.titulo}
                                </h3>

                                <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">
                                    {noticia.resumen}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-[10px] text-gray-400 font-bold uppercase tracking-tight mb-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]/40" />
                                        <span>{noticia.autor.split(' ')[0]}</span>
                                    </div>
                                    <span>{format(new Date(noticia.creado_en), 'dd MMM yyyy', { locale: es })}</span>
                                </div>

                                {/* Acciones - Botones estilo Convocatorias */}
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setPreviewNoticia(noticia)}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white border border-gray-100 rounded-lg text-gray-600 hover:text-[#8B1E1E] hover:border-[#8B1E1E]/30 transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95"
                                    >
                                        <Eye className="w-3.5 h-3.5" />
                                        Vista
                                    </button>

                                    <Link
                                        href={`/administrador/noticias/${noticia.id}/editar`}
                                        className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-gray-700 hover:bg-[#8B1E1E] hover:text-white hover:border-[#8B1E1E] transition-all text-[11px] font-bold uppercase tracking-wider shadow-sm active:scale-95"
                                    >
                                        <Edit className="w-3.5 h-3.5" />
                                        Editar
                                    </Link>
                                </div>

                                <div className="mt-2">
                                    <DeleteNoticiaButton
                                        noticiaId={noticia.id}
                                        noticiaTitulo={noticia.titulo}
                                    />
                                </div>
                            </div>
                        </motion.article>
                    ))}
                </div>
            )}

            {/* List View */}
            {viewMode === 'list' && filteredNoticias.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Noticia
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Autor
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredNoticias.map((noticia) => (
                                    <tr key={noticia.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {noticia.imagenes.length > 0 ? (
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                                        <img
                                                            src={noticia.imagenes[0].url_imagen}
                                                            alt={noticia.titulo}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 border border-gray-100">
                                                        <ImageIcon className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-semibold text-slate-900 line-clamp-1">
                                                        {noticia.titulo}
                                                    </div>
                                                    <div className="text-sm text-slate-500 line-clamp-2">
                                                        {noticia.resumen}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900">{noticia.autor}</div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${noticia.publicada
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-[#8B1E1E]/5 text-[#8B1E1E]'
                                                }`}>
                                                {noticia.publicada ? 'Publicada' : 'Borrador'}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-900 font-medium">
                                                {format(new Date(noticia.creado_en), 'dd MMM yyyy', { locale: es })}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setPreviewNoticia(noticia)}
                                                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Vista previa"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>

                                                <Link
                                                    href={`/administrador/noticias/${noticia.id}/editar`}
                                                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Editar noticia"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Link>

                                                <DeleteNoticiaButton
                                                    noticiaId={noticia.id}
                                                    noticiaTitulo={noticia.titulo}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredNoticias.length === 0 && (
                <div className="text-center py-16">
                    <div className="max-w-md mx-auto">
                        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2">
                            {searchTerm || statusFilter !== 'all'
                                ? 'No hay noticias que coincidan con los filtros'
                                : 'No hay noticias registradas'}
                        </h3>
                        <p className="text-slate-600 mb-8">
                            {searchTerm || statusFilter !== 'all'
                                ? 'Intenta ajustar los filtros de búsqueda'
                                : 'Comienza creando tu primera noticia institucional'}
                        </p>

                        {!searchTerm && statusFilter === 'all' && (
                            <Link
                                href="/administrador/noticias/nueva"
                                className="inline-flex items-center gap-2 px-8 py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-bold shadow-lg shadow-[#8B1E1E]/20 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Crear primera noticia
                            </Link>
                        )}
                    </div>
                </div>
            )}

            {/* Modal de Vista Previa */}
            {previewNoticia && (
                <NoticiaPreviewModal
                    noticia={previewNoticia}
                    isOpen={!!previewNoticia}
                    onClose={() => setPreviewNoticia(null)}
                    onEdit={() => handleEditNoticia(previewNoticia)}
                />
            )}
        </div>
    );
}
