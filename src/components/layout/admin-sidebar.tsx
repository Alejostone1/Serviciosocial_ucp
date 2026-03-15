'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UCPLogo } from '@/components/ui/UCPLogo';
import {
    LayoutDashboard,
    Users,
    Building2,
    GraduationCap,
    Briefcase,
    BookOpen,
    ClipboardList,
    CalendarDays,
    Clock,
    Award,
    Link as LinkIcon,
    Bell,
    ShieldCheck,
    ChevronLeft,
    ChevronRight,
    Menu,
    Newspaper,
} from 'lucide-react';

const ADMIN_MENU_ITEMS = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/administrador' },
    { label: 'Usuarios', icon: Users, href: '/administrador/usuarios' },
    { label: 'Facultades', icon: Building2, href: '/administrador/facultades' },
    { label: 'Programas', icon: GraduationCap, href: '/administrador/programas' },
    { label: 'Categorías', icon: Briefcase, href: '/administrador/categorias' },
    { label: 'Convocatorias', icon: BookOpen, href: '/administrador/convocatorias' },
    { label: 'Postulaciones', icon: ClipboardList, href: '/administrador/postulaciones' },
    { label: 'Actividades', icon: CalendarDays, href: '/administrador/actividades' },
    { label: 'Reportes Horas', icon: Clock, href: '/administrador/reportes' },
    { label: 'Certificados', icon: Award, href: '/administrador/certificados' },
    { label: 'Vinculaciones', icon: LinkIcon, href: '/administrador/vinculaciones' },
    { label: 'Noticias', icon: Newspaper, href: '/administrador/noticias' },
    { label: 'Notificaciones', icon: Bell, href: '/administrador/notificaciones' },
    { label: 'Auditoría', icon: ShieldCheck, href: '/administrador/auditoria' },
];

interface AdminSidebarProps {
    isMobileOpen: boolean;
    setMobileOpen: (open: boolean) => void;
}

export function AdminSidebar({ isMobileOpen, setMobileOpen }: AdminSidebarProps) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => setIsCollapsed(!isCollapsed);

    const renderNavItems = () => {
        return ADMIN_MENU_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${isActive
                        ? 'bg-[#8B1E1E] text-white font-medium shadow-sm'
                        : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e293b]'
                        }`}
                    title={isCollapsed ? item.label : undefined}
                >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#8B1E1E]'}`} />
                    {!isCollapsed && (
                        <span className="text-sm truncate">{item.label}</span>
                    )}
                </Link>
            );
        });
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Desktop & Mobile */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-[#e2e8f0] shadow-sm transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                    } ${isCollapsed ? 'lg:w-[80px]' : 'w-[260px]'}`}
            >
                {/* Branding */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-[#e2e8f0]">
                    <div className={`flex items-center gap-3 overflow-hidden ${isCollapsed ? 'justify-center w-full' : ''}`}>
                        {/* Logo redondo cuando está colapsado, wide cuando expandido */}
                        {isCollapsed ? (
                            <UCPLogo variant="round" size={36} />
                        ) : (
                            <>
                                <UCPLogo variant="round" size={36} />
                                <div className="flex flex-col truncate">
                                    <span className="text-sm font-bold text-[#1e293b] leading-tight">Servicio Social</span>
                                    <span className="text-[10px] text-[#64748b] tracking-wider uppercase font-semibold">Administrador</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Desktop Collapse Toggle (floating button) */}
                <button
                    onClick={toggleCollapse}
                    className="hidden lg:flex absolute -right-3.5 top-[76px] w-7 h-7 bg-white border border-[#e2e8f0] rounded-full items-center justify-center text-[#64748b] hover:text-[#8B1E1E] hover:border-[#8B1E1E] shadow-sm transition-colors z-10"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1">
                    {renderNavItems()}
                </nav>

                {/* Footer Area */}
                <div className="p-4 border-t border-[#e2e8f0]">
                    {!isCollapsed ? (
                        <div className="bg-[#f8fafc] p-3 rounded-lg border border-[#e2e8f0]">
                            <p className="text-xs font-semibold text-[#1e293b]">Panel Institucional</p>
                            <p className="text-[10px] text-[#64748b] mt-0.5">Gestión de recursos UCP</p>
                        </div>
                    ) : (
                        <div className="w-full flex justify-center">
                            <ShieldCheck className="w-5 h-5 text-[#94a3b8]" />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
