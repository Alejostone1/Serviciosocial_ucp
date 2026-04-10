'use client';

import React, { useState } from 'react';
import { AliadoSidebar } from './components/AliadoSidebar';
import { AliadoHeader } from './components/AliadoHeader';

import { Toaster } from 'sonner';

export default function AliadoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900 overflow-hidden">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Sidebar Navigation */}
      <AliadoSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      
      {/* Main Perspective Wrapper */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Simple & Clean Background Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none"></div>
        
        {/* Header Navigation */}
        <AliadoHeader onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
        
        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:px-12 lg:py-10 custom-scrollbar relative transition-all duration-500">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
