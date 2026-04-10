'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Clock, Info, CheckCircle2, AlertCircle, ExternalLink, X, Settings } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

interface Notification {
    id: string;
    tipo: string;
    titulo: string;
    mensaje: string;
    url_accion: string | null;
    leida: boolean;
    creado_en: string;
}

export function AdminNotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/notificaciones');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notificaciones || []);
                setUnreadCount(data.noLeidasCount || 0);
            }
        } catch (error) {
            console.error('Error fetching admin notifications:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 1000 * 60 * 2); // Polling every 2 mins
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const markAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            const res = await fetch('/api/notificaciones', { method: 'PATCH' });
            if (res.ok) {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, leida: true })));
            }
        } catch (err) {}
    };

    const toggleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            markAsRead();
        }
    };

    const getIcon = (tipo: string) => {
        switch (tipo) {
            case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
            case 'error': return <X className="w-4 h-4 text-rose-500" />;
            case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
            default: return <Info className="w-4 h-4 text-blue-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon with Academic Pulse */}
            <button 
                onClick={toggleOpen}
                className="relative p-2.5 text-stone-400 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/5 rounded-xl transition-all duration-300 group"
            >
                <Bell className={unreadCount > 0 ? "w-5 h-5 animate-none" : "w-5 h-5"} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#8B1E1E] rounded-full border-2 border-white animate-pulse" />
                )}
            </button>

            {/* Dropdown Panel - Institutional UX */}
            {isOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-[2rem] shadow-2xl border border-stone-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        
                        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-50">
                            <div>
                                <h3 className="text-sm font-bold text-stone-900 tracking-tight">Centro de Gestión</h3>
                                <p className="text-[10px] font-medium text-stone-400 uppercase tracking-widest">Avisos y Alertas Pendientes</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest uppercase ${unreadCount > 0 ? 'bg-[#8B1E1E] text-white' : 'bg-stone-100 text-stone-400'}`}>
                                    {unreadCount} Nuevas
                                </span>
                            </div>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-stone-100">
                            {loading && notifications.length === 0 ? (
                                <div className="p-12 text-center">
                                    <Clock className="w-8 h-8 text-stone-100 animate-spin mx-auto mb-2" />
                                    <p className="text-xs font-medium text-stone-300">Sincronizando...</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="p-12 text-center space-y-4">
                                    <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto border border-stone-100">
                                        <Bell className="w-6 h-6 text-stone-200" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-stone-400">Sin notificaciones nuevas</p>
                                        <p className="text-[10px] text-stone-300 lowercase italic">Todos los procesos están al día.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-stone-50">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id}
                                            className={`p-5 transition-all duration-300 group/item ${notif.leida ? 'opacity-60 grayscale-[0.5]' : 'bg-[#8B1E1E]/[0.02]'}`}
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white border border-stone-100 rounded-xl shadow-sm shrink-0 group-hover/item:border-[#8B1E1E]/20">
                                                    {getIcon(notif.tipo)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1.5">
                                                        <h4 className="text-[11px] font-bold text-stone-900 tracking-tight line-clamp-1">{notif.titulo}</h4>
                                                        <span className="text-[9px] font-medium text-stone-400 flex items-center gap-1 whitespace-nowrap">
                                                            {formatDistanceToNow(new Date(notif.creado_en), { addSuffix: true, locale: es })}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-stone-500 font-medium leading-relaxed mb-3 line-clamp-2">
                                                        {notif.mensaje}
                                                    </p>
                                                    {notif.url_accion && (
                                                        <Link 
                                                            href={notif.url_accion}
                                                            onClick={() => setIsOpen(false)}
                                                            className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#8B1E1E] uppercase tracking-wider hover:underline"
                                                        >
                                                            Atender ahora
                                                            <ExternalLink className="w-2.5 h-2.5" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-stone-50 bg-stone-50/50 flex items-center justify-between">
                            <Link 
                                href="/administrador/notificaciones"
                                onClick={() => setIsOpen(false)}
                                className="text-[9px] font-bold text-stone-400 uppercase tracking-widest hover:text-[#8B1E1E] transition-colors"
                            >
                                Ver historial completo
                            </Link>
                            <Settings className="w-3.5 h-3.5 text-stone-300 hover:text-stone-500 cursor-pointer" />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
