'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
    ChevronLeft,
    AlertCircle,
    Loader2,
    MapPin
} from 'lucide-react';
import { toast } from 'sonner';
import { Modalidad } from '@prisma/client';
import { crearConvocatoriaProfesor, getOpcionesProfesor } from './actions';
import { cn } from '@/lib/utils';

interface NuevaConvocatoriaModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NuevaConvocatoriaModal({ isOpen, onClose, onSuccess }: NuevaConvocatoriaModalProps) {
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

    const [nuevaCompetencia, setNuevaCompetencia] = useState('');

    useEffect(() => {
        if (isOpen) {
            getOpcionesProfesor().then(setOpciones).catch(console.error);
        }
    }, [isOpen]);

    // Calcular horas asignadas y restantes
    const horasAsignadas = useMemo(() => {
        return formData.actividades.reduce((total, act) => total + (act.horas_estimadas || 0), 0);
    }, [formData.actividades]);

    const horasRestantes = useMemo(() => {
        return (formData.horas_totales_ofrecidas || 0) - horasAsignadas;
    }, [formData.horas_totales_ofrecidas, horasAsignadas]);

    const porcentajeHoras = useMemo(() => {
        const totales = formData.horas_totales_ofrecidas || 1;
        return (horasAsignadas / totales) * 100;
    }, [horasAsignadas, formData.horas_totales_ofrecidas]);

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

    // Funciones para manejar competencias
    const agregarCompetencia = () => {
        if (nuevaCompetencia.trim()) {
            const competenciasActuales = formData.competencias_requeridas || [];
            if (!competenciasActuales.includes(nuevaCompetencia.trim())) {
                setFormData(prev => ({
                    ...prev,
                    competencias_requeridas: [...competenciasActuales, nuevaCompetencia.trim()]
                }));
                setNuevaCompetencia('');
            }
        }
    };

    const eliminarCompetencia = (index: number) => {
        const competenciasActuales = formData.competencias_requeridas || [];
        const nuevasCompetencias = competenciasActuales.filter((_, i) => i !== index);
        setFormData(prev => ({
            ...prev,
            competencias_requeridas: nuevasCompetencias
        }));
    };

    const handleSubmit = async (enviarARevision: boolean = true) => {
        if (!formData.titulo || !formData.descripcion || !formData.fecha_inicio) {
            toast.error('Por favor completa los campos obligatorios');
            return;
        }

        // Validación de rango de fechas
        if (formData.fecha_fin && new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
            toast.error('La fecha de inicio no puede ser posterior a la fecha de fin');
            return;
        }

        // Validación de horas
        if (horasRestantes < 0) {
            toast.error('Las horas asignadas en actividades exceden las horas totales ofrecidas');
            return;
        }

        try {
            setLoading(true);
            await crearConvocatoriaProfesor(formData, enviarARevision);
            if (enviarARevision) {
                toast.success('Convocatoria enviada para aprobación exitosamente');
            } else {
                toast.success('Convocatoria guardada como borrador');
            }
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
            setNuevaCompetencia('');
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
            subtitle="Define un proyecto social de alto impacto para tus estudiantes"
            size="xl"
        >
            <div className="space-y-10 py-4">
                {/* Refined Steps Indicator */}
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
                                    placeholder="Ej: Apoyo Académico 2026" 
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
                                    placeholder="Describe brevemente los objetivos y el alcance..." 
                                    value={formData.descripcion}
                                    onChange={handleInputChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-slate-400" />
                                    Objetivo del Proyecto
                                </label>
                                <textarea 
                                    name="objetivo" 
                                    rows={2}
                                    placeholder="¿Cuál es el objetivo principal de esta convocatoria?" 
                                    value={formData.objetivo}
                                    onChange={handleInputChange}
                                    className="w-full p-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all resize-none text-sm font-medium leading-relaxed"
                                />
                            </div>

                            {/* Competencias Requeridas */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <Target className="w-4 h-4 text-slate-400" />
                                    Competencias Requeridas
                                </label>
                                <div className="space-y-3">
                                    {/* Lista de competencias actuales */}
                                    <div className="flex flex-wrap gap-2">
                                        {formData.competencias_requeridas.map((competencia, index) => (
                                            <span
                                                key={index}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                            >
                                                {competencia}
                                                <button
                                                    type="button"
                                                    onClick={() => eliminarCompetencia(index)}
                                                    className="ml-1 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                    
                                    {/* Input para agregar nueva competencia */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={nuevaCompetencia}
                                            onChange={(e) => setNuevaCompetencia(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    agregarCompetencia();
                                                }
                                            }}
                                            className="flex-1 h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium"
                                            placeholder="Escribe una competencia y presiona Enter"
                                        />
                                        <button
                                            type="button"
                                            onClick={agregarCompetencia}
                                            className="px-4 py-2 bg-[#8B1E1E] text-white rounded-xl hover:bg-[#a32424] transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Programa</label>
                                    <select 
                                        name="id_programa" 
                                        value={formData.id_programa} 
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium bg-white"
                                    >
                                        <option value="">Seleccionar programa (opcional)</option>
                                        {opciones.programas.map(prog => (
                                            <option key={prog.id} value={prog.id}>{prog.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Categoría</label>
                                    <select 
                                        name="id_categoria" 
                                        value={formData.id_categoria} 
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium bg-white"
                                    >
                                        <option value="">Seleccionar una categoría</option>
                                        {opciones.categorias.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Lugar (opcional)
                                </label>
                                <input 
                                    name="lugar" 
                                    type="text"
                                    placeholder="Ej: Campus Principal, Sala de computación" 
                                    value={formData.lugar}
                                    onChange={handleInputChange}
                                    className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 focus:ring-4 focus:ring-[#8B1E1E]/5 outline-none transition-all text-sm font-medium"
                                />
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
                                        Fecha de Finalización
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
                                        Cupos Máximos
                                    </label>
                                    <input 
                                        name="cupo_maximo" 
                                        type="number" 
                                        min={1}
                                        max={500}
                                        value={formData.cupo_maximo}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                    <p className="text-xs text-slate-400">Mínimo: 1, Máximo: 500</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                        <Target className="w-4 h-4 text-slate-400" />
                                        Horas a Certificar
                                    </label>
                                    <input 
                                        name="horas_totales_ofrecidas" 
                                        type="number" 
                                        min={1}
                                        max={500}
                                        value={formData.horas_totales_ofrecidas}
                                        onChange={handleInputChange}
                                        className="w-full h-11 px-4 rounded-xl border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                    />
                                    <p className="text-xs text-slate-400">Mínimo: 1, Máximo: 500 horas</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left px-2">
                            {/* Contador de horas */}
                            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-[#8B1E1E]" />
                                        <span className="font-semibold text-slate-700">Control de Horas</span>
                                    </div>
                                    <span className={cn(
                                        "text-sm font-bold",
                                        horasRestantes < 0 ? 'text-rose-600' : horasRestantes === 0 ? 'text-emerald-600' : 'text-amber-600'
                                    )}>
                                        {horasRestantes < 0 ? 'Excede en ' : ''}{Math.abs(horasRestantes)} horas {horasRestantes < 0 ? '' : horasRestantes === 0 ? 'completas' : 'restantes'}
                                    </span>
                                </div>
                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={cn(
                                            "h-full transition-all duration-500 rounded-full",
                                            porcentajeHoras > 100 ? 'bg-rose-500' : porcentajeHoras === 100 ? 'bg-emerald-500' : 'bg-[#8B1E1E]'
                                        )}
                                        style={{ width: `${Math.min(porcentajeHoras, 100)}%` }}
                                    />
                                </div>
                                <div className="flex justify-between mt-2 text-xs text-slate-500">
                                    <span>0h</span>
                                    <span className="font-medium">
                                        {horasAsignadas}h asignadas / {formData.horas_totales_ofrecidas || 0}h totales
                                    </span>
                                </div>
                                {horasRestantes < 0 && (
                                    <p className="text-xs text-rose-600 mt-2 flex items-center gap-1">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        Las actividades exceden las horas totales ofrecidas
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <p className="text-sm font-medium text-slate-500 leading-relaxed">
                                    Define las tareas específicas que los estudiantes deberán cumplir para certificar sus horas.
                                </p>
                                <button 
                                    type="button" 
                                    onClick={handleAddActivity}
                                    className="shrink-0 h-10 px-4 bg-slate-100 text-slate-900 rounded-lg font-semibold text-xs hover:bg-slate-200 transition-all flex items-center gap-2 border border-slate-200"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Añadir Tarea
                                </button>
                            </div>

                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {formData.actividades.map((act, idx) => (
                                    <div key={idx} className="p-5 bg-white border border-slate-100 rounded-xl relative group transition-all hover:border-[#8B1E1E]/20 hover:shadow-sm">
                                        <button 
                                            onClick={() => handleRemoveActivity(idx)}
                                            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nombre de la tarea</label>
                                                <input 
                                                    value={act.nombre}
                                                    onChange={(e) => handleActivityChange(idx, 'nombre', e.target.value)}
                                                    className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:border-[#8B1E1E]/20 outline-none transition-all text-sm font-medium"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Horas destinadas</label>
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
                                {formData.actividades.length === 0 && (
                                    <div className="text-center py-20 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Activity className="w-5 h-5 text-slate-300" />
                                        </div>
                                        <p className="text-slate-400 font-medium text-sm">No has desglosado las actividades todavía.</p>
                                    </div>
                                )}
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
                        {step === 1 ? 'Cancelar' : 'Paso anterior'}
                    </button>
                    
                    {step === 3 ? (
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => handleSubmit(false)}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 h-11 font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all disabled:opacity-50 text-sm border border-slate-200"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar como Borrador'}
                            </button>
                            <button 
                                onClick={() => handleSubmit(true)}
                                disabled={loading}
                                className="flex items-center gap-2 bg-[#8B1E1E] text-white px-8 h-11 rounded-xl font-semibold hover:bg-[#a32424] shadow-md shadow-[#8B1E1E]/10 transition-all disabled:opacity-50 text-sm"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enviar para Aprobación'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <button 
                            onClick={() => {
                                // Validación al pasar del paso 2 al 3
                                if (step === 2) {
                                    if (formData.fecha_fin && new Date(formData.fecha_inicio) > new Date(formData.fecha_fin)) {
                                        toast.error('La fecha de inicio no puede ser posterior a la fecha de fin');
                                        return;
                                    }
                                    if (!formData.fecha_inicio) {
                                        toast.error('La fecha de inicio es obligatoria');
                                        return;
                                    }
                                }
                                setStep(step + 1);
                            }}
                            className="flex items-center gap-2 bg-[#8B1E1E] text-white px-8 h-11 rounded-xl font-semibold hover:bg-[#a32424] shadow-md shadow-[#8B1E1E]/10 transition-all text-sm"
                        >
                            Siguiente Paso
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </FormModal>
    );
}
