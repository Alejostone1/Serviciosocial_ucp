'use client';

import React, { useState } from 'react';
import { ReportesDashboardClient } from './reportes-dashboard-client';
import { GestionReportesClient } from './gestion-reportes-client';

interface ReportesTabsProps {
    datos: any;
}

export function ReportesTabs({ datos }: ReportesTabsProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'gestion'>('dashboard');

    return (
        <div className="bg-white rounded-xl border border-[#e2e8f0]">
            <div className="border-b border-[#e2e8f0]">
                <nav className="flex -mb-px">
                    <button
                        onClick={() => setActiveTab('dashboard')}
                        className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'dashboard'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📊 Dashboard
                    </button>
                    <button
                        onClick={() => setActiveTab('gestion')}
                        className={`py-4 px-6 border-b-2 font-medium text-sm transition-colors ${
                            activeTab === 'gestion'
                                ? 'border-[#8B1E1E] text-[#8B1E1E]'
                                : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                    >
                        📋 Gestión de Reportes
                    </button>
                </nav>
            </div>
            
            <div className="p-6">
                {activeTab === 'dashboard' && <ReportesDashboardClient datos={datos} />}
                {activeTab === 'gestion' && <GestionReportesClient />}
            </div>
        </div>
    );
}
