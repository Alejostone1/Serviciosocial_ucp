'use client';

import React, { useState } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Toaster } from 'sonner';

export default function EstudianteLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex bg-slate-50 min-h-screen font-sans text-slate-900 w-full overflow-hidden">
            <Toaster position="top-right" richColors theme="light" />

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
                <Header onMenuClick={() => setIsSidebarOpen(true)} />

                <main className="flex-1 flex flex-col relative w-full">
                    {children}
                    <Footer />
                </main>
            </div>
        </div>
    );
}
