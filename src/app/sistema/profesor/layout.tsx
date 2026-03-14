'use client';

import React from 'react';
import { ProfesorSidebar } from './components/ProfesorSidebar';
import { ProfesorHeader } from './components/ProfesorHeader';

export default function ProfesorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <ProfesorSidebar />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <ProfesorHeader />
          
          {/* Page Content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
