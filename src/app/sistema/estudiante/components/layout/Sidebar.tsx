'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Calendar,
    CheckSquare,
    Activity,
    Clock,
    Award,
    User,
    Menu,
    X
} from 'lucide-react';
import clsx from 'clsx';
import { UCPLogo } from '@/components/ui/UCPLogo';
import { twMerge } from 'tailwind-merge';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const menuItems = [
    { title: 'Dashboard', href: '/sistema/estudiante', icon: LayoutDashboard },
    { title: 'Convocatorias', href: '/sistema/estudiante/convocatorias', icon: Calendar },
    { title: 'Mis Postulaciones', href: '/sistema/estudiante/mis-postulaciones', icon: CheckSquare },
    { title: 'Mis Actividades', href: '/sistema/estudiante/mis-actividades', icon: Activity },
    { title: 'Mis Horas', href: '/sistema/estudiante/mis-horas', icon: Clock },
    { title: 'Mis Certificados', href: '/sistema/estudiante/certificados', icon: Award },
    { title: 'Perfil', href: '/sistema/estudiante/perfil', icon: User },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === '/sistema/estudiante') return pathname === href;
        return pathname.startsWith(href);
    };

    const cn = (...inputs: (string | undefined | null | false)[]) => {
        return twMerge(clsx(inputs));
    };

    return (
        <>
            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Content */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex-shrink-0",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {/* Logo Area */}
                <div className="h-16 flex items-center px-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                        <UCPLogo variant="round" size={36} />
                        <span className="font-semibold text-slate-900 text-base tracking-tight">Servicio Social</span>
                    </div>
                    {/* Close button inside sidebar on mobile */}
                    <button
                        className="ml-auto lg:hidden text-slate-500 hover:text-slate-900"
                        onClick={() => setIsOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                    <div className="px-2 mb-2">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Menú Principal</p>
                    </div>
                    {menuItems.map((item) => {
                        const active = isActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                    active
                                        ? "bg-[#8B1E1E]/8 text-[#8B1E1E] font-semibold shadow-sm"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <item.icon
                                    className={cn(
                                        "w-5 h-5 transition-colors",
                                        active ? "text-[#8B1E1E]" : "text-slate-400 group-hover:text-slate-600"
                                    )}
                                />
                                {item.title}
                            </Link>
                        );
                    })}
                </div>
            </aside>
        </>
    );
}
