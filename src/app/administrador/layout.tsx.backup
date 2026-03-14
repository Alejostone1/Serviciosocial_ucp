'use client';

import React, { useState } from 'react';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { AdminHeader } from '@/components/layout/admin-header';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex">
            {/* Sidebar Component */}
            <AdminSidebar isMobileOpen={isMobileOpen} setMobileOpen={setIsMobileOpen} />

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0 lg:pl-[260px] transition-all duration-300 ease-in-out">
                {/* Header Component */}
                <AdminHeader onMenuClick={() => setIsMobileOpen(true)} />

                {/* Page Content */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 xl:max-w-7xl xl:mx-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
