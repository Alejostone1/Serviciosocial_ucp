'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNotification } from '@/contexts/NotificationContext';
import { useRouter } from 'next/navigation';

interface ApplyActionButtonProps {
    convocatoriaName: string;
    convocatoriaId: string;
}

export function ApplyActionButton({ convocatoriaName, convocatoriaId }: ApplyActionButtonProps) {
    const { addNotification } = useNotification();
    const router = useRouter();

    const handleApplyClick = () => {
        addNotification({
            title: 'Inscripción Exitosa',
            description: `Te has postulado a la convocatoria: "${convocatoriaName}".`,
            type: 'success',
            href: '/estudiante/mis-postulaciones'
        });

        // Simulating redirect logic inside an app:
        router.push(`/estudiante/convocatorias/${convocatoriaId}`);
    };

    return (
        <button
            onClick={handleApplyClick}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
        >
            Postularse
            <ArrowRight className="w-4 h-4 ml-1" />
        </button>
    );
}
