'use client';

import React from 'react';
import { CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react';

interface ProjectStatusBadgeProps {
    status: 'EN PROGRESO' | 'ESPERANDO APROBACIÓN' | 'RECHAZADO';
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'EN PROGRESO':
                return {
                    color: 'bg-blue-100 text-blue-800 border-blue-200',
                    icon: <Clock className="w-4 h-4" />,
                    text: 'En Progreso'
                };
            case 'ESPERANDO APROBACIÓN':
                return {
                    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    icon: <AlertTriangle className="w-4 h-4" />,
                    text: 'Esperando Aprobación'
                };
            case 'RECHAZADO':
                return {
                    color: 'bg-red-100 text-red-800 border-red-200',
                    icon: <XCircle className="w-4 h-4" />,
                    text: 'Rechazado'
                };
            default:
                return {
                    color: 'bg-gray-100 text-gray-800 border-gray-200',
                    icon: <Clock className="w-4 h-4" />,
                    text: status
                };
        }
    };

    const config = getStatusConfig(status);

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium ${config.color}`}>
            {config.icon}
            <span>{config.text}</span>
        </div>
    );
}
