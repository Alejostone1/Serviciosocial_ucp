'use client';

import React, { useState } from 'react';

export default function AdminLayoutSimple({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Simple */}
            <header className="bg-white border-b border-slate-200 px-4 py-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsMobileOpen(!isMobileOpen)}
                            className="p-2 text-slate-600 hover:text-slate-900"
                        >
                            ☰
                        </button>
                        <h1 className="text-xl font-bold text-[#8B1E1E]">Panel Administrador UCP</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-slate-600">Admin User</span>
                        <div className="w-8 h-8 bg-[#8B1E1E] rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar Simple */}
                <aside className={`${isMobileOpen ? 'block' : 'hidden'} lg:block w-64 bg-white border-r border-slate-200 min-h-screen`}>
                    <nav className="p-4">
                        <ul className="space-y-2">
                            <li>
                                <a href="/(sistema)/administrador" className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded">
                                    📊 Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="/(sistema)/administrador/noticias" className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded font-medium bg-slate-100">
                                    📰 Noticias
                                </a>
                            </li>
                            <li>
                                <a href="/(sistema)/administrador/usuarios" className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded">
                                    👥 Usuarios
                                </a>
                            </li>
                            <li>
                                <a href="/(sistema)/administrador/convocatorias" className="block px-3 py-2 text-slate-700 hover:bg-slate-100 rounded">
                                    📋 Convocatorias
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
