'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePostulacionesEstudiante } from '@/hooks/use-postulaciones';
import Link from 'next/link';
import {
    Search, RefreshCw, Clock, CheckCircle2, XCircle,
    AlertCircle, ArrowLeft, FileSearch, ChevronRight,
    Calendar, ExternalLink, Loader2, Compass
} from 'lucide-react';

// ─── Configuración de estados ──────────────────────────────────────────────────
const ESTADO_CONFIG: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    PENDIENTE:   { label: 'Pendiente',   dot: 'bg-amber-400',   text: 'text-amber-700',  bg: 'bg-amber-50' },
    EN_REVISION: { label: 'En revisión', dot: 'bg-blue-400',    text: 'text-blue-700',   bg: 'bg-blue-50' },
    ACEPTADA:    { label: 'Aceptada',    dot: 'bg-emerald-500', text: 'text-emerald-700',bg: 'bg-emerald-50' },
    RECHAZADA:   { label: 'Rechazada',   dot: 'bg-rose-500',    text: 'text-rose-700',   bg: 'bg-rose-50' },
    RETIRADA:    { label: 'Retirada',    dot: 'bg-slate-400',   text: 'text-slate-500',  bg: 'bg-slate-50' },
};

const FILTROS = [
    { value: 'todas',      label: 'Todas' },
    { value: 'PENDIENTE',  label: 'Pendiente' },
    { value: 'EN_REVISION',label: 'En revisión' },
    { value: 'ACEPTADA',   label: 'Aceptada' },
    { value: 'RECHAZADA',  label: 'Rechazada' },
];

export default function MisPostulacionesPage() {
    const { user } = useAuth();
    const { postulaciones, cargando, error, recargar } = usePostulacionesEstudiante(user?.id || '');

    const [filtroEstado, setFiltroEstado] = useState('todas');
    const [busqueda, setBusqueda] = useState('');

    const filtradas = (postulaciones as any[]).filter((p) => {
        const coincideEstado = filtroEstado === 'todas' || p.estado === filtroEstado;
        const q = busqueda.toLowerCase();
        const coincideBusqueda = !busqueda ||
            p.convocatoria?.titulo?.toLowerCase().includes(q) ||
            p.convocatoria?.descripcion?.toLowerCase().includes(q);
        return coincideEstado && coincideBusqueda;
    });

    // ─── Contadores para el resumen ──────────────────────────────────────────
    const counts = (postulaciones as any[]).reduce<Record<string, number>>((acc, p) => {
        acc[p.estado] = (acc[p.estado] || 0) + 1;
        return acc;
    }, {});

    // ─── Error ───────────────────────────────────────────────────────────────
    if (error) {
        return (
            <div className="max-w-5xl mx-auto px-4 lg:px-0 py-20 flex flex-col items-center justify-center animate-in fade-in duration-500">
                <XCircle className="w-10 h-10 text-rose-400 mb-4" />
                <h2 className="text-lg font-semibold text-slate-800 mb-1">Error al cargar postulaciones</h2>
                <p className="text-sm text-slate-500 mb-6">{error}</p>
                <button
                    onClick={recargar}
                    className="h-10 px-6 bg-[#8B1E1E] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#a32424] transition-all"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-7 pb-20 px-4 lg:px-0 animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
                <div className="space-y-0.5">
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Mis Postulaciones</h1>
                    <p className="text-sm text-slate-500 font-medium">
                        Seguimiento de tus solicitudes a convocatorias de servicio social.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/sistema/estudiante/convocatorias"
                        className="h-10 px-5 bg-[#8B1E1E] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#a32424] transition-all shadow-lg shadow-red-900/10 flex items-center gap-2"
                    >
                        <Compass className="w-3.5 h-3.5" />
                        Explorar
                    </Link>
                    <button
                        onClick={recargar}
                        disabled={cargando}
                        className="h-10 w-10 flex items-center justify-center border border-slate-200 bg-white rounded-xl text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-all"
                    >
                        {cargando
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <RefreshCw className="w-4 h-4" />
                        }
                    </button>
                </div>
            </div>

            {/* ── Resumen por estado (pills) ── */}
            {(postulaciones as any[]).length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {FILTROS.map(f => {
                        const count = f.value === 'todas'
                            ? (postulaciones as any[]).length
                            : (counts[f.value] || 0);
                        if (f.value !== 'todas' && count === 0) return null;
                        const active = filtroEstado === f.value;
                        return (
                            <button
                                key={f.value}
                                onClick={() => setFiltroEstado(f.value)}
                                className={`h-8 px-4 rounded-full text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 ${
                                    active
                                        ? 'bg-[#8B1E1E] text-white shadow-md shadow-red-900/10'
                                        : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                                }`}
                            >
                                {f.value !== 'todas' && (
                                    <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_CONFIG[f.value]?.dot || 'bg-slate-300'}`} />
                                )}
                                {f.label}
                                <span className={`text-[10px] font-black tabular-nums ${active ? 'text-white/70' : 'text-slate-400'}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* ── Buscador ── */}
            {(postulaciones as any[]).length > 0 && (
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input
                        placeholder="Buscar por título de convocatoria..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none"
                    />
                    {busqueda && (
                        <button
                            onClick={() => setBusqueda('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                            <XCircle className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* ── Contenido ── */}
            {cargando && (postulaciones as any[]).length === 0 ? (
                <div className="py-24 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 border-2 border-[#8B1E1E]/20 border-t-[#8B1E1E] rounded-full animate-spin mb-4" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Cargando postulaciones...</p>
                </div>

            ) : (postulaciones as any[]).length === 0 ? (
                /* Estado vacío — sin ninguna postulación */
                <div className="py-24 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-5">
                        <FileSearch className="w-6 h-6 text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-1.5">Sin postulaciones todavía</h3>
                    <p className="text-sm text-slate-400 font-medium max-w-xs mb-7">
                        Explora las convocatorias activas y envía tu primera solicitud.
                    </p>
                    <Link
                        href="/sistema/estudiante/convocatorias"
                        className="h-11 px-7 bg-[#8B1E1E] text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-[#a32424] transition-all shadow-lg shadow-red-900/10 flex items-center gap-2"
                    >
                        <Compass className="w-3.5 h-3.5" />
                        Explorar Convocatorias
                    </Link>
                </div>

            ) : filtradas.length === 0 ? (
                /* Sin resultados para el filtro */
                <div className="py-16 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                    <Search className="w-7 h-7 text-slate-200 mb-3" />
                    <p className="text-sm font-semibold text-slate-400">Sin resultados para &ldquo;{busqueda || filtroEstado}&rdquo;</p>
                    <button
                        onClick={() => { setBusqueda(''); setFiltroEstado('todas'); }}
                        className="mt-5 text-[11px] font-bold uppercase tracking-widest text-[#8B1E1E] hover:text-[#a32424] transition-colors"
                    >
                        Limpiar filtros
                    </button>
                </div>

            ) : (
                /* Lista de postulaciones */
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-50">
                    {filtradas.map((post: any, idx: number) => {
                        const cfg = ESTADO_CONFIG[post.estado] || ESTADO_CONFIG['PENDIENTE'];
                        const fecha = new Date(post.postulado_en).toLocaleDateString('es-ES', {
                            day: '2-digit', month: 'short', year: 'numeric'
                        });
                        return (
                            <div key={post.id} className="flex items-start gap-5 px-6 py-5 hover:bg-slate-50/60 transition-colors group">
                                
                                {/* Número de orden */}
                                <div className="shrink-0 w-7 h-7 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mt-0.5">
                                    <span className="text-[10px] font-black text-slate-400 tabular-nums">{idx + 1}</span>
                                </div>

                                {/* Contenido */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 group-hover:text-[#8B1E1E] transition-colors leading-tight line-clamp-1">
                                        {post.convocatoria?.titulo || '—'}
                                    </p>
                                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                            <Calendar className="w-2.5 h-2.5" />
                                            {fecha}
                                        </span>
                                        {post.convocatoria?.modalidad && (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                                {post.convocatoria.modalidad === 'PRESENCIAL' ? 'Presencial'
                                                    : post.convocatoria.modalidad === 'VIRTUAL' ? 'Virtual'
                                                    : 'Híbrida'}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Estado */}
                                <div className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full ${cfg.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>
                                        {cfg.label}
                                    </span>
                                </div>

                                {/* Acción */}
                                <Link
                                    href="/sistema/estudiante/convocatorias"
                                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-slate-300 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 transition-all"
                                    title="Ver convocatoria"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Footer con link a convocatorias si hay postulaciones ── */}
            {(postulaciones as any[]).length > 0 && (
                <div className="flex justify-center pt-2">
                    <Link
                        href="/sistema/estudiante/convocatorias"
                        className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#8B1E1E] transition-colors"
                    >
                        <Compass className="w-3.5 h-3.5" />
                        Ver todas las convocatorias disponibles
                        <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
            )}
        </div>
    );
}
