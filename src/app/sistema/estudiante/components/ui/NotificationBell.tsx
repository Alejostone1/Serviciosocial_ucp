'use client';

import React, { useState, useEffect } from 'react';
import { Bell, FileText, CheckCircle, Clock, X } from 'lucide-react';
import Link from 'next/link';
import { useNotification, NotificationType } from '@/contexts/NotificationContext';

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const { notifications, unreadCount, markAsRead, clearAll } = useNotification();
    const hasUnread = unreadCount > 0;

    // Use effect to handle click outside could be added here later

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen && hasUnread) {
            markAsRead();
        }
    };

    const getIconColor = (type: string) => {
        switch (type) {
            case 'success': return 'text-emerald-500 bg-emerald-50';
            case 'info': return 'text-blue-500 bg-blue-50';
            default: return 'text-slate-500 bg-slate-100';
        }
    };

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={handleOpen}
                className="relative p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
                )}
            </button>

            {/* Dropdown Panel */}
            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Notificaciones</h3>
                            <span className="bg-indigo-50 text-indigo-600 text-xs font-semibold px-2 py-1 rounded-full">
                                {notifications.length} Nuevas
                            </span>
                        </div>

                        <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
                            {notifications.length === 0 ? (
                                <div className="p-6 text-center text-slate-500 flex flex-col items-center">
                                    <Bell className="w-8 h-8 text-slate-300 mb-2" />
                                    <p className="text-sm">No tienes notificaciones</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-slate-50">
                                    {notifications.map((notif) => {

                                        const getIcon = (type: NotificationType) => {
                                            switch (type) {
                                                case 'success': return CheckCircle;
                                                case 'info': return FileText;
                                                default: return Clock;
                                            }
                                        };
                                        const Icon = getIcon(notif.type);

                                        return (
                                            <Link
                                                key={notif.id}
                                                href={notif.href}
                                                onClick={() => setIsOpen(false)}
                                                className={`flex items-start gap-4 px-4 py-3 hover:bg-slate-50 transition-colors ${notif.unread ? 'bg-indigo-50/30' : ''}`}
                                            >
                                                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${getIconColor(notif.type)}`}>
                                                    <Icon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <p className={`text-sm tracking-tight mb-0.5 ${notif.unread ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                                                        {notif.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                                                        {notif.description}
                                                    </p>
                                                    <p className="text-[10px] text-slate-400 font-medium mt-1.5 uppercase tracking-wide">
                                                        {notif.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • Hace {
                                                            Math.floor((Date.now() - notif.date.getTime()) / (1000 * 60 * 60)) > 24
                                                                ? `${Math.floor((Date.now() - notif.date.getTime()) / (1000 * 60 * 60 * 24))} días`
                                                                : `${Math.floor((Date.now() - notif.date.getTime()) / (1000 * 60 * 60))} horas`
                                                        }
                                                    </p>
                                                </div>
                                                {notif.unread && (
                                                    <div className="w-2 h-2 bg-indigo-600 rounded-full shrink-0 self-center" />
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="p-2 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                            <button
                                onClick={() => clearAll()}
                                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                            >
                                Marcar todo como leido y limpiar
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
