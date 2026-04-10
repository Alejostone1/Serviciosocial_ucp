'use client';

import React, { useState, useEffect } from 'react';
import { 
    Check,
    X,
    Loader2, 
    Calendar,
    ArrowRight,
    ArrowLeft,
    UserCheck,
    Edit3,
    History,
    ShieldCheck,
    Info,
    Search,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SolicitudesPerfilAdminPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [solicitudes, setSolicitudes] = useState<any[]>([]);
    const [procesando, setProcesando] = useState<string | null>(null);
    const [motivoRechazo, setMotivoRechazo] = useState("");
    const [showRechazoId, setShowRechazoId] = useState<string | null>(null);

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    const fetchSolicitudes = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/administrador/solicitudes-perfil');
            if (res.ok) {
                const data = await res.json();
                setSolicitudes(data.solicitudes || []);
            }
        } catch (error) {
            toast.error("Error al cargar solicitudes");
        } finally {
            setLoading(false);
        }
    };

    const handleProcesar = async (id: string, decision: 'APROBAR' | 'RECHAZAR') => {
        if (decision === 'RECHAZAR' && !motivoRechazo) {
            toast.error("Debes indicar un motivo para el rechazo institucional");
            return;
        }

        setProcesando(id);
        try {
            const res = await fetch(`/api/administrador/solicitudes-perfil/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ decision, motivo_rechazo: motivoRechazo })
            });

            if (res.ok) {
                toast.success(decision === 'APROBAR' ? "Cambio aprobado y aplicado" : "Solicitud rechazada");
                setSolicitudes(prev => prev.filter(s => s.id !== id));
                setShowRechazoId(null);
                setMotivoRechazo("");
            } else {
                throw new Error("Error en la operación");
            }
        } catch (error) {
            toast.error("No se pudo procesar la solicitud");
        } finally {
            setProcesando(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-stone-50">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-[#8B1E1E] animate-spin" />
                    <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Sincronizando registros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FDFCFB] p-8 md:p-12 space-y-12">
            
            {/* Header: Academic Style */}
            <div className="max-w-7xl mx-auto space-y-6">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] hover:text-[#8B1E1E] transition-colors group"
                >
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                    Regresar al Control Central
                </button>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-stone-200 pb-10">
                    <div className="space-y-2">
                        <p className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-[0.3em]">Validación de Identidad</p>
                        <h1 className="text-4xl font-medium text-stone-900 tracking-tight leading-none">
                            Solicitudes de <span className="italic font-serif">Perfil</span>
                        </h1>
                        <p className="text-stone-500 font-medium max-w-lg mt-4">
                            Gestión y aprobación institucional de modificaciones en datos personales y académicos de la comunidad estudiantil.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Pendientes</p>
                            <p className="text-2xl font-medium text-stone-900">{solicitudes.length} Registros</p>
                        </div>
                        <div className="h-12 w-[1px] bg-stone-200 hidden sm:block"></div>
                        <div className="p-4 bg-[#8B1E1E]/5 rounded-2xl border border-[#8B1E1E]/10">
                            <ShieldCheck className="w-6 h-6 text-[#8B1E1E]" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto">
                {solicitudes.length === 0 ? (
                    <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 border-2 border-dashed border-stone-100 rounded-[3rem] bg-white/50">
                        <div className="p-6 bg-white rounded-full shadow-sm">
                            <UserCheck className="w-10 h-10 text-stone-200" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-xl font-medium text-stone-800 tracking-tight">Sin solicitudes pendientes</h2>
                            <p className="text-sm text-stone-400 max-w-xs font-medium lowercase italic first-letter:uppercase">Todos los perfiles se encuentran sincronizados con la base de datos institucional.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                        {solicitudes.map((sol) => (
                            <div key={sol.id} className="bg-white border border-stone-200 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-stone-900/5 transition-all duration-500 flex flex-col overflow-hidden group">
                                
                                {/* Header Card */}
                                <div className="px-10 py-6 bg-stone-50/80 border-b border-stone-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-white border border-stone-200 rounded-xl">
                                            <Calendar className="w-4 h-4 text-stone-400" />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Fecha Registro</p>
                                            <p className="text-xs font-bold text-stone-800">{new Date(sol.creado_en).toLocaleString('es-CO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="px-4 py-1.5 bg-[#8B1E1E]/10 rounded-full border border-[#8B1E1E]/20 text-[9px] font-bold text-[#8B1E1E] uppercase tracking-widest">
                                        Requiere Validación
                                    </div>
                                </div>

                                <div className="p-10 flex-1 space-y-12">
                                    {/* Actor Info */}
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center font-medium text-lg border border-stone-200 uppercase">
                                            {sol.usuario.primer_nombre[0]}{sol.usuario.primer_apellido[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-xl font-medium text-stone-900 tracking-tight">
                                                {sol.usuario.primer_nombre} {sol.usuario.primer_apellido}
                                            </h3>
                                            <div className="flex items-center gap-3 text-stone-400 font-medium text-xs">
                                                <span className="flex items-center gap-1.5">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {sol.usuario.tipo_documento} {sol.usuario.numero_documento}
                                                </span>
                                                <span className="w-1 h-1 bg-stone-200 rounded-full"></span>
                                                <span className="flex items-center gap-1.5 lowercase first-letter:uppercase">
                                                    {sol.usuario.correo}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Change Matrix */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                                            <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Edit3 className="w-3 h-3" />
                                                Matriz de Modificaciones
                                            </h4>
                                        </div>
                                        
                                        <div className="space-y-3">
                                            {Object.keys(sol.datos_nuevos).map((key) => {
                                                const newVal = sol.datos_nuevos[key];
                                                const oldVal = sol.usuario[key];
                                                if (newVal === oldVal) return null;

                                                return (
                                                    <div key={key} className="grid grid-cols-2 bg-stone-50/40 rounded-2xl border border-stone-100/60 overflow-hidden hover:bg-stone-50 transition-colors">
                                                        <div className="p-5 border-r border-stone-100">
                                                            <p className="text-[8px] font-bold text-stone-300 uppercase tracking-widest mb-1">{key.replace('_', ' ')} Actual</p>
                                                            <p className="text-xs font-medium text-stone-500">{oldVal || '—'}</p>
                                                        </div>
                                                        <div className="p-5 pl-8 relative">
                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white border border-stone-200 flex items-center justify-center">
                                                                <ArrowRight className="w-2 h-2 text-stone-300" />
                                                            </div>
                                                            <p className="text-[8px] font-bold text-[#8B1E1E] uppercase tracking-widest mb-1">Nuevo Valor</p>
                                                            <p className="text-xs font-bold text-stone-900">{newVal || '—'}</p>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-4">
                                        {showRechazoId === sol.id ? (
                                            <div className="space-y-4 p-8 bg-stone-50 rounded-[2.5rem] border border-stone-200 animate-in fade-in zoom-in-95 duration-300">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-stone-500 uppercase tracking-widest ml-1">Observaciones del Rechazo</label>
                                                    <textarea
                                                        value={motivoRechazo}
                                                        onChange={(e) => setMotivoRechazo(e.target.value)}
                                                        placeholder="Describa el motivo institucional del rechazo..."
                                                        className="w-full bg-white border border-stone-200 rounded-2xl p-5 outline-none focus:ring-1 focus:ring-[#8B1E1E]/30 text-sm text-stone-800 min-h-[120px] shadow-inner"
                                                    />
                                                </div>
                                                <div className="flex gap-3">
                                                    <button 
                                                        onClick={() => handleProcesar(sol.id, 'RECHAZAR')}
                                                        disabled={procesando === sol.id}
                                                        className="flex-1 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-black transition-all disabled:opacity-50"
                                                    >
                                                        {procesando === sol.id ? 'Sincronizando...' : 'Confirmar Rechazo'}
                                                    </button>
                                                    <button 
                                                        onClick={() => setShowRechazoId(null)}
                                                        className="px-8 bg-white border border-stone-200 text-stone-500 text-[10px] font-bold uppercase tracking-widest py-4 rounded-xl hover:bg-stone-50 transition-all font-sans"
                                                    >
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-4">
                                                <button 
                                                    onClick={() => handleProcesar(sol.id, 'APROBAR')}
                                                    disabled={procesando === sol.id}
                                                    className="flex items-center justify-center gap-3 bg-[#8B1E1E] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-2xl hover:bg-[#721818] transition-all hover:shadow-xl hover:shadow-red-900/10 active:scale-[0.98] disabled:opacity-50"
                                                >
                                                    {procesando === sol.id ? <Loader2 className="w-4 h-4 animate-spin text-white/50" /> : <Check className="w-4 h-4" />}
                                                    {procesando === sol.id ? 'Aplicando...' : 'Aprobar Cambio'}
                                                </button>
                                                <button 
                                                    onClick={() => setShowRechazoId(sol.id)}
                                                    disabled={procesando === sol.id}
                                                    className="flex items-center justify-center gap-3 bg-white border border-stone-200 text-stone-400 text-[10px] font-bold uppercase tracking-[0.2em] py-5 rounded-2xl hover:border-stone-400 hover:text-stone-600 transition-all active:scale-[0.98] group"
                                                >
                                                    <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                                    Rechazar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Institutional Detail */}
            <div className="max-w-7xl mx-auto pt-20 pb-10 border-t border-stone-100 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
                <div className="flex items-center gap-4">
                    <ShieldCheck className="w-5 h-5 text-stone-400" />
                    <p className="text-[9px] font-bold uppercase tracking-widest text-stone-500">Sistema de Control Institucional v3.4 • UCP</p>
                </div>
                <div className="text-[9px] font-medium text-stone-400 italic font-serif">
    “Veritas in caritate”
</div>
            </div>
        </div>
    );
}
