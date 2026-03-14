'use client';

import React from 'react';
import { Bell, User, LogOut, Menu } from 'lucide-react';
import Link from 'next/link';

export default function Topbar() {
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    return (
        <header className="bg-[#8B1E1E] text-white shadow-lg">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo y título */}
                    <div className="flex items-center gap-4">
                        <button className="lg:hidden">
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                                <span className="text-[#8B1E1E] font-bold text-sm">UCP</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold">Sistema de Servicio Social</h1>
                                <p className="text-xs text-red-100">Universidad -catolica de Pereira</p>
                            </div>
                        </div>
                    </div>

                    {/* Navegación y usuario */}
                    <div className="flex items-center gap-4">
                        {/* Notificaciones */}
                        <button className="relative p-2 hover:bg-red-700 rounded-lg transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
                        </button>

                        {/* Menú de usuario */}
                        <div className="relative">
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-2 p-2 hover:bg-red-700 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5" />
                                </div>
                                <span className="hidden sm:block text-sm">Estudiante</span>
                            </button>

                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    <Link
                                        href="/estudiante/perfil"
                                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        <User className="w-4 h-4" />
                                        Mi Perfil
                                    </Link>
                                    <hr className="my-2 border-gray-200" />
                                    <button className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left">
                                        <LogOut className="w-4 h-4" />
                                        Cerrar Sesión
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
