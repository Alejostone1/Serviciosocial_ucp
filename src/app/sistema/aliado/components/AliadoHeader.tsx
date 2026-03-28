'use client';

import React from 'react';
import { Bell, Search, User, LogOut, ChevronDown, Settings, Menu } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AliadoHeaderProps {
    onMenuToggle?: () => void;
}

export function AliadoHeader({ onMenuToggle }: AliadoHeaderProps) {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  const handleLogout = () => {
    toast.message('¿Cerrar sesión?', {
      description: 'Se cerrará tu acceso al panel de aliado.',
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
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <input
                        type="text"
                        placeholder="Buscar estudiante o reporte..."
                        className="w-full pl-12 pr-4 h-11 bg-slate-50 border-transparent rounded-xl focus:bg-white focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/10 outline-none transition-all text-sm font-medium text-slate-600 placeholder:text-slate-400"
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
            <button className="relative p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-[#1E3A8A] rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-8 w-px bg-slate-100 mx-1 md:mx-2"></div>

            {/* User Profile Trigger */}
            <div className="relative">
                <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-3 pl-2 md:pl-3 pr-1.5 py-1.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800 leading-none mb-1">
                            {session?.user?.name?.split(' ')[0] || 'Aliado'}
                        </p>
                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                            Entidad Aliada
                        </p>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs font-semibold shadow-sm overflow-hidden">
                         <User className="w-4 h-4 opacity-50" />
                    </div>
                    <ChevronDown className={cn(`w-4 h-4 text-slate-300 transition-transform duration-300 hidden sm:block`, showUserMenu ? 'rotate-180' : '')} />
                </button>
                
                {/* Dropdown Menu */}
                {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-60 rounded-2xl bg-white p-2 shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-3 py-2 leading-none mb-2">
                             <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Cuenta de Aliado</p>
                             <p className="text-xs text-slate-500 mt-1 truncate">{session?.user?.email}</p>
                        </div>
                        <Link href="/sistema/aliado/perfil" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors font-medium">
                            <User className="h-4 w-4" /> Perfil de Usuario
                        </Link>
                        <Link href="/sistema/aliado/configuracion" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-colors font-medium">
                            <Settings className="h-4 w-4" /> Preferencias
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
