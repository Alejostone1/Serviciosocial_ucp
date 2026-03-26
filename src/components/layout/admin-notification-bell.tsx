'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Activity, User, Shield, Info, Clock, ExternalLink } from 'lucide-react';
import { getRecentLogs } from '@/app/administrador/actions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityLog {
    id: string;
    accion: string;
    descripcion: string | null;
    entidad: string | null;
    creado_en: string;
    usuario: string;
    rol: string;
}

export function AdminNotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    const fetchLogs = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getRecentLogs();
            setLogs(data);
            // Si hay nuevos logs desde la última vez que se abrió, marcar como unread
            // Por simplicidad, si recibimos logs, asumimos que podrían ser nuevos
            if (data.length > 0) {
                // Chequear si el log más reciente es posterior a la última revisión
                const lastCheck = localStorage.getItem('last_admin_log_check');
                if (lastCheck) {
                    const mostRecentDate = new Date(data[0].creado_en);
                    const lastCheckDate = new Date(lastCheck);
                    if (mostRecentDate > lastCheckDate) {
                        setHasUnread(true);
                    }
                } else {
                    setHasUnread(true);
                }
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLogs();
        // Poll every 3 minutes for new activity
        const interval = setInterval(fetchLogs, 1000 * 60 * 3);
        return () => clearInterval(interval);
    }, [fetchLogs]);

    const toggleOpen = () => {
        if (!isOpen) {
            setHasUnread(false);
            localStorage.setItem('last_admin_log_check', new Date().toISOString());
        }
        setIsOpen(!isOpen);
    };

    const getActionIcon = (accion: string) => {
        const a = accion.toUpperCase();
        if (a.includes('LOGIN') || a.includes('SESION')) return <User className="w-4 h-4 text-blue-500" />;
        if (a.includes('CREATE') || a.includes('CREAR')) return <Shield className="w-4 h-4 text-emerald-500" />;
        if (a.includes('DELETE') || a.includes('ELIMINAR')) return <Shield className="w-4 h-4 text-rose-500" />;
        if (a.includes('UPDATE') || a.includes('ACTUALIZAR')) return <Activity className="w-4 h-4 text-amber-500" />;
        return <Info className="w-4 h-4 text-slate-500" />;
    };

    const getActionText = (accion: string) => {
        return accion.replace(/_/g, ' ').toLowerCase();
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button 
                onClick={toggleOpen}
                className="relative p-2 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-full transition-colors focus:outline-none"
            >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ef4444] rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-[400px] bg-white rounded-2xl shadow-xl border border-[#e2e8f0] py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e2e8f0]">
                            <div>
                                <h3 className="font-bold text-[#1e293b]">Actividad del Sistema</h3>
                                <p className="text-xs text-[#64748b]">Últimos eventos globales registrados</p>
                            </div>
                            <button 
                                onClick={fetchLogs}
                                disabled={loading}
                                className="text-xs font-semibold text-[#8B1E1E] hover:underline disabled:opacity-50"
                            >
                                {loading ? 'Cargando...' : 'Refrescar'}
                            </button>
                        </div>

                        <div className="max-h-[450px] overflow-y-auto">
                            {logs.length === 0 && !loading ? (
                                <div className="p-8 text-center text-[#64748b]">
                                    <Activity className="w-10 h-10 mx-auto text-[#e2e8f0] mb-3" />
                                    <p className="text-sm">Sin actividad reciente registrada</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-[#f1f5f9]">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-4 hover:bg-[#f8fafc] transition-colors">
                                            <div className="flex items-start gap-3">
                                                <div className="bg-white border border-[#e2e8f0] p-2 rounded-lg mt-1 shrink-0">
                                                    {getActionIcon(log.accion)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider bg-red-50 px-1.5 py-0.5 rounded">
                                                            {getActionText(log.accion)}
                                                        </span>
                                                        <span className="text-[10px] text-[#94a3b8] flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {formatDistanceToNow(new Date(log.creado_en), { addSuffix: true, locale: es })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-semibold text-[#1e293b] mb-1 leading-tight">
                                                        {log.descripcion || `Actividad en ${log.entidad || 'el sistema'}`}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[11px] text-[#64748b]">
                                                            Por: <span className="font-bold text-[#475569]">{log.usuario}</span>
                                                        </span>
                                                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">
                                                            {log.rol}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] rounded-b-2xl">
                            <a 
                                href="/administrador/auditoria" 
                                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-[#64748b] hover:text-[#1e293b] transition-colors"
                            >
                                <ExternalLink className="w-3 h-3" />
                                Ver todos los registros de auditoría
                            </a>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
