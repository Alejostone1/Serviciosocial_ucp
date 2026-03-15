'use client';

import React, { useState } from 'react';
import { 
    X, 
    Activity, 
    AlignLeft, 
    Clock, 
    MapPin, 
    Layers,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { crearActividadAuxiliar } from '../actions';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    convocatoriaId: string;
    convocatoriaTitulo: string;
}

const TIPOS_ACTIVIDAD = [
    { value: 'GENERAL', label: 'General / Otros' },
    { value: 'CAPACITACION', label: 'Capacitación' },
    { value: 'CAMPO', label: 'Trabajo de Campo' },
    { value: 'ADMINISTRATIVA', label: 'Administrativa' },
    { value: 'INVESTIGACION', label: 'Investigación' },
    { value: 'COMUNITARIA', label: 'Social / Comunitaria' }
];

export function NuevaActividadModal({ isOpen, onClose, onSuccess, convocatoriaId, convocatoriaTitulo }: Props) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo_actividad: 'GENERAL',
        horas_estimadas: 0,
        ubicacion: ''
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.nombre || formData.horas_estimadas <= 0) {
            toast.error('Nombre y horas estimadas son obligatorios');
            return;
        }

        try {
            setLoading(true);
            await crearActividadAuxiliar({
                id_convocatoria: convocatoriaId,
                ...formData
            });
            toast.success('Actividad creada exitosamente');
            onSuccess();
            onClose();
            setFormData({
                nombre: '',
                descripcion: '',
                tipo_actividad: 'GENERAL',
                horas_estimadas: 0,
                ubicacion: ''
            });
        } catch (error) {
            toast.error('No se pudo crear la actividad');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                onClick={onClose} 
            />
            
            {/* Modal Container */}
            <div className="relative bg-white w-full max-w-xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
                {/* Header - Fixed */}
                <div className="px-6 py-5 bg-slate-50/50 border-b border-slate-100 shrink-0">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-100">
                            <Activity className="w-5 h-5 text-[#8B1E1E]" />
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Nueva Actividad</h2>
                        <p className="text-slate-500 text-xs mt-0.5 truncate">
                            Convocatoria: <span className="text-[#8B1E1E] font-bold">{convocatoriaTitulo}</span>
                        </p>
                    </div>
                </div>

                {/* Form - Scrollable */}
                <div className="overflow-y-auto custom-scrollbar flex-1">
                    <form id="actividad-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                        {/* Nombre */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="w-3 h-3" /> Nombre de la Actividad *
                            </label>
                            <input 
                                required
                                value={formData.nombre}
                                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                placeholder="Ej. Taller de capacitación ambiental"
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tipo */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers className="w-3 h-3" /> Tipo
                                </label>
                                <select 
                                    value={formData.tipo_actividad}
                                    onChange={(e) => setFormData({...formData, tipo_actividad: e.target.value})}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all font-medium appearance-none"
                                >
                                    {TIPOS_ACTIVIDAD.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Horas */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock className="w-3 h-3" /> Horas Estimadas *
                                </label>
                                <input 
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.horas_estimadas}
                                    onChange={(e) => setFormData({...formData, horas_estimadas: Number(e.target.value)})}
                                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Ubicación */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-3 h-3" /> Ubicación
                            </label>
                            <input 
                                value={formData.ubicacion}
                                onChange={(e) => setFormData({...formData, ubicacion: e.target.value})}
                                placeholder="Ej. Auditorio Central o Trabajo Remoto"
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all font-medium"
                            />
                        </div>

                        {/* Descripción */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <AlignLeft className="w-3 h-3" /> Descripción
                            </label>
                            <textarea 
                                rows={3}
                                value={formData.descripcion}
                                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                placeholder="Describe los objetivos de esta actividad..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-4 focus:ring-[#8B1E1E]/5 focus:border-[#8B1E1E]/20 transition-all font-medium resize-none"
                            />
                        </div>
                    </form>
                </div>

                {/* Footer - Fixed */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                    <div className="flex gap-3">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="flex-1 h-11 border border-slate-200 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-all"
                        >
                            Cancelar
                        </button>
                        <button 
                            form="actividad-form"
                            type="submit"
                            disabled={loading}
                            className="flex-[2] h-11 bg-[#8B1E1E] text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-[#a32424] transition-all shadow-lg shadow-red-900/10 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Activity className="w-4 h-4" />
                            )}
                            Crear Actividad
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
