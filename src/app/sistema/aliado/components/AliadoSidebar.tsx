'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  FileText,
  Users,
  Award,
  ChevronLeft,
  Settings,
  HelpCircle,
  X,
  ShieldCheck,
  ClipboardCheck,
  Building2,
} from 'lucide-react';
import { UCPLogo } from '@/components/ui/UCPLogo';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/sistema/aliado/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Mis Convocatorias',
    href: '/sistema/aliado/convocatorias',
    icon: FileText,
  },
  {
    title: 'Postulaciones',
    href: '/sistema/aliado/postulaciones',
    icon: ClipboardCheck,
  },
  {
    title: 'Validación de Horas',
    href: '/sistema/aliado/validacion',
    icon: ShieldCheck,
  },
  {
    title: 'Estudiantes',
    href: '/sistema/aliado/estudiantes',
    icon: Users,
  },
  {
    title: 'Certificados',
    href: '/sistema/aliado/certificados',
    icon: Award,
  },
];

const secondaryItems = [
  { title: 'Configuración', icon: Settings, href: '/sistema/aliado/configuracion' },
  { title: 'Ayuda', icon: HelpCircle, href: '/sistema/aliado/ayuda' },
];

interface AliadoSidebarProps {
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
}

export function AliadoSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AliadoSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden transition-all duration-300"
            onClick={() => setIsMobileMenuOpen?.(false)}
          />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 bg-white border-r border-slate-100 transition-all duration-300 ease-in-out flex flex-col z-[70] lg:relative',
          isCollapsed ? 'w-20' : 'w-72',
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="h-20 flex items-center px-6 mb-8 mt-2">
          <div className="flex items-center gap-4 overflow-hidden flex-1">
            <UCPLogo variant="round" size={42} />
            {!isCollapsed && (
              <div className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-500">
                <span className="font-semibold text-slate-800 tracking-tight leading-none text-lg">UCP <span className="text-[#1E3A8A]">Aliado</span></span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-[#1E3A8A] rounded-full"></div>
                    Entidad Aliada
                </span>
              </div>
            )}
          </div>
          {/* Mobile Close Button */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-slate-900 transition-colors"
            onClick={() => setIsMobileMenuOpen?.(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-4 space-y-10 overflow-y-auto custom-scrollbar">
          <div className="space-y-1.5">
            {!isCollapsed && <p className="px-4 text-[10px] font-semibold text-slate-300 uppercase tracking-widest mb-4">Gestión de Proyectos</p>}
            {menuItems.map((item) => {
              const isActive = item.href === '/sistema/aliado/dashboard'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen?.(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group relative',
                    isActive
                      ? 'bg-[#1E3A8A]/5 text-[#1E3A8A]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors shrink-0',
                    isActive ? 'text-[#1E3A8A]' : 'text-slate-400 group-hover:text-slate-600'
                  )} />
                  {(!isCollapsed || isMobileMenuOpen) && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.title}</span>}
                  {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-[#1E3A8A] rounded-r-full" />
                  )}
                  {/* Tooltip for collapsed state */}
                  {isCollapsed && !isMobileMenuOpen && (
                      <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                          {item.title}
                      </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Secondary Links */}
          <div className="space-y-1.5 pb-10">
            {!isCollapsed && <p className="px-4 text-[10px] font-semibold text-slate-300 uppercase tracking-widest mb-4">Soporte técnico</p>}
            {secondaryItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen?.(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-50 hover:text-slate-900 transition-all group relative"
              >
                <item.icon className="w-5 h-5 transition-colors shrink-0" />
                {(!isCollapsed || isMobileMenuOpen) && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.title}</span>}
                {isCollapsed && !isMobileMenuOpen && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                      {item.title}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </nav>

        {/* Footer / Toggle Section - Hidden on mobile */}
        <div className="p-4 bg-slate-50/50 hidden lg:block">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-full flex items-center justify-center p-3 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-slate-900 hover:border-slate-200 transition-all group shadow-sm"
          >
            <ChevronLeft className={cn(
              'w-4 h-4 transition-transform duration-500',
              isCollapsed ? 'rotate-180' : ''
            )} />
            {!isCollapsed && <span className="ml-3 font-semibold text-xs uppercase tracking-tight">Cerrar Menú</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
