'use client';

import React from 'react';
import { Menu, User, LogOut, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { NotificationBell } from '../ui/NotificationBell';

interface HeaderProps {
    onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = React.useState(false);
    const { data: session, status } = useSession();

    // Obtener datos reales del estudiante o usar fallback
    const userName = session?.user?.name || 'Estudiante';
    const userEmail = session?.user?.email || 'estudiante@ucp.edu.co';

    const handleLogout = () => {
        toast.message('¿Estás seguro de que quieres cerrar sesión?', {
            description: 'Tendrás que volver a ingresar tus credenciales.',
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

    // Generate basic breadcrumbs
    const pathSegments = pathname.split('/').filter(p => p);
    const breadcrumbs = pathSegments.map((segment: string, index: number) => {
        const title = segment.replace(/-/g, ' ');
        const isLast = index === pathSegments.length - 1;
        const href = `/${pathSegments.slice(0, index + 1).join('/')}`;
        return {
            title: title.charAt(0).toUpperCase() + title.slice(1),
            href,
            isLast
        };
    });

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 w-full">
            <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-full">

                {/* Left side: Mobile menu & Breadcrumbs */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 text-slate-500 hover:text-slate-900 focus:outline-none"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="hidden sm:flex items-center text-sm font-medium text-slate-500">
                        <Link href="/sistema/estudiante" className="hover:text-slate-900 transition-colors">
                            <Home className="w-4 h-4" />
                        </Link>
                        {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((crumb, idx) => (
                            <React.Fragment key={crumb.href}>
                                <ChevronRight className="w-4 h-4 mx-1 text-slate-300" />
                                <span className={crumb.isLast ? 'text-slate-900 font-semibold' : 'hover:text-slate-900 transition-colors'}>
                                    {crumb.title}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right side: Notifications & Profile */}
                <div className="flex items-center gap-4">
                    {/* Notifications Button */}
                    <NotificationBell />

                    {/* Divider */}
                    <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block"></div>

                    {/* User Menu */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-3 focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-[#8B1E1E]/10 flex items-center justify-center border border-[#8B1E1E]/20 text-[#8B1E1E]">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="hidden md:flex flex-col items-start leading-[1.1]">
                                <span className="text-sm font-bold text-slate-800 leading-none">{userName}</span>
                                <span className="text-xs text-slate-500 font-medium mt-0.5">{userEmail}</span>
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-3 border-b border-slate-100 mb-2 md:hidden">
                                    <p className="text-sm font-bold text-slate-900 leading-tight">{userName}</p>
                                    <p className="text-xs text-slate-500 font-medium truncate">{userEmail}</p>
                                </div>
                                <Link
                                    href="/sistema/estudiante/perfil"
                                    onClick={() => setShowUserMenu(false)}
                                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-[#8B1E1E]/5 hover:text-[#8B1E1E] transition-colors font-medium"
                                >
                                    <User className="w-4 h-4" />
                                    Mi Perfil
                                </Link>
                                <hr className="my-1 border-slate-100" />
                                <button 
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors font-medium"
                                >
                                    <LogOut className="w-4 h-4" />
                                    Cerrar Sesión
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>

    );
}
