'use client';

import React from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Menu, UserCircle, LogOut, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { AdminNotificationBell } from './admin-notification-bell';

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    const { data: session } = useSession();

    const handleSignOut = () => {
        toast.message('¿Estás seguro de que quieres cerrar sesión?', {
            description: 'Perderás el acceso al panel administrativo hasta que vuelvas a ingresar.',
            action: {
                label: 'Cerrar Sesión',
                onClick: () => {
                    signOut({ callbackUrl: '/' });
                },
            },
            cancel: {
                label: 'Cancelar',
                onClick: () => toast.dismiss(),
            },
        });
    };

    return (
        <header className="h-16 bg-white border-b border-[#e2e8f0] sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Mobile menu button */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 -ml-2 text-[#64748b] hover:text-[#1e293b] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <div className="hidden sm:flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#8B1E1E]" />
                    <span className="text-sm font-semibold text-[#1e293b]">Panel de Control Administrador</span>
                </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-5">
                {/* Campana de Notificaciones Funcional (logs del sistema) */}
                <AdminNotificationBell />

                <div className="w-px h-6 bg-[#e2e8f0]" />

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-bold text-[#1e293b] leading-tight">
                            {session?.user?.name || 'Administrador'}
                        </span>
                        <span className="text-[10px] font-semibold text-[#8B1E1E] uppercase tracking-wider">
                            {session?.user?.role || 'ADMINISTRADOR'}
                        </span>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#64748b]">
                        <UserCircle className="w-6 h-6" />
                    </div>
                </div>

                <button
                    onClick={handleSignOut}
                    className="p-2 ml-1 text-[#ef4444] hover:bg-[#fef2f2] rounded-lg transition-colors"
                    title="Cerrar sesión"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </header>
    );
}
