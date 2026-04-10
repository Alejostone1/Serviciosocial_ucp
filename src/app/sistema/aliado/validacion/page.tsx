'use client';

import React, { useState, useEffect } from 'react';
import { 
    Search, 
    CheckCircle2, 
    Loader2, 
    Plus,
    Clock,
    User,
    Activity,
    X,
    ShieldCheck,
    Filter,
    ArrowRight,
    Inbox,
    FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
    getReportesParaValidarAliado, 
    validarReporteAliado, 
    registrarHorasEstudianteAliado, 
    getEstudiantesActivosAliado,
    getActividadesPorConvocatoriaAliado,
    getConvocatoriasAliado
} from '../actions';
import { toast } from 'sonner';

export default function ValidacionHorasPage() {
    const [loading, setLoading] = useState(true);
    const [reportes, setReportes] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getReportesParaValidarAliado();
            setReportes(data);
        } catch (error) {
            toast.error('Sesión expirada o error de conexión');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleValidar = async (id: string, horas: number) => {
        try {
            await validarReporteAliado(id, horas, 'Aprobación técnica Aliado');
            toast.success('Horas validadas correctamente');
            loadData();
        } catch (error) {
            toast.error('Error al procesar la validación');
        }
    };

    const filteredReportes = reportes.filter(r => 
        r.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.estudiante.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.actividad.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Validación de Horas</h1>
                    <p className="text-slate-600 text-sm">Revisa y valida las horas de servicio social reportadas por estudiantes.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                    <div className="relative w-full md:w-80 group">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                        <input 
                            placeholder="Buscar estudiante o actividad..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 h-10 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-sm transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <button 
                        onClick={() => setIsRegisterModalOpen(true)}
                        className="h-10 px-4 bg-[#8B1E1E] text-white rounded-lg text-sm font-medium hover:bg-[#A02424] transition-all flex items-center gap-2 shadow-sm"
                    >
                        <Plus className="w-4 h-4" /> Registrar Horas
                    </button>
                </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-[#8B1E1E] animate-spin" />
                    </div>
                    <p className="text-slate-600 font-medium">Cargando reportes...</p>
                </div>
            ) : filteredReportes.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredReportes.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-slate-200/50 p-5 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200/50 flex-shrink-0">
                                    <User className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-slate-900 mb-1 truncate">
                                        {item.estudiante.primer_nombre} {item.estudiante.primer_apellido}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">{item.estudiante.numero_documento}</p>
                                </div>
                                <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-xs font-medium text-amber-700">Pendiente</span>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                                <p className="text-xs font-semibold text-slate-600 mb-1 uppercase tracking-wide">Actividad</p>
                                <p className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2">{item.actividad.nombre}</p>
                                <p className="text-xs text-slate-600 truncate">{item.actividad.convocatoria.titulo}</p>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-slate-900">{item.horas_reportadas}</span>
                                    <span className="text-xs font-medium text-slate-500 uppercase">horas</span>
                                </div>
                                <button 
                                    onClick={() => handleValidar(item.id, item.horas_reportadas)}
                                    className="h-9 px-4 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-all text-sm flex items-center gap-2 shadow-sm"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Validar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Todo al día</h3>
                    <p className="text-slate-500 text-sm max-w-md mx-auto">
                        No hay reportes pendientes de validación en este momento.
                    </p>
                </div>
            )}
            </div>
            {isRegisterModalOpen && (
                <RegisterHoursModal 
                    onClose={() => setIsRegisterModalOpen(false)}
                    onSuccess={() => {
                        setIsRegisterModalOpen(false);
                        loadData();
                    }}
                />
            )}
        </div>
    );
}

function RegisterHoursModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [estudiantes, setEstudiantes] = useState<any[]>([]);
    const [convocatorias, setConvocatorias] = useState<any[]>([]);
    const [actividades, setActividades] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedConv, setSelectedConv] = useState('');
    const [formData, setFormData] = useState({
        id_estudiante: '', id_actividad: '', horas: 0, descripcion: ''
    });

    useEffect(() => {
        Promise.all([getEstudiantesActivosAliado(), getConvocatoriasAliado()]).then(([ests, convs]) => {
            setEstudiantes(ests); setConvocatorias(convs);
        });
    }, []);

    useEffect(() => {
        if (selectedConv) getActividadesPorConvocatoriaAliado(selectedConv).then(setActividades);
        else setActividades([]);
    }, [selectedConv]);

    const filteredEstudiantes = estudiantes.filter(est => 
        est.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.numero_documento.includes(searchTerm)
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.id_estudiante || !formData.id_actividad || formData.horas <= 0) {
            toast.error('Verifica los campos obligatorios'); return;
        }
        try {
            setLoading(true);
            await registrarHorasEstudianteAliado(formData);
            toast.success('Documento generado y validado');
            onSuccess();
        } catch (error) { toast.error('Fallo en la transacción'); }
        finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl relative animate-in zoom-in-95 duration-200 max-h-[95vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-slate-100 sticky top-0 bg-white">
                    <h3 className="text-lg font-bold text-slate-900">Registrar Horas</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
                        <X className="w-4 h-4 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Buscador de estudiantes */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-blue-600" />
                            Estudiante
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text"
                                placeholder="Buscar por nombre o documento..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    // Limpiar selección si cambia la búsqueda
                                    if (formData.id_estudiante) {
                                        setFormData({...formData, id_estudiante: ''});
                                    }
                                }}
                                onFocus={() => {
                                    // Limpiar búsqueda al enfocar si hay estudiante seleccionado
                                    if (formData.id_estudiante && searchTerm === `${estudiantes.find(e => e.id === formData.id_estudiante)?.primer_nombre} ${estudiantes.find(e => e.id === formData.id_estudiante)?.primer_apellido}`) {
                                        setSearchTerm('');
                                    }
                                }}
                                className="w-full h-9 bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            
                            {/* Indicador de estudiante seleccionado */}
                            {formData.id_estudiante && (
                                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                </div>
                            )}
                        </div>
                        
                        {/* Lista de estudiantes filtrados - solo mostrar si hay búsqueda y no hay selección */}
                        {searchTerm && !formData.id_estudiante && (
                            <div className="absolute z-10 w-full max-h-40 overflow-y-auto border border-slate-200 rounded-lg bg-white shadow-lg mt-1">
                                {filteredEstudiantes.length > 0 ? (
                                    filteredEstudiantes.slice(0, 5).map(est => (
                                        <button
                                            key={est.id}
                                            type="button"
                                            onClick={() => {
                                                setFormData({...formData, id_estudiante: est.id});
                                                setSearchTerm(`${est.primer_nombre} ${est.primer_apellido}`);
                                            }}
                                            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors border-b border-slate-100 last:border-b-0 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="font-medium text-slate-900 group-hover:text-blue-600">{est.primer_nombre} {est.primer_apellido}</div>
                                                    <div className="text-xs text-slate-500">{est.numero_documento}</div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-sm text-slate-500 text-center">
                                        No se encontraron estudiantes
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Grid compacto */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-blue-600" />
                                Proyecto
                            </label>
                            <select 
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={selectedConv}
                                onChange={(e) => setSelectedConv(e.target.value)}
                            >
                                <option value="">Seleccionar...</option>
                                {convocatorias.map(conv => (
                                    <option key={conv.id} value={conv.id}>{conv.titulo}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-blue-600" />
                                Horas
                            </label>
                            <input 
                                type="number" step="0.5" min="0.5"
                                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                value={formData.horas}
                                onChange={(e) => setFormData({...formData, horas: parseFloat(e.target.value) || 0})}
                                placeholder="0"
                            />
                        </div>
                    </div>

                    {/* Actividad */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-blue-600" />
                            Actividad
                        </label>
                        <select 
                            className="w-full h-11 bg-slate-50 border border-slate-200 rounded-lg px-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-50"
                            value={formData.id_actividad}
                            disabled={!selectedConv}
                            onChange={(e) => setFormData({...formData, id_actividad: e.target.value})}
                        >
                            <option value="">{selectedConv ? 'Seleccionar...' : 'Primero elige proyecto'}</option>
                            {actividades.map(act => (
                                <option key={act.id} value={act.id}>{act.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Notas compactas */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Notas
                        </label>
                        <textarea 
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[80px] transition-all resize-none"
                            placeholder="Motivo del registro..."
                            value={formData.descripcion}
                            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        />
                    </div>

                    {/* Botones */}
                    <div className="flex gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 h-11 bg-white text-slate-600 rounded-lg font-medium hover:bg-slate-50 transition-all border border-slate-200"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit" disabled={loading}
                            className="flex-1 h-11 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                            {loading ? '...' : 'Registrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
