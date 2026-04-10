'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Users, BookOpen, Check, Trash2, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'postulacion' | 'horas' | 'sistema';
  title: string;
  message: string;
  time: string;
  read: boolean;
  link?: string;
}

export default function AliadoNotificacionesPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    // Datos de ejemplo - en producción vendrían de la API
    const mockNotifications: Notification[] = [
      {
        id: '1',
        type: 'postulacion',
        title: 'Nueva Postulación',
        message: 'Juan Pérez ha aplicado a tu convocatoria "Servicio Comunitario"',
        time: 'Hace 5 minutos',
        read: false,
        link: '/sistema/aliado/postulaciones'
      },
      {
        id: '2',
        type: 'horas',
        title: 'Horas por Validar',
        message: 'Tienes 3 reportes de horas pendientes de revisión',
        time: 'Hace 1 hora',
        read: false,
        link: '/sistema/aliado/validacion'
      },
      {
        id: '3',
        type: 'sistema',
        title: 'Actualización del Sistema',
        message: 'Nuevas funcionalidades disponibles en el panel',
        time: 'Hace 2 días',
        read: true
      },
      {
        id: '4',
        type: 'postulacion',
        title: 'Postulación Aceptada',
        message: 'María González ha sido aceptada en tu proyecto',
        time: 'Hace 3 días',
        read: true,
        link: '/sistema/aliado/postulaciones'
      },
      {
        id: '5',
        type: 'horas',
        title: 'Reporte Validado',
        message: 'El reporte de horas de Carlos Rodríguez ha sido validado',
        time: 'Hace 1 semana',
        read: true,
        link: '/sistema/aliado/validacion'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'read') return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'postulacion':
        return <Users className="w-5 h-5 text-blue-600" />;
      case 'horas':
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]" />
          <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Centro de Notificaciones</span>
        </div>
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Notificaciones</h1>
          <p className="text-slate-500 font-medium">
            Mantente informado sobre las actividades importantes de tu panel.
          </p>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <div className="flex gap-1 bg-slate-50 rounded-lg p-1">
            <button
              onClick={() => setFilter('all')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filter === 'unread' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              No leídas ({unreadCount})
            </button>
            <button
              onClick={() => setFilter('read')}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filter === 'read' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              Leídas
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 text-xs font-medium text-[#8B1E1E] hover:text-[#A02424] transition-colors rounded-lg hover:bg-[#8B1E1E]/5"
            >
              <Check className="w-3 h-3" />
              Marcar todas como leídas
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 hover:text-rose-700 transition-colors rounded-lg hover:bg-rose-50"
            >
              <Trash2 className="w-3 h-3" />
              Limpiar todas
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                "bg-white rounded-2xl border border-slate-100 p-4 shadow-sm hover:shadow-md transition-all duration-300",
                !notification.read && "bg-blue-50/30 border-blue-100/50"
              )}
            >
              <div className="flex gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                  !notification.read ? "bg-white border border-blue-100" : "bg-slate-50 border border-slate-100"
                )}>
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-slate-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400">
                          {notification.time}
                        </span>
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
                            >
                              <Check className="w-3 h-3" />
                              Marcar como leída
                            </button>
                          )}
                          {notification.link && (
                            <Link
                              href={notification.link}
                              className="flex items-center gap-1 text-xs font-medium text-[#1E3A8A] hover:text-[#2563EB] transition-colors"
                            >
                              Ver detalles
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.read && (
                        <span className="w-2 h-2 bg-[#8B1E1E] rounded-full"></span>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            {filter === 'unread' ? 'No hay notificaciones no leídas' : 
             filter === 'read' ? 'No hay notificaciones leídas' : 
             'No tienes notificaciones'}
          </h3>
          <p className="text-slate-500 font-medium">
            {filter === 'unread' ? 'Todas tus notificaciones han sido leídas' :
             filter === 'read' ? 'No tienes notificaciones leídas aún' :
             'Las notificaciones aparecerán aquí cuando haya actividad importante'}
          </p>
        </div>
      )}
    </div>
  );
}
