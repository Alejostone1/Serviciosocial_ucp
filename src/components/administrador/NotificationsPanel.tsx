'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCircle, Clock, User, ExternalLink, X } from 'lucide-react';
import { useSession } from 'next-auth/react';

interface Notificacion {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  url_accion?: string;
  leida: boolean;
  leida_en?: string;
  creado_en: string;
}

export function NotificationsPanel() {
  const { data: session } = useSession();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [noLeidasCount, setNoLeidasCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cargar notificaciones - memoizado para evitar recreación en cada render
  const cargarNotificaciones = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch('/api/notificaciones');
      const data = await response.json();
      
      setNotificaciones(data.notificaciones || []);
      setNoLeidasCount(data.noLeidasCount || 0);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Marcar como leídas
  const marcarComoLeidas = async (ids: string[]) => {
    try {
      await fetch('/api/notificaciones', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, marcarComoLeida: true })
      });
      
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(notif => 
          ids.includes(notif.id) 
            ? { ...notif, leida: true, leida_en: new Date().toISOString() }
            : notif
        )
      );
      
      setNoLeidasCount(prev => Math.max(0, prev - ids.length));
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
    }
  };

  // Marcar todas como leídas
  const marcarTodasComoLeidas = async () => {
    try {
      await fetch('/api/notificaciones', { method: 'PATCH' });
      
      setNotificaciones(prev => 
        prev.map(notif => ({ ...notif, leida: true, leida_en: new Date().toISOString() }))
      );
      
      setNoLeidasCount(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    cargarNotificaciones();
    
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, [cargarNotificaciones]);

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'POSTULACION_RECIBIDA':
        return <User className="w-4 h-4" />;
      case 'POSTULACION_ACEPTADA':
        return <CheckCircle className="w-4 h-4 text-emerald-600" />;
      case 'POSTULACION_RECHAZADA':
        return <X className="w-4 h-4 text-red-600" />;
      case 'REPORTE_ENVIADO':
        return <Clock className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'POSTULACION_RECIBIDA':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'POSTULACION_ACEPTADA':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'POSTULACION_RECHAZADA':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'REPORTE_ENVIADO':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const formatearFecha = (fecha: string) => {
    const date = new Date(fecha);
    const ahora = new Date();
    const diffMs = ahora.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffMins < 1440) return `Hace ${Math.floor(diffMins / 60)} h`;
    return date.toLocaleDateString('es-ES');
  };

  return (
    <div className="relative">
      {/* Botón de notificaciones */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {noLeidasCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {noLeidasCount > 9 ? '9+' : noLeidasCount}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel */}
          <div className="absolute right-0 top-12 w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 max-h-96 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Notificaciones</h3>
              <div className="flex items-center gap-2">
                {noLeidasCount > 0 && (
                  <button
                    onClick={marcarTodasComoLeidas}
                    className="text-sm text-[#8B1E1E] hover:text-[#a32424] font-medium"
                  >
                    Marcar todas como leídas
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-slate-500">
                  Cargando notificaciones...
                </div>
              ) : notificaciones.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {notificaciones.map((notificacion) => (
                    <div
                      key={notificacion.id}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        !notificacion.leida ? 'bg-blue-50/50' : ''
                      }`}
                      onClick={() => {
                        if (!notificacion.leida) {
                          marcarComoLeidas([notificacion.id]);
                        }
                        if (notificacion.url_accion) {
                          window.location.href = notificacion.url_accion;
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg border ${getColorTipo(notificacion.tipo)}`}>
                          {getIcono(notificacion.tipo)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-slate-900 text-sm">
                              {notificacion.titulo}
                            </h4>
                            {!notificacion.leida && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-2 line-clamp-2">
                            {notificacion.mensaje}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-slate-500">
                              {formatearFecha(notificacion.creado_en)}
                            </span>
                            {notificacion.url_accion && (
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
