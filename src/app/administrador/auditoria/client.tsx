'use client';

import React from 'react';
import { SimpleAuditoriaTable } from './simple-table';

// Tipo basado en Prisma result de getAuditoriaLogs
type LogRow = {
    id: string;
    accion: string;
    entidad: string | null;
    descripcion: string | null;
    resultado: string;
    creado_en: Date;
    usuario: {
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
        rol: string;
    } | null;
};

export function AuditoriaTableClient({ initialData }: { initialData: LogRow[] }) {
    return <SimpleAuditoriaTable initialData={initialData} />;
}
