'use client';

import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, Clock, Users, BookOpen, X, ExternalLink } from 'lucide-react';
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

export function NotificationsDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Datos de ejemplo - en producción vendrían de la API
  useEffect(() => {
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
      }
    ];
    setNotifications(mockNotifications);
  }, []);

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

  const getIcon = (type: string) => {
    switch (type) {
      case 'postulacion':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'horas':
        return <Clock className="w-4 h-4 text-amber-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
    }
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
        aria-label="Notificaciones"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#8B1E1E] rounded-full ring-2 ring-white"></span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de notificaciones */}
          <div className="absolute right-0 mt-2 w-96 max-h-[480px] bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-100 z-50 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#8B1E1E]" />
                <h3 className="text-sm font-semibold text-slate-900">Notificaciones</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-[#1E3A8A] text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-[#8B1E1E] hover:text-[#A02424] transition-colors px-2 py-1"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto max-h-[380px]">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={cn(
                        "p-4 hover:bg-slate-50 transition-colors cursor-pointer",
                        !notification.read && "bg-blue-50/30"
                      )}
                      onClick={() => {
                        markAsRead(notification.id);
                        if (notification.link) {
                          setIsOpen(false);
                          // Redirección se manejaría con router si es necesario
                        }
                      }}
                    >
                      <div className="flex gap-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                          !notification.read && "bg-white"
                        )}>
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-slate-900 truncate">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]" />
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">
                              {notification.time}
                            </span>
                            {notification.link && (
                              <Link
                                href={notification.link}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                  setIsOpen(false);
                                }}
                                className="flex items-center gap-1 text-[10px] font-medium text-[#8B1E1E] hover:text-[#A02424] transition-colors"
                              >
                                Ver
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-5 h-5 text-slate-300" />
                  </div>
                  <p className="text-sm font-medium text-slate-600">No tienes notificaciones</p>
                  <p className="text-xs text-slate-400 mt-1">Las notificaciones aparecerán aquí</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <Link
                  href="/sistema/aliado/notificaciones"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2 text-xs font-medium text-[#8B1E1E] hover:text-[#A02424] transition-colors rounded-lg hover:bg-white"
                >
                  <BookOpen className="w-3 h-3" />
                  Ver todas las notificaciones
                </Link>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
