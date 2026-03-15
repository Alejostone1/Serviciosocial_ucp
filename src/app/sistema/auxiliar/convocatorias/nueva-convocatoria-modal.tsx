'use client';

import React, { useState, useEffect } from 'react';
import { FormModal } from '@/components/ui/form-modal';
import { 
    Calendar as CalendarIcon, 
    Plus, 
    Trash2, 
    Info, 
    CheckCircle2, 
    FileText,
    Target,
    Activity,
    Clock,
    Users,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { toast } from 'sonner';
import { Modalidad } from '@prisma/client';
import { crearConvocatoriaAuxiliar, getOpcionesAuxiliar } from './actions';
import { cn } from '@/lib/utils';

interface NuevaConvocatoriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NuevaConvocatoriaAuxiliarModal({ isOpen, onClose, onSuccess }: NuevaConvocatoriaModalProps) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [opciones, setOpciones] = useState<{ categorias: any[], programas: any[] }>({ categorias: [], programas: [] });

    const [formData, setFormData] = useState({
        titulo: '',
        descripcion: '',
        objetivo: '',
        id_categoria: '',
        id_programa: '',
        modalidad: 'PRESENCIAL' as Modalidad,
        lugar: '',
        fecha_inicio: '',
        fecha_fin: '',
        fecha_cierre_postulacion: '',
        cupo_maximo: 20,
        horas_totales_ofrecidas: 80,
        requiere_entrevista: false,
        competencias_requeridas: [] as string[],
        actividades: [] as any[]
    });

    useEffect(() => {
        if (isOpen) {
            getOpcionesAuxiliar().then(setOpciones).catch(console.error);
        }
    }, [isOpen]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddActivity = () => {
        setFormData(prev => ({
            ...prev,
            actividades: [
                ...prev.actividades,
                { nombre: '', tipo_actividad: 'CAPACITACION', horas_estimadas: 2 }
            ]
        }));
    };

    const handleRemoveActivity = (index: number) => {
        setFormData(prev => ({
            ...prev,
            actividades: prev.actividades.filter((_, i) => i !== index)
        }));
    };

    const handleActivityChange = (index: number, field: string, value: any) => {
        const newActividades = [...formData.actividades];
        newActividades[index][field] = value;
        setFormData(prev => ({ ...prev, actividades: newActividades }));
    };

    const handleSubmit = async () => {
        if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        try {
            setLoading(true);
            await crearConvocatoriaAuxiliar(formData);
            toast.success('Convocatoria creada y publicada exitosamente');
            onSuccess();
            onClose();
            // Reset form
            setFormData({
                titulo: '',
                descripcion: '',
                objetivo: '',
                id_categoria: '',
                id_programa: '',
                modalidad: 'PRESENCIAL',
                lugar: '',
                fecha_inicio: '',
                fecha_fin: '',
                fecha_cierre_postulacion: '',
                cupo_maximo: 20,
                horas_totales_ofrecidas: 80,
                requiere_entrevista: false,
                competencias_requeridas: [],
                actividades: []
            });
            setStep(1);
        } catch (error: any) {
            toast.error(error.message || 'Error al crear la convocatoria');
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormModal 
            isOpen={isOpen} 
            onClose={onClose} 
            title="Crear Nueva Convocatoria"
            subtitle="Define un proyecto social para el sistema de Servicio Social UCP"
            size="xl"
        >
            <div className="space-y-10 py-4">
                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-6 px-4">
                    {[1, 2, 3].map((s) => (
                        <React.Fragment key={s}>
                            <div className="flex flex-col items-center gap-2">
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-all duration-500",
                                    step === s ? "bg-[#8B1E1E] text-white shadow-lg shadow-[#8B1E1E]/10" : 
                                    step > s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                                )}>
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </div>
                                <span className={cn(
                                    "text-[10px] uppercase font-bold tracking-widest",
                                    step === s ? "text-[#8B1E1E]" : "text-slate-300"
                                )}>
                                    {s === 1 ? 'Básico' : s === 2 ? 'Fechas' : 'Actividades'}
                                </span>
                            </div>
                            {s < 3 && <div className={cn("h-0.5 w-12 rounded-full", step > s ? "bg-emerald-500" : "bg-slate-100")}></div>}
                        </React.Fragment>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left px-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-slate-400" />
                                    Título del Proyecto <span className="text-rose-500">*</span>
                                </label>
                                <input 
                                    name="titulo" 
                                    placeholder="Ej: Alfabetización Digital Adultos" 
                                    value={formData.titulo}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-slate-400" />
                                    Descripción Detallada <span className="text-rose-500">*</span>
                                </label>
                                <textarea 
                                    name="descripcion" 
                                    rows={4}
                                    placeholder="Explica de qué trata el proyecto..." 
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Categoría</label>
                                    <select 
                                        name="id_categoria" 
                                        value={formData.id_categoria} 
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium bg-white"
                                    >
                                        <option value="">Seleccionar categoría</option>
                                        {opciones.categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Modalidad</label>
                                    <select 
                                        name="modalidad" 
                                        value={formData.modalidad} 
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium bg-white"
                                    >
                                        <option value="PRESENCIAL">Presencial</option>
                                        <option value="VIRTUAL">Virtual</option>
                                        <option value="HIBRIDA">Híbrida</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left px-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <CalendarIcon className="w-4 h-4 text-slate-400" />
                                        Fecha de Inicio <span className="text-rose-500">*</span>
                                    </label>
                                    <input 
                                        name="fecha_inicio" 
                                        type="date" 
                                        value={formData.fecha_inicio}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-slate-400" />
                                        Fecha de Cierre
                                    </label>
                                    <input 
                                        name="fecha_fin" 
                                        type="date" 
                                        value={formData.fecha_fin}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        Cupos Disponibles
                                    </label>
                                    <input 
                                        name="cupo_maximo" 
                                        type="number" 
                                        value={formData.cupo_maximo}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-slate-400" />
                                        Horas Totales
                                    </label>
                                    <input 
                                        name="horas_totales_ofrecidas" 
                                        type="number" 
                                        value={formData.horas_totales_ofrecidas}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left px-2">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    Desglosa las tareas que el estudiante realizará.
                                </p>
                                <button 
                                    type="button" 
                                    onClick={handleAddActivity}
                                    className="shrink-0 h-10 px-4 bg-slate-100 text-slate-900 rounded-lg font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Nueva Tarea
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {formData.actividades.map((act, idx) => (
                                    <div key={idx} className="p-5 bg-white border border-slate-100 rounded-xl relative group transition-all hover:border-[#8B1E1E]/20">
                                        <button 
                                            onClick={() => handleRemoveActivity(idx)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actividad</label>
                                                <input 
                                                    value={act.nombre}
                                                    onChange={(e) => handleActivityChange(idx, 'nombre', e.target.value)}
                                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas</label>
                                                <input 
                                                    type="number"
                                                    value={act.horas_estimadas}
                                                    onChange={(e) => handleActivityChange(idx, 'horas_estimadas', parseInt(e.target.value))}
                                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                    <button 
                        onClick={step === 1 ? onClose : () => setStep(step - 1)}
                        className="flex items-center gap-2 px-6 h-11 font-semibold text-slate-400 hover:text-slate-900 transition-colors text-sm"
                    >
                        {step !== 1 && <ChevronLeft className="w-4 h-4" />}
                        {step === 1 ? 'Cancelar' : 'Volver'}
                    </button>
                    <button 
                        onClick={step === 3 ? handleSubmit : () => setStep(step + 1)}
                        disabled={loading}
                        className="flex items-center gap-2 bg-[#8B1E1E] text-white px-8 h-11 rounded-xl font-semibold hover:bg-[#a32424] transition-all disabled:opacity-50 text-sm"
                    >
                        {loading ? 'Creando...' : step === 3 ? 'Finalizar' : 'Continuar'}
                        {step !== 3 && !loading && <ChevronRight className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </FormModal>
    );
}
