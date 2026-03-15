'use client';

import React, { useState, useEffect } from 'react';
import { 
    ChevronLeft, 
    Calendar, 
    Users, 
    Activity, 
    MapPin, 
    Clock, 
    Loader2,
    Building,
    FileText,
    ExternalLink,
    ArrowLeft,
    Inbox,
    Target
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getConvocatoriaByIdAuxiliar } from '../actions';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function DetalleConvocatoriaPage() {
    const params = useParams();
    const id = params.id as string;
    
    const [loading, setLoading] = useState(true);
    const [convocatoria, setConvocatoria] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'actividades' | 'postulaciones'>('info');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await getConvocatoriaByIdAuxiliar(id);
                if (!data) {
                    toast.error('La convocatoria no existe o no tiene permisos');
                    return;
                }
                setConvocatoria(data);
            } catch (error) {
                toast.error('Error de conexión con el servidor');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center">
                <div className="relative">
                    <div className="w-12 h-12 border-2 border-slate-100 border-t-[#8B1E1E] rounded-full animate-spin" />
                </div>
                <p className="mt-6 text-sm font-medium text-slate-400 tracking-tight">Sincronizando información institucional...</p>
            </div>
        );
    }

    if (!convocatoria) {
        return (
            <div className="max-w-md mx-auto py-20 text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900">Documento no encontrado</h2>
                <p className="text-slate-500 mt-2 text-sm leading-relaxed">No hemos podido localizar los detalles de esta convocatoria en la base de datos.</p>
                <Link href="/sistema/auxiliar/convocatorias" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#8B1E1E] hover:opacity-70 transition-opacity">
                    <ArrowLeft className="w-4 h-4" /> Volver al listado
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto pb-20 px-4 md:px-0">
            {/* Header Redefinido - Sin Negritas Excesivas */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-4">
                    <Link 
                        href="/sistema/auxiliar/convocatorias" 
                        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#8B1E1E] transition-colors uppercase tracking-wider"
                    >
                        <ChevronLeft className="w-4 h-4" /> Convocatorias
                    </Link>
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-semibold tracking-wide border",
                                convocatoria.estado === 'PUBLICADA' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                                {convocatoria.estado}
                            </span>
                            <span className="text-xs font-medium text-slate-300">REF: {convocatoria.id.split('-')[0].toUpperCase()}</span>
                        </div>
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight leading-tight">{convocatoria.titulo}</h1>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Publicado por</p>
                        <p className="text-sm font-medium text-slate-700">{convocatoria.publicador.primer_nombre} {convocatoria.publicador.primer_apellido}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 overflow-hidden shadow-sm">
                        <Users className="w-5 h-5 opacity-40" />
                    </div>
                </div>
            </div>

            {/* Grid de Contenido - Estilo Minimalista */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Columna Principal (8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Tabs de Navegación */}
                    <div className="bg-white border-b border-slate-100 flex gap-8">
                        <TabItem active={activeTab === 'info'} onClick={() => setActiveTab('info')} label="Detalle General" />
                        <TabItem active={activeTab === 'actividades'} onClick={() => setActiveTab('actividades')} label={`Actividades (${convocatoria.actividades.length})`} />
                        <TabItem active={activeTab === 'postulaciones'} onClick={() => setActiveTab('postulaciones')} label={`Postulaciones (${convocatoria.postulaciones.length})`} />
                    </div>

                    <div className="mt-4">
                        {activeTab === 'info' && <InfoSection convocatoria={convocatoria} />}
                        {activeTab === 'actividades' && <ActividadesSection actividades={convocatoria.actividades} />}
                        {activeTab === 'postulaciones' && <PostulacionesSection postulaciones={convocatoria.postulaciones} />}
                    </div>
                </div>

                {/* Columna Lateral (4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm space-y-8">
                        <div>
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Logística y Ubicación</h3>
                            <div className="space-y-5">
                                <InfoRow icon={MapPin} label="Ubicación" value={convocatoria.lugar || 'Sede Principal UCP'} />
                                <InfoRow icon={Building} label="Programa Académico" value={convocatoria.programa?.nombre} />
                                <InfoRow icon={Target} label="Modalidad" value={convocatoria.modalidad} />
                                <InfoRow icon={Clock} label="Horas de Servicio" value={`${convocatoria.horas_totales_ofrecidas || 0} horas crédito`} />
                            </div>
                        </div>

                        <div className="pt-8 border-t border-slate-50">
                            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-6">Cronograma Crítico</h3>
                            <div className="space-y-6">
                                <TimelineItem 
                                    label="Inicio de actividades" 
                                    date={new Date(convocatoria.fecha_inicio).toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}
                                    isActive 
                                />
                                <TimelineItem 
                                    label="Cierre de inscripciones" 
                                    date={convocatoria.fecha_cierre_postulacion ? new Date(convocatoria.fecha_cierre_postulacion).toLocaleDateString('es-CO', { day: '2-digit', month: 'long' }) : 'Sin definir'} 
                                />
                                <TimelineItem 
                                    label="Finalización estimada" 
                                    date={convocatoria.fecha_fin ? new Date(convocatoria.fecha_fin).toLocaleDateString('es-CO', { day: '2-digit', month: 'long' }) : 'Sujeto a cambios'} 
                                />
                            </div>
                        </div>
                    </div>

                    {convocatoria.url_convocatoria_externa && (
                        <a 
                            href={convocatoria.url_convocatoria_externa} 
                            target="_blank" 
                            className="bg-[#8B1E1E] px-8 py-4 rounded-xl text-white flex items-center justify-between group hover:shadow-xl hover:shadow-red-900/10 transition-all"
                        >
                            <span className="text-sm font-semibold">Ver convocatoria externa</span>
                            <ExternalLink className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

function TabItem({ active, onClick, label }: any) {
    return (
        <button 
            onClick={onClick}
            className={cn(
                "pb-4 text-xs font-semibold tracking-wide transition-all relative",
                active ? "text-[#8B1E1E]" : "text-slate-400 hover:text-slate-600"
            )}
        >
            {label}
            {active && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#8B1E1E] rounded-full" />}
        </button>
    );
}

function InfoRow({ icon: Icon, label, value }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                <Icon className="w-4 h-4 text-slate-400" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-medium text-slate-700 leading-snug">{value}</p>
            </div>
        </div>
    );
}

function TimelineItem({ label, date, isActive }: any) {
    return (
        <div className="flex gap-4 relative">
            <div className="flex flex-col items-center">
                <div className={cn("w-2.5 h-2.5 rounded-full border-2", isActive ? "bg-[#8B1E1E] border-[#8B1E1E]" : "bg-white border-slate-200")} />
                <div className="w-[1px] h-full bg-slate-100 absolute top-2.5" />
            </div>
            <div className="-mt-1 pb-6">
                <p className="text-[11px] font-bold text-slate-900 mb-0.5">{label}</p>
                <p className="text-[11px] font-medium text-slate-400">{date}</p>
            </div>
        </div>
    );
}

function InfoSection({ convocatoria }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="prose prose-slate max-w-none">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Alcance de la Convocatoria</h3>
                <div className="text-sm leading-relaxed text-slate-600 font-normal space-y-6">
                    <p className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 italic">&ldquo;{convocatoria.descripcion}&rdquo;</p>
                    
                    {convocatoria.objetivo && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B1E1E]">Objetivo Estratégico</h4>
                            <p className="pl-6 border-l-2 border-slate-100">{convocatoria.objetivo}</p>
                        </div>
                    )}

                    {convocatoria.competencias_requeridas?.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Perfil de Competencias</h4>
                            <div className="flex flex-wrap gap-2">
                                {convocatoria.competencias_requeridas.map((c: string, i: number) => (
                                    <span key={i} className="text-[11px] font-medium bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm text-slate-600">
                                        {c}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function ActividadesSection({ actividades }: any) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
            {actividades.map((act: any) => (
                <div key={act.id} className="p-6 bg-white rounded-2xl border border-slate-100 hover:border-slate-300 transition-all flex flex-col justify-between group">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-[#8B1E1E]/5 transition-colors">
                                <Activity className="w-4 h-4 text-slate-400 group-hover:text-[#8B1E1E]" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{act.tipo_actividad}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-slate-800 leading-tight">{act.nombre}</h4>
                        <p className="text-xs text-slate-500 font-normal leading-relaxed line-clamp-3">{act.descripcion || 'Sin descripción técnica disponible.'}</p>
                    </div>
                    <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                             <Clock className="w-3 h-3 text-slate-400" />
                             <span className="text-xs font-semibold text-slate-700 tracking-tight">{act.horas_estimadas}h <span className="text-slate-300 font-medium">asignadas</span></span>
                        </div>
                        <div className="text-[10px] font-medium text-slate-400">{act._count?.reportes || 0} registros</div>
                    </div>
                </div>
            ))}
            {actividades.length === 0 && <EmptyState icon={Activity} label="Sin actividades vinculadas" />}
        </div>
    );
}

function PostulacionesSection({ postulaciones }: any) {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-top-2 duration-500">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#FAFBFC] border-b border-slate-100">
                        <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                            <th className="px-8 py-5">Estudiante</th>
                            <th className="px-8 py-5">Código / ID</th>
                            <th className="px-8 py-5">Registro</th>
                            <th className="px-8 py-5">Nivel</th>
                            <th className="px-8 py-5 text-right">Vinculación</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {postulaciones.map((post: any) => (
                            <tr key={post.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-400">
                                            {post.estudiante.primer_nombre.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 leading-tight">{post.estudiante.primer_nombre} {post.estudiante.primer_apellido}</p>
                                            <p className="text-xs text-slate-400 font-normal">{post.estudiante.correo}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-xs font-semibold text-slate-600 tabular-nums">{post.estudiante.numero_documento}</td>
                                <td className="px-8 py-5 text-xs text-slate-400 font-medium">{new Date(post.postulado_en).toLocaleDateString()}</td>
                                <td className="px-8 py-5">
                                     <span className="text-[10px] font-semibold text-slate-400 italic">Pregrado</span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                     <span className={cn(
                                         "px-3 py-1 rounded-full text-[9px] font-bold tracking-widest",
                                         post.estado === 'ACEPTADA' ? "bg-emerald-50 text-emerald-600" :
                                         post.estado === 'PENDIENTE' ? "bg-amber-50 text-amber-600" :
                                         "bg-rose-50 text-rose-600"
                                     )}>
                                         {post.estado}
                                     </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {postulaciones.length === 0 && <div className="py-20 flex justify-center"><EmptyState icon={Users} label="No se han recibido postulaciones en este ciclo" /></div>}
        </div>
    );
}

function EmptyState({ icon: Icon, label }: any) {
    return (
        <div className="col-span-full py-16 flex flex-col items-center justify-center text-center">
            <Icon className="w-8 h-8 text-slate-200 mb-4" />
            <p className="text-sm font-medium text-slate-400">{label}</p>
        </div>
    );
}
