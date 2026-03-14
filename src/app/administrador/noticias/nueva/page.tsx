import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { ProfessionalNoticiaForm } from '@/components/noticias/professional-noticia-form';

export const metadata = {
    title: 'Nueva Noticia | Administrador',
};

export default async function NuevaNoticiaPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        redirect('/login');
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Nueva Noticia</h1>
                    <p className="text-slate-600 mt-1">Crea una nueva noticia institucional</p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <ProfessionalNoticiaForm />
            </div>
        </div>
    );
}
