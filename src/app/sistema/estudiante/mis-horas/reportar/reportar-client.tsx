'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
    Clock, Upload, FileText, Calendar, MapPin,
    AlertCircle, CheckCircle2, Loader2, X, File,
    ChevronRight, ArrowLeft, Activity, Layers,
    Target, Search, BookOpen
} from 'lucide-react';
import { crearReporteHoras, getActividadesDisponibles, getReportesRecientes, getActividadesConvocatoriasPasadas } from './actions';

// ─── Schema de validación ─────────────────────────────────────────────────────
const reporteSchema = z.object({
    id_actividad: z.string().min(1, 'Selecciona una actividad'),
    horas_reportadas: z.number()
        .min(0.5, 'Mínimo 0.5 horas')
        .max(12, 'Máximo 12 horas por reporte'),
    descripcion_trabajo: z.string()
        .min(10, 'Mínimo 10 caracteres')
        .max(1000, 'Máximo 1000 caracteres'),
    fecha_actividad: z.string().optional(),
    notas_estudiante: z.string().max(300, 'Máximo 300 caracteres').optional(),
});
type ReporteForm = z.infer<typeof reporteSchema>;

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface Actividad {
    id: string;
    nombre: string;
    descripcion: string;
    tipo_actividad: string;
    horas_estimadas: number;
    horas_maximas: number | null;
    fecha_inicio: string | null;
    fecha_limite: string | null;
    ubicacion: string | null;
    id_convocatoria: string;
    convocatoria: {
        id: string;
        titulo: string;
        descripcion: string;
        modalidad: string;
        lugar: string | null;
        categoria: { id: string; nombre: string; color_hex: string | null } | null;
        estado?: string;
        fecha_cierre_postulacion?: string | null;
    };
}

interface ActividadPasada extends Actividad {
    horas_reportadas_total: number;
    reportes: {
        id: string;
        horas_reportadas: number;
        estado: string;
        reportado_en: string;
    }[];
}

interface ReporteReciente {
    id: string;
    horas_reportadas: number;
    descripcion_trabajo: string | null;
    estado: string;
    reportado_en: string;
    actividad: { nombre: string; };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const TIPO_LABELS: Record<string, string> = {
    GENERAL: 'General', CAPACITACION: 'Capacitación', CAMPO: 'Campo',
    ADMINISTRATIVA: 'Administrativa', INVESTIGACION: 'Investigación', COMUNITARIA: 'Comunitaria'
};
const MODAL_LABELS: Record<string, string> = {
    PRESENCIAL: 'Presencial', VIRTUAL: 'Virtual', HIBRIDA: 'Híbrida'
};
const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    APROBADO:             { label: 'Aprobado',    color: 'bg-emerald-100 text-emerald-700' },
    REPORTADO:            { label: 'En revisión', color: 'bg-amber-100 text-amber-700' },
    VALIDADO_AUXILIAR:    { label: 'Validado',    color: 'bg-blue-100 text-blue-700' },
    RECHAZADO:            { label: 'Rechazado',   color: 'bg-rose-100 text-rose-700' },
    PENDIENTE_VALIDACION: { label: 'Pendiente',   color: 'bg-slate-100 text-slate-600' },
};

// ─── Componente Principal ─────────────────────────────────────────────────────
export default function ReportarHorasClient() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [actividadesDisponibles, setActividadesDisponibles] = useState<Actividad[]>([]);
    const [reportesRecientes, setReportesRecientes] = useState<ReporteReciente[]>([]);
    const [actividadSeleccionada, setActividadSeleccionada] = useState<Actividad | null>(null);
    const [busquedaActividad, setBusquedaActividad] = useState('');
    const [archivos, setArchivos] = useState<File[]>([]);
    const [paso, setPaso] = useState<1 | 2>(1);
    const [actividadesPasadas, setActividadesPasadas] = useState<ActividadPasada[]>([]);
    const [tabActivo, setTabActivo] = useState<'activas' | 'pasadas'>('activas');

    const {
        register, handleSubmit, formState: { errors },
        watch, setValue, reset
    } = useForm<ReporteForm>({
        resolver: zodResolver(reporteSchema),
        defaultValues: { horas_reportadas: 1, descripcion_trabajo: '', notas_estudiante: '' }
    });

    const watchedDesc = watch('descripcion_trabajo') || '';
    const watchedNotas = watch('notas_estudiante') || '';
    const watchedHoras = watch('horas_reportadas') || 0;

    // ─── Carga inicial ────────────────────────────────────────────────────────
    useEffect(() => {
        const cargar = async () => {
            try {
                const [acts, reps, actsPasadas] = await Promise.all([
                    getActividadesDisponibles(),
                    getReportesRecientes(),
                    getActividadesConvocatoriasPasadas()
                ]);

                setActividadesDisponibles(acts.map(a => ({
                    ...a,
                    descripcion: a.descripcion || '',
                    horas_estimadas: Number(a.horas_estimadas),
                    horas_maximas: a.horas_maximas ? Number(a.horas_maximas) : null,
                    fecha_inicio: a.fecha_inicio?.toString() || null,
                    fecha_limite: a.fecha_limite?.toString() || null,
                    convocatoria: {
                        ...a.convocatoria,
                        modalidad: a.convocatoria.modalidad.toString(),
                    }
                })) as unknown as Actividad[]);

                setActividadesPasadas(actsPasadas);
                setReportesRecientes(reps.map(r => ({
                    ...r,
                    horas_reportadas: Number(r.horas_reportadas),
                    reportado_en: r.reportado_en.toString(),
                })));
            } catch (e) {
                toast.error('Error al cargar actividades');
            } finally {
                setLoading(false);
            }
        };
        cargar();
    }, []);

    // ─── Actividades filtradas ────────────────────────────────────────────────
    const actividadesFiltradas = actividadesDisponibles.filter(a =>
        a.nombre.toLowerCase().includes(busquedaActividad.toLowerCase()) ||
        a.convocatoria.titulo.toLowerCase().includes(busquedaActividad.toLowerCase())
    );

    // ─── Seleccionar actividad ────────────────────────────────────────────────
    const seleccionarActividad = (a: Actividad) => {
        setActividadSeleccionada(a);
        setValue('id_actividad', a.id);
        setValue('horas_reportadas', Math.min(a.horas_estimadas, 8));
        setPaso(2);
    };

    // ─── Archivos ─────────────────────────────────────────────────────────────
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const valid = files.filter(f => {
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(f.type)) {
                toast.error(`"${f.name}" no es PDF/JPG/PNG`); return false;
            }
            if (f.size > 5 * 1024 * 1024) {
                toast.error(`"${f.name}" supera 5 MB`); return false;
            }
            return true;
        });
        setArchivos(prev => [...prev, ...valid]);
        e.target.value = '';
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const onSubmit = async (data: ReporteForm) => {
        if (!actividadSeleccionada) { toast.error('Selecciona una actividad'); return; }
        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append('id_actividad', data.id_actividad);
            fd.append('horas_reportadas', data.horas_reportadas.toString());
            fd.append('descripcion_trabajo', data.descripcion_trabajo);
            if (data.notas_estudiante) fd.append('notas_estudiante', data.notas_estudiante);
            if (data.fecha_actividad) fd.append('fecha_actividad', data.fecha_actividad);
            archivos.forEach(f => fd.append('archivos', f));

            const res = await crearReporteHoras(fd);
            if (res.success) {
                toast.success('¡Reporte enviado correctamente!');
                reset(); setArchivos([]); setActividadSeleccionada(null); setPaso(1);
                setTimeout(() => router.push('/sistema/estudiante/mis-horas'), 1500);
            }
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Error al enviar el reporte');
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32">
                <div className="w-10 h-10 border-2 border-[#8B1E1E]/20 border-t-[#8B1E1E] rounded-full animate-spin mb-4" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando actividades...</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20 px-4 lg:px-0 animate-in fade-in duration-500">

            {/* ── Header ── */}
            <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${paso >= 1 ? 'bg-[#8B1E1E] text-white' : 'bg-slate-100 text-slate-400'}`}>1</span>
                        <span className={paso >= 1 ? 'text-[#8B1E1E]' : ''}>Actividad</span>
                        <ChevronRight className="w-3 h-3 text-slate-200" />
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${paso === 2 ? 'bg-[#8B1E1E] text-white' : 'bg-slate-100 text-slate-400'}`}>2</span>
                        <span className={paso === 2 ? 'text-[#8B1E1E]' : ''}>Detalles del Reporte</span>
                    </div>
                    <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
                        {paso === 1 ? 'Selecciona una actividad' : 'Completa el reporte'}
                    </h1>
                    <p className="text-sm text-slate-500 font-medium">
                        {paso === 1
                            ? 'Elige la actividad que realizaste para registrar tus horas.'
                            : `Actividad: ${actividadSeleccionada?.nombre}`
                        }
                    </p>
                </div>
                <Link
                    href="/sistema/estudiante/mis-horas"
                    className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-700 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Mis Horas
                </Link>
            </div>

            {/* ─────────── PASO 1: Seleccionar Actividad ─────────── */}
            {paso === 1 && (
                <div className="space-y-4">
                    {/* Tabs para cambiar entre activas y pasadas */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setTabActivo('activas')}
                            className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-all ${
                                tabActivo === 'activas'
                                    ? 'bg-[#8B1E1E] text-white shadow-lg shadow-red-900/10'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Convocatorias Activas
                            <span className="ml-2 text-xs font-bold opacity-70">({actividadesDisponibles.length})</span>
                        </button>
                        <button
                            onClick={() => setTabActivo('pasadas')}
                            className={`flex-1 h-12 rounded-xl text-sm font-semibold transition-all ${
                                tabActivo === 'pasadas'
                                    ? 'bg-slate-800 text-white shadow-lg'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            Convocatorias Pasadas
                            <span className="ml-2 text-xs font-bold opacity-70">({actividadesPasadas.length})</span>
                        </button>
                    </div>

                    {/* Buscador */}
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                        <input
                            placeholder={`Buscar en ${tabActivo === 'activas' ? 'convocatorias activas' : 'convocatorias pasadas'}...`}
                            value={busquedaActividad}
                            onChange={e => setBusquedaActividad(e.target.value)}
                            className="w-full h-12 bg-white border border-slate-200 rounded-2xl pl-11 pr-4 text-sm font-medium focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none"
                        />
                    </div>

                    {/* Contenido según tab activo */}
                    {tabActivo === 'activas' ? (
                        // Actividades de convocatorias activas
                        actividadesFiltradas.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <BookOpen className="w-8 h-8 text-slate-200 mb-3" />
                                <p className="text-sm font-semibold text-slate-400">No hay actividades disponibles</p>
                                <p className="text-xs text-slate-300 mt-1">Verifica que estés postulado a una convocatoria activa</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(
                                    actividadesFiltradas.reduce<Record<string, Actividad[]>>((acc, a) => {
                                        const titulo = a.convocatoria.titulo;
                                        if (!acc[titulo]) acc[titulo] = [];
                                        acc[titulo].push(a);
                                        return acc;
                                    }, {})
                                ).map(([titulo, acts]) => (
                                    <div key={titulo} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-[#8B1E1E]" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                                                {titulo}
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {acts.map(a => (
                                                <button
                                                    key={a.id}
                                                    onClick={() => seleccionarActividad(a)}
                                                    className="w-full flex items-start gap-5 px-6 py-5 text-left hover:bg-slate-50/70 transition-colors group"
                                                >
                                                    <div className="mt-0.5 shrink-0 w-9 h-9 bg-[#8B1E1E]/5 border border-[#8B1E1E]/10 rounded-xl flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-[#8B1E1E]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-800 group-hover:text-[#8B1E1E] transition-colors">
                                                            {a.nombre}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {TIPO_LABELS[a.tipo_actividad] || a.tipo_actividad}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest">
                                                                {a.horas_estimadas}h estimadas
                                                            </span>
                                                            {a.ubicacion && (
                                                                <span className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                                                                    <MapPin className="w-2.5 h-2.5" />
                                                                    {a.ubicacion}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {a.descripcion && (
                                                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{a.descripcion}</p>
                                                        )}
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 mt-1 group-hover:text-[#8B1E1E] group-hover:translate-x-0.5 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    ) : (
                        // Actividades de convocatorias pasadas
                        actividadesPasadas.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-dashed border-slate-200">
                                <BookOpen className="w-8 h-8 text-slate-200 mb-3" />
                                <p className="text-sm font-semibold text-slate-400">No hay actividades de convocatorias pasadas</p>
                                <p className="text-xs text-slate-300 mt-1">Aún no participaste en convocatorias finalizadas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {Object.entries(
                                    actividadesPasadas.reduce<Record<string, ActividadPasada[]>>((acc, a) => {
                                        const titulo = a.convocatoria.titulo;
                                        if (!acc[titulo]) acc[titulo] = [];
                                        acc[titulo].push(a);
                                        return acc;
                                    }, {})
                                ).map(([titulo, acts]) => (
                                    <div key={titulo} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                                            <div className="w-2 h-2 rounded-full bg-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                                                {titulo}
                                            </span>
                                            <span className="ml-auto text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                                                FINALIZADA
                                            </span>
                                        </div>
                                        <div className="divide-y divide-slate-50">
                                            {acts.map(a => (
                                                <div key={a.id} className="w-full flex items-start gap-5 px-6 py-5">
                                                    <div className="mt-0.5 shrink-0 w-9 h-9 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center">
                                                        <Activity className="w-4 h-4 text-slate-500" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {a.nombre}
                                                        </p>
                                                        <div className="flex flex-wrap items-center gap-3 mt-1.5">
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {TIPO_LABELS[a.tipo_actividad] || a.tipo_actividad}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
                                                                {a.horas_reportadas_total}h reportadas
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                {a.horas_estimadas}h estimadas
                                                            </span>
                                                        </div>
                                                        {a.descripcion && (
                                                            <p className="text-xs text-slate-400 mt-1.5 line-clamp-1">{a.descripcion}</p>
                                                        )}
                                                        {/* Lista de reportes de esta actividad */}
                                                        {a.reportes.length > 0 && (
                                                            <div className="mt-3 space-y-1.5">
                                                                {a.reportes.slice(0, 3).map(r => {
                                                                    const cfg = ESTADO_CONFIG[r.estado] || { label: r.estado, color: 'bg-slate-100 text-slate-600' };
                                                                    return (
                                                                        <div key={r.id} className="flex items-center gap-2 text-[10px]">
                                                                            <span className={`px-1.5 py-0.5 rounded font-medium ${cfg.color}`}>
                                                                                {cfg.label}
                                                                            </span>
                                                                            <span className="text-slate-400">{r.horas_reportadas}h</span>
                                                                            <span className="text-slate-300">·</span>
                                                                            <span className="text-slate-400">{new Date(r.reportado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            )}

            {/* ─────────── PASO 2: Formulario ─────────── */}
            {paso === 2 && actividadSeleccionada && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
                    
                    {/* Columna principal */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Card info actividad */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5 flex items-start gap-4">
                            <div className="shrink-0 w-10 h-10 bg-[#8B1E1E]/5 border border-[#8B1E1E]/10 rounded-xl flex items-center justify-center">
                                <Activity className="w-5 h-5 text-[#8B1E1E]" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800">{actividadSeleccionada.nombre}</p>
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest truncate">
                                    {actividadSeleccionada.convocatoria.titulo}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-2">
                                    <span className="text-[10px] font-bold text-[#8B1E1E] bg-[#8B1E1E]/8 px-2.5 py-1 rounded-full">
                                        {actividadSeleccionada.horas_estimadas}h estimadas
                                    </span>
                                    {actividadSeleccionada.ubicacion && (
                                        <span className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
                                            <MapPin className="w-2.5 h-2.5" />
                                            {actividadSeleccionada.ubicacion}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => { setPaso(1); setActividadSeleccionada(null); }}
                                className="text-slate-300 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-50"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Formulario */}
                        <form id="reporte-form" onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-2xl border border-slate-100 p-6 space-y-5">
                            
                            {/* Horas + Fecha (grid 2 col) */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock className="w-3 h-3" /> Horas Realizadas *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="12"
                                        {...register('horas_reportadas', { valueAsNumber: true })}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-semibold focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none"
                                        disabled={submitting}
                                    />
                                    {errors.horas_reportadas && (
                                        <p className="text-[10px] text-rose-500 font-bold">{errors.horas_reportadas.message}</p>
                                    )}
                                    <p className="text-[10px] text-slate-400">
                                        Estimadas: <span className="font-bold text-[#8B1E1E]">{actividadSeleccionada.horas_estimadas}h</span>
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar className="w-3 h-3" /> Fecha de Actividad
                                    </label>
                                    <input
                                        type="date"
                                        max={new Date().toISOString().split('T')[0]}
                                        {...register('fecha_actividad')}
                                        className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none"
                                        disabled={submitting}
                                    />
                                </div>
                            </div>

                            {/* Descripción */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3 h-3" /> Descripción del trabajo realizado *
                                </label>
                                <textarea
                                    rows={5}
                                    {...register('descripcion_trabajo')}
                                    placeholder="Describe con detalle qué hiciste, cómo contribuiste y qué aprendiste durante esta actividad..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none resize-none"
                                    disabled={submitting}
                                />
                                <div className="flex justify-between">
                                    {errors.descripcion_trabajo
                                        ? <p className="text-[10px] text-rose-500 font-bold">{errors.descripcion_trabajo.message}</p>
                                        : <span />
                                    }
                                    <p className="text-[10px] text-slate-300 font-medium tabular-nums">{watchedDesc.length}/1000</p>
                                </div>
                            </div>

                            {/* Archivos */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Upload className="w-3 h-3" /> Evidencias (Opcional)
                                </label>
                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#8B1E1E]/30 transition-colors">
                                    <input
                                        type="file" id="evidencias" multiple
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleFileChange}
                                        className="hidden" disabled={submitting}
                                    />
                                    <label htmlFor="evidencias" className="cursor-pointer">
                                        <Upload className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs font-semibold text-slate-500">Arrastra o selecciona archivos</p>
                                        <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG — Máximo 5 MB por archivo</p>
                                    </label>
                                </div>
                                {archivos.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        {archivos.map((f, i) => (
                                            <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                                                <div className="flex items-center gap-3">
                                                    <File className="w-4 h-4 text-[#8B1E1E]" />
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">{f.name}</p>
                                                        <p className="text-[10px] text-slate-400">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setArchivos(p => p.filter((_, j) => j !== i))}
                                                    className="text-slate-300 hover:text-rose-500 transition-colors">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Notas */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Notas Adicionales (Opcional)
                                </label>
                                <textarea
                                    rows={2}
                                    {...register('notas_estudiante')}
                                    placeholder="Observaciones, comentarios o contexto adicional para el revisor..."
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all outline-none resize-none"
                                    disabled={submitting}
                                />
                                <p className="text-right text-[10px] text-slate-300 tabular-nums">{watchedNotas.length}/300</p>
                            </div>
                        </form>

                        {/* Botones fijos */}
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => { setPaso(1); setActividadSeleccionada(null); }}
                                className="h-12 px-6 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                            >
                                Cambiar Actividad
                            </button>
                            <button
                                form="reporte-form"
                                type="submit"
                                disabled={submitting}
                                className="flex-1 h-12 bg-[#8B1E1E] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#a32424] transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {submitting
                                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Enviando...</>
                                    : <><CheckCircle2 className="w-4 h-4" /> Enviar Reporte</>
                                }
                            </button>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="space-y-4">
                        {/* Contador horas */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Target className="w-3 h-3" /> Horas a Reportar
                            </p>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-5xl font-black text-[#8B1E1E] tabular-nums leading-none">
                                    {watchedHoras || 0}
                                </span>
                                <span className="text-lg font-bold text-slate-300">hrs</span>
                            </div>
                            <div className="mt-3 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-[#8B1E1E] rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min((watchedHoras / (actividadSeleccionada.horas_estimadas || 8)) * 100, 100)}%` }}
                                />
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                                Meta: <span className="font-bold">{actividadSeleccionada.horas_estimadas}h</span>
                            </p>
                        </div>

                        {/* Checklist */}
                        <div className="bg-white rounded-2xl border border-slate-100 p-5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Layers className="w-3 h-3" /> Lista de Verificación
                            </p>
                            <div className="space-y-3">
                                {[
                                    { label: 'Actividad seleccionada', done: true },
                                    { label: 'Horas definidas', done: watchedHoras > 0 },
                                    { label: 'Descripción completa', done: watchedDesc.length >= 10 },
                                    { label: 'Evidencia adjunta', done: archivos.length > 0, optional: true },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${item.done ? 'bg-emerald-500' : 'bg-slate-100'}`}>
                                            {item.done && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <p className={`text-xs font-medium transition-colors ${item.done ? 'text-slate-700' : 'text-slate-400'}`}>
                                            {item.label}
                                            {item.optional && <span className="text-slate-300 ml-1">(opcional)</span>}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reportes recientes */}
                        {reportesRecientes.length > 0 && (
                            <div className="bg-white rounded-2xl border border-slate-100 p-5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Recientes (7 días)
                                </p>
                                <div className="space-y-3">
                                    {reportesRecientes.slice(0, 4).map(r => {
                                        const cfg = ESTADO_CONFIG[r.estado] || { label: r.estado, color: 'bg-slate-100 text-slate-600' };
                                        return (
                                            <div key={r.id} className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-xs font-semibold text-slate-700 truncate">{r.actividad.nombre}</p>
                                                    <p className="text-[10px] text-slate-400">{r.horas_reportadas}h · {new Date(r.reportado_en).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</p>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${cfg.color}`}>
                                                    {cfg.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
