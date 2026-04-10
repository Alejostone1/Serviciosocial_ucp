import React from 'react';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';

/**
 * Pantalla de carga global para el panel administrativo.
 * Utiliza streaming de App Router para mostrar el loader inmediatamente
 * mientras se resuelven las consultas a la base de datos de cada módulo.
 */
export default function AdminLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] w-full animate-in fade-in duration-500">
            <InstitutionalLoader priority={true} />
            <div className="mt-4 text-center">
                <p className="text-sm font-bold text-slate-800 uppercase tracking-[0.2em] opacity-80">
                    Panel Administrativo
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-widest">
                    Sincronizando con base de datos...
                </p>
            </div>
        </div>
    );
}
