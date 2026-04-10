'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Clock,
    FileText,
    Calendar,
    Award,
    Settings,
    ChevronDown,
    ChevronRight
} from 'lucide-react';

interface MenuItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    badge?: string;
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuSections: MenuSection[] = [
    {
        title: 'Principal',
        items: [
            {
                title: 'Dashboard',
                href: '/sistema/estudiante',
                icon: <Home className="w-5 h-5" />
            },
            {
                title: 'Mis Horas',
                href: '/sistema/estudiante/mis-horas',
                icon: <Clock className="w-5 h-5" />
            },
            {
                title: 'Mis Certificados',
                href: '/sistema/estudiante/certificados',
                icon: <FileText className="w-5 h-5" />
            }
        ]
    },
    {
        title: 'Oportunidades',
        items: [
            {
                title: 'Convocatorias',
                href: '/sistema/estudiante/convocatorias',
                icon: <Calendar className="w-5 h-5" />,
                badge: '3'
            },
            {
                title: 'Mis Postulaciones',
                href: '/sistema/estudiante/mis-postulaciones',
                icon: <Award className="w-5 h-5" />
            }
        ]
    },
    {
        title: 'Configuración',
        items: [
            {
                title: 'Perfil',
                href: '/sistema/estudiante/perfil',
                icon: <Settings className="w-5 h-5" />
            }
        ]
    }
];

export default function Sidebar() {
    const pathname = usePathname();
    const [expandedSections, setExpandedSections] = React.useState<Set<string>>(new Set(['Principal', 'Oportunidades']));

    const toggleSection = (title: string) => {
        const newExpanded = new Set(expandedSections);
        if (newExpanded.has(title)) {
            newExpanded.delete(title);
        } else {
            newExpanded.add(title);
        }
        setExpandedSections(newExpanded);
    };

    const isActive = (href: string) => {
        if (href === '/sistema/estudiante') {
            return pathname === href;
        }
        return pathname.startsWith(href);
    };

    return (
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen hidden lg:block">
            <div className="p-4">
                <nav className="space-y-6">
                    {menuSections.map((section) => (
                        <div key={section.title}>
                            <button
                                onClick={() => toggleSection(section.title)}
                                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#8B1E1E] transition-colors"
                            >
                                <span>{section.title}</span>
                                {expandedSections.has(section.title) ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                            </button>

                            {expandedSections.has(section.title) && (
                                <div className="mt-2 space-y-1">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                                                isActive(item.href)
                                                    ? 'bg-[#8B1E1E] text-white'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {item.icon}
                                                <span>{item.title}</span>
                                            </div>
                                            {item.badge && (
                                                <span className="bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Footer del sidebar */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    <p>Universidad Catolica de Pereira</p>
                    <p>Sistema de Servicio Social</p>
                </div>
            </div>
        </aside>
    );
}
