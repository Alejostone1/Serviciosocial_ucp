'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  CheckCircle,
  FileText,
  Clock,
  Users,
  Award,
  ChevronLeft,
  Settings,
  HelpCircle,
  X,
  ShieldCheck,
  ClipboardCheck,
} from 'lucide-react';
import { UCPLogo } from '@/components/ui/UCPLogo';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/sistema/auxiliar/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Convocatorias',
    href: '/sistema/auxiliar/convocatorias',
    icon: FileText,
  },
  {
    title: 'Actividades',
    href: '/sistema/auxiliar/actividades',
    icon: ClipboardCheck,
  },
  {
    title: 'Validación de Horas',
    href: '/sistema/auxiliar/validacion',
    icon: ShieldCheck,
  },
  {
    title: 'Postulaciones',
    href: '/sistema/auxiliar/postulaciones',
    icon: ClipboardCheck,
  },
  {
    title: 'Estudiantes',
    href: '/sistema/auxiliar/estudiantes',
    icon: Users,
  },
  {
    title: 'Reportes Generales',
    href: '/sistema/auxiliar/reportes',
    icon: FileText,
  },
];

const secondaryItems = [
  { title: 'Configuración', icon: Settings, href: '/sistema/auxiliar/configuracion' },
  { title: 'Ayuda', icon: HelpCircle, href: '/sistema/auxiliar/ayuda' },
];

interface AuxiliarSidebarProps {
    isMobileMenuOpen?: boolean;
    setIsMobileMenuOpen?: (open: boolean) => void;
}

export function AuxiliarSidebar({ isMobileMenuOpen, setIsMobileMenuOpen }: AuxiliarSidebarProps) {
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
                <span className="font-semibold text-slate-800 tracking-tight leading-none text-lg">UCP <span className="text-[#8B1E1E]">Auxiliar</span></span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                    <div className="w-1 h-1 bg-[#8B1E1E] rounded-full"></div>
                    Soporte Administrativo
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
            {!isCollapsed && <p className="px-4 text-[10px] font-semibold text-slate-300 uppercase tracking-widest mb-4">Gestión y Control</p>}
            {menuItems.map((item) => {
              const isActive = item.href === '/sistema/auxiliar/dashboard'
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
                      ? 'bg-[#8B1E1E]/5 text-[#8B1E1E]'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon className={cn(
                    'w-5 h-5 transition-colors shrink-0',
                    isActive ? 'text-[#8B1E1E]' : 'text-slate-400 group-hover:text-slate-600'
                  )} />
                  {(!isCollapsed || isMobileMenuOpen) && <span className="animate-in fade-in slide-in-from-left-2 duration-300">{item.title}</span>}
                  {isActive && (
                      <div className="absolute left-0 w-1 h-5 bg-[#8B1E1E] rounded-r-full" />
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
