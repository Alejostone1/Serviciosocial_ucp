'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, Eye, Calendar, Filter, Grid, List, FileText, Image as ImageIcon, MoreVertical, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DeleteNoticiaButton } from './delete-noticia-button';

interface Noticia {
    id: string;
    titulo: string;
    resumen: string;
    autor: string;
    publicada: boolean;
    creado_en: string;
    imagenes: Array<{
        id: string;
        url_imagen: string;
        orden: number;
    }>;
}

interface NewsAdminDashboardProps {
    noticias: Noticia[];
}

export function NewsAdminDashboard({ noticias }: NewsAdminDashboardProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');

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

    return (
        <div className="space-y-8">
            {/* Header con estadísticas */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-8 text-white">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Gestión de Noticias</h1>
                        <p className="text-slate-300 text-lg">Administra el contenido informativo institucional</p>
                    </div>
                    
                    <Link
                        href="/administrador/noticias/nueva"
                        className="inline-flex items-center gap-3 px-6 py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-semibold shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Noticia
                    </Link>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Total de Noticias</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
                            </div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Publicadas</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.published}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-slate-300 text-sm">Borradores</p>
                                <p className="text-3xl font-bold text-white mt-1">{stats.draft}</p>
                            </div>
                            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                <FileText className="w-6 h-6 text-amber-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filtros y búsqueda */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por título, resumen o autor..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all"
                        />
                    </div>
                    
                    {/* Filtro de estado */}
                    <div className="relative">
                        <select 
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="appearance-none pl-4 pr-10 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all bg-white font-medium"
                        >
                            <option value="all">Todas las noticias</option>
                            <option value="published">Publicadas</option>
                            <option value="draft">Borradores</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Vista modes */}
                    <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'grid' 
                                    ? 'bg-white text-[#8B1E1E] shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Grid className="w-4 h-4" />
                            Grid
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all ${
                                viewMode === 'list' 
                                    ? 'bg-white text-[#8B1E1E] shadow-sm' 
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <List className="w-4 h-4" />
                            Lista
                        </button>
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
                    {filteredNoticias.map((noticia) => (
                        <article key={noticia.id} className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                            {/* Imagen */}
                            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-[#8B1E1E] to-[#C0392B]">
                                {noticia.imagenes.length > 0 ? (
                                    <Image
                                        src={noticia.imagenes[0].url_imagen}
                                        alt={noticia.titulo}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon className="w-12 h-12 text-white/50" />
                                    </div>
                                )}
                                
                                {/* Badge de estado */}
                                <div className="absolute top-3 right-3">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                                        noticia.publicada 
                                            ? 'bg-green-500/90 text-white' 
                                            : 'bg-amber-500/90 text-white'
                                    }`}>
                                        {noticia.publicada ? 'Publicada' : 'Borrador'}
                                    </span>
                                </div>
                            </div>

                            {/* Contenido */}
                            <div className="p-5">
                                <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-[#8B1E1E] transition-colors">
                                    {noticia.titulo}
                                </h3>
                                
                                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                    {noticia.resumen}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                                    <span>{noticia.autor}</span>
                                    <span>{format(new Date(noticia.creado_en), 'dd MMM yyyy', { locale: es })}</span>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                    <Link
                                        href={`/administrador/noticias/${noticia.id}/vista-previa`}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium"
                                    >
                                        <Eye className="w-4 h-4" />
                                        Ver
                                    </Link>
                                    
                                    <Link
                                        href={`/administrador/noticias/${noticia.id}/editar`}
                                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all text-sm font-medium"
                                    >
                                        <Edit className="w-4 h-4" />
                                        Editar
                                    </Link>
                                    
                                    <DeleteNoticiaButton
                                        noticiaId={noticia.id}
                                        noticiaTitulo={noticia.titulo}
                                    />
                                </div>
                            </div>
                        </article>
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
                                                    <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                                        <Image
                                                            src={noticia.imagenes[0].url_imagen}
                                                            alt={noticia.titulo}
                                                            width={64}
                                                            height={64}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-[#8B1E1E] to-[#C0392B] flex items-center justify-center flex-shrink-0">
                                                        <ImageIcon className="w-6 h-6 text-white/50" />
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
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                                noticia.publicada 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-amber-100 text-amber-800'
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
                                                <Link
                                                    href={`/administrador/noticias/${noticia.id}/vista-previa`}
                                                    className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition-all"
                                                    title="Ver noticia"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                                
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
                                className="inline-flex items-center gap-2 px-6 py-3 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#731919] transition-all font-semibold"
                            >
                                <Plus className="w-5 h-5" />
                                Crear primera noticia
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
