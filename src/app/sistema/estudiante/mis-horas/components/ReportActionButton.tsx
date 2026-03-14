'use client';

import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';

export function ReportActionButton() {
    const { addNotification } = useNotification();

    const handleReportClick = () => {
        addNotification({
            title: 'Iniciando reporte de horas',
            description: 'Recuerda que estas horas serán validadas por tu supervisor.',
            type: 'info',
            href: '/estudiante/mis-horas/reportar'
        });
    };

    return (
        <Link
            href="/estudiante/mis-horas/reportar"
            onClick={handleReportClick}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-semibold"
        >
            <Plus className="w-4 h-4" />
            <span>Reportar Horas</span>
        </Link>
    );
}
