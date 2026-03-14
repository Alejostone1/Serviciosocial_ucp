'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  Activity,
  FileText,
  Clock,
  Users,
  Award,
  Menu,
  X,
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/sistema/profesor/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Convocatorias',
    href: '/sistema/profesor/convocatorias',
    icon: Calendar,
  },
  {
    title: 'Actividades',
    href: '/sistema/profesor/actividades',
    icon: Activity,
  },
  {
    title: 'Postulaciones',
    href: '/sistema/profesor/postulaciones',
    icon: FileText,
  },
  {
    title: 'Reportes de Horas',
    href: '/sistema/profesor/reportes',
    icon: Clock,
  },
  {
    title: 'Estudiantes',
    href: '/sistema/profesor/estudiantes',
    icon: Users,
  },
  {
    title: 'Certificados',
    href: '/sistema/profesor/certificados',
    icon: Award,
  },
];

export function ProfesorSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <div
      className={cn(
        'relative border-r border-gray-200 bg-white transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Toggle Button */}
      <div className="absolute -right-3 top-6 z-10">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700"
        >
          {isCollapsed ? (
            <Menu className="h-3 w-3" />
          ) : (
            <X className="h-3 w-3" />
          )}
        </button>
      </div>

      {/* Sidebar Content */}
      <div className="flex h-full flex-col">
        {/* Logo/Title */}
        <div className="flex h-16 items-center border-b border-gray-200 px-4">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Panel Profesor</h2>
              <p className="text-xs text-gray-500">Gestión Académica</p>
            </div>
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">P</span>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="ml-3">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">P</span>
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Profesor</p>
                <p className="text-xs text-gray-500">En línea</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
