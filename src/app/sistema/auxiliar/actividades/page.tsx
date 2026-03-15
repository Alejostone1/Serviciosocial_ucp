'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    Plus,
    Activity,
    Loader2,
    Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getConvocatoriasAuxiliar } from '../convocatorias/actions';
import { toast } from 'sonner';
import Link from 'next/link';
import { NuevaActividadModal } from './nueva-actividad-modal';

export default function AuxiliarActividadesPage() {
    const [loading, setLoading] = useState(true);
    const [convocatorias, setConvocatorias] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConv, setSelectedConv] = useState<{id: string, titulo: string} | null>(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getConvocatoriasAuxiliar();
            setConvocatorias(data);
        } catch (error) {
            toast.error('Error al cargar actividades');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = (convocatorias || []).filter(c => 
        c.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleAddActivity = (conv: any) => {
        setSelectedConv({ id: conv.id, titulo: conv.titulo });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="px-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Actividades</h1>
                <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
                    Administra las tareas y actividades asociadas a cada convocatoria de servicio social.
                </p>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input 
                        placeholder="Buscar por convocatoria..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 text-sm transition-all font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
                    <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Cargando actividades...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.map((conv) => (
                        <div key={conv.id} className="bg-white rounded-3xl border border-slate-100 p-6 hover:border-[#8B1E1E]/20 transition-all shadow-sm flex flex-col justify-between group">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-slate-50 rounded-lg text-slate-400 group-hover:bg-[#8B1E1E]/5 group-hover:text-[#8B1E1E] transition-colors">
                                        <Tag className="w-4 h-4" />
                                    </div>
                                    <h3 className="font-bold text-slate-900 text-sm truncate">{conv.titulo}</h3>
                                </div>
                                
                                <div className="space-y-3">
                                    {conv._count.actividades > 0 ? (
                                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100/50">
                                            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                                <Activity className="w-3.5 h-3.5 text-[#8B1E1E]" />
                                                {conv._count.actividades} Actividades
                                            </div>
                                            <Link 
                                                href={`/sistema/auxiliar/convocatorias/${conv.id}`}
                                                className="text-[10px] font-black uppercase text-[#8B1E1E] hover:underline"
                                            >
                                                Ver todas
                                            </Link>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic py-4 text-center border rounded-2xl border-dashed border-slate-200 bg-slate-50/30">Sin actividades registradas</p>
                                    )}
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAddActivity(conv)}
                                className="w-full mt-6 h-11 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-[#8B1E1E] hover:text-white hover:border-[#8B1E1E] transition-all flex items-center justify-center gap-2 shadow-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Añadir Actividad
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal de Creación */}
            {selectedConv && (
                <NuevaActividadModal 
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadData}
                    convocatoriaId={selectedConv.id}
                    convocatoriaTitulo={selectedConv.titulo}
                />
            )}
        </div>
    );
}
