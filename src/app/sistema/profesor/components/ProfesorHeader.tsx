'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, User, LogOut, ChevronDown, Settings, Menu, Check, CheckCheck, Mail } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  getNotificacionesProfesor, 
  marcarComoLeidaProfesor, 
  marcarTodasComoLeidasProfesor,
  getConteoNotificacionesNoLeidasProfesor 
} from '../notificaciones-actions';

interface ProfesorHeaderProps {
    onMenuToggle?: () => void;
}

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  url_accion: string | null;
  leida: boolean;
  creado_en: Date;
};

export function ProfesorHeader({ onMenuToggle }: ProfesorHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar notificaciones
  const cargarNotificaciones = async () => {
    try {
      const [notifs, conteo] = await Promise.all([
        getNotificacionesProfesor(),
        getConteoNotificacionesNoLeidasProfesor()
      ]);
      setNotificaciones(notifs);
      setConteoNoLeidas(conteo);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    }
  };

  // Cargar al montar y cada 30 segundos
  useEffect(() => {
    cargarNotificaciones();
    const interval = setInterval(cargarNotificaciones, 30000);
    return () => clearInterval(interval);
  }, []);

  const marcarLeida = async (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await marcarComoLeidaProfesor(id);
      await cargarNotificaciones();
      toast.success('Notificación marcada como leída');
    } catch (error) {
      toast.error('Error al marcar notificación');
    }
  };

  const marcarTodasLeidas = async () => {
    try {
      await marcarTodasComoLeidasProfesor();
      await cargarNotificaciones();
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      toast.error('Error al marcar notificaciones');
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'POSTULACION': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'REPORTE': return <Check className="w-4 h-4 text-green-500" />;
      case 'SISTEMA': return <Bell className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'POSTULACION': return 'bg-blue-50 border-blue-100';
      case 'REPORTE': return 'bg-green-50 border-green-100';
      case 'SISTEMA': return 'bg-purple-50 border-purple-100';
      default: return 'bg-slate-50 border-slate-100';
    }
  };

  const handleLogout = () => {
    toast.message('¿Cerrar sesión?', {
      description: 'Tendrás que volver a ingresar para gestionar tus proyectos.',
      action: {
        label: 'Cerrar Sesión',
        onClick: () => signOut({ callbackUrl: '/' }),
      },
      cancel: {
        label: 'Cancelar',
        onClick: () => toast.dismiss(),
      },
      duration: 5000,
    });
  };

  return (
    <header className="h-20 border-b border-slate-100 bg-white/70 backdrop-blur-xl sticky top-0 z-40 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
            {/* Mobile Menu Toggle */}
            <button 
                onClick={onMenuToggle}
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-50 rounded-xl transition-all"
                aria-label="Abrir menú"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar - Hidden on mobile */}
            <div className="flex-1 max-w-md hidden md:block">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input
                        type="text"
                        placeholder="Búsqueda rápida..."
                        className="w-full pl-12 pr-4 h-11 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/10 outline-none transition-all text-sm font-medium text-slate-600 placeholder:text-slate-400"
                    />
                </div>
            </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 md:gap-4">
            {/* Mobile Search Button icon */}
            <button className="md:hidden p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                <Search className="h-5 w-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative" ref={notifRef}>
              <button 
                  onClick={() => setShowNotifMenu(!showNotifMenu)}
                  className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all"
              >
                  <Bell className="h-5 w-5" />
                  {conteoNoLeidas > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-5 w-5 bg-[#8B1E1E] text-white text-[10px] font-bold flex items-center justify-center rounded-full ring-2 ring-white">
                      {conteoNoLeidas > 9 ? '9+' : conteoNoLeidas}
                    </span>
                  )}
              </button>

              {/* Notification Dropdown */}
              {showNotifMenu && (
                <div className="absolute right-0 mt-3 w-96 rounded-2xl bg-white shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-200 z-50">
                  <div className="p-4 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-800">Notificaciones</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {conteoNoLeidas} sin leer
                        </p>
                      </div>
                      {conteoNoLeidas > 0 && (
                        <button
                          onClick={marcarTodasLeidas}
                          className="text-xs text-[#8B1E1E] hover:text-[#6B1515] font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#8B1E1E]/5 transition-colors"
                        >
                          <CheckCheck className="w-3 h-3" />
                          Marcar todas
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto">
                    {notificaciones.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Bell className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-sm text-slate-500">No tienes notificaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {notificaciones.map((notif) => (
                          <div 
                            key={notif.id}
                            className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${getTipoColor(notif.tipo)}`}
                            onClick={() => {
                              if (notif.url_accion) {
                                window.location.href = notif.url_accion;
                              }
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getTipoIcon(notif.tipo)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 line-clamp-1">
                                  {notif.titulo}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                                  {notif.mensaje}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {formatDistanceToNow(new Date(notif.creado_en), { 
                                    addSuffix: true, 
                                    locale: es 
                                  })}
                                </p>
                              </div>
                              <button
                                onClick={(e) => marcarLeida(notif.id, e)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/10 rounded-lg transition-all"
                                title="Marcar como leída"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                    <Link 
                      href="/sistema/profesor/notificaciones"
                      onClick={() => setShowNotifMenu(false)}
                      className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 hover:text-[#8B1E1E] transition-colors"
                    >
                      Ver todas las notificaciones
                      <ChevronDown className="w-3 h-3 -rotate-90" />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-px bg-slate-100 mx-1 md:mx-2"></div>

            {/* User Profile Trigger */}
            <div className="relative">
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 md:pl-3 pr-1.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 leading-none mb-1">
                            {session?.user?.name?.split(' ')[0] || 'Profesor'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                            Docente
                        </p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-[#8B1E1E] flex items-center justify-center text-white text-sm font-bold shadow-md shadow-[#8B1E1E]/10">
                        {session?.user?.name?.charAt(0) || 'P'}
                    </div>
                    <ChevronDown className={cn(`w-4 h-4 text-slate-300 transition-transform duration-300 hidden sm:block`, showUserMenu ? 'rotate-180' : '')} />
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white p-2 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 leading-none mb-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mi Perfil</p>
                             <p className="text-xs text-slate-500 mt-1 truncate">{session?.user?.email}</p>
                        </div>
                        <Link href="/sistema/profesor/perfil" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors font-medium">
                            <User className="h-4 w-4" /> Perfil Personal
                        </Link>
                        <Link href="/sistema/profesor/configuracion" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors font-medium">
                            <Settings className="h-4 w-4" /> Ajustes
                        </Link>
                        <div className="h-px bg-slate-50 my-2 px-2"></div>
                        <button 
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                        >
                            <LogOut className="h-4 w-4" /> Cerrar Sesión
                        </button>
                    </div>
                )}
            </div>
        </div>
    </header>
  );
}
