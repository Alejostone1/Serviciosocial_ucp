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
    Inbox
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
        <div className="max-w-7xl mx-auto space-y-12 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pt-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Centro de Validación</h1>
                    <p className="text-slate-500 font-medium text-sm">Validación técnica de horas de servicio social.</p>
                </div>
                <button 
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="h-12 px-8 bg-[#1E3A8A] text-white rounded-xl text-sm font-semibold hover:shadow-xl hover:shadow-blue-900/10 transition-all flex items-center gap-3 active:scale-95"
                >
                    <Plus className="w-4 h-4" /> Registrar Manualmente
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 w-full group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <input 
                        placeholder="Filtrar por nombre del estudiante o actividad..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full h-11 bg-white border border-slate-100 rounded-xl pl-11 pr-4 text-xs font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 transition-all placeholder:text-slate-300"
                    />
                </div>
                <button className="h-11 px-5 border border-slate-100 bg-white rounded-xl text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-colors">
                    <Filter className="w-3.5 h-3.5" /> Más filtros
                </button>
            </div>

            {loading ? (
                <div className="py-40 flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                    <p className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sincronizando expedientes...</p>
                </div>
            ) : filteredReportes.length > 0 ? (
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-2 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#FAFBFC] border-b border-slate-50">
                                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                                    <th className="px-8 py-5">Estudiante</th>
                                    <th className="px-8 py-5">Actividad y Proyecto</th>
                                    <th className="px-8 py-5">Reportado</th>
                                    <th className="px-8 py-5">Estado</th>
                                    <th className="px-8 py-5 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {filteredReportes.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-400">
                                                    {item.estudiante.primer_nombre.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800 leading-tight">{item.estudiante.primer_nombre} {item.estudiante.primer_apellido}</p>
                                                    <p className="text-[10px] font-medium text-slate-400 mt-0.5">{item.estudiante.numero_documento}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="max-w-[200px] sm:max-w-xs">
                                                <p className="text-sm font-medium text-slate-700 truncate">{item.actividad.nombre}</p>
                                                <p className="text-[10px] font-medium text-slate-300 truncate tracking-tight">{item.actividad.convocatoria.titulo}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-base font-semibold text-slate-900 tabular-nums">{item.horas_reportadas}</span>
                                                <span className="text-[10px] font-bold text-slate-300 uppercase">HRS</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En revisión</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button 
                                                onClick={() => handleValidar(item.id, item.horas_reportadas)}
                                                className="h-10 px-6 rounded-xl bg-slate-50 border border-slate-100 text-[#1E3A8A] text-xs font-bold uppercase tracking-widest hover:bg-[#1E3A8A] hover:text-white hover:border-[#1E3A8A] transition-all flex items-center justify-center gap-2 ml-auto"
                                            >
                                                Validar <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="py-32 flex flex-col items-center justify-center text-center bg-slate-50/30 rounded-[3rem] border-2 border-dashed border-slate-100">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6">
                        <CheckCircle2 className="w-6 h-6 text-emerald-100" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Sin reportes pendientes</h3>
                    <p className="text-xs font-medium text-slate-400 mt-2">Todos los registros activos han sido procesados.</p>
                </div>
            )}

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
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in-95 duration-300">
                <button onClick={onClose} className="absolute top-8 right-8 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                </button>

                <div className="mb-10 space-y-1">
                    <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Registro de Horas</h3>
                    <p className="text-sm text-slate-400 font-medium">Asignación manual de horas por soporte físico.</p>
                </div>

                <form className="space-y-8" onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Estudiante</label>
                            <select 
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-semibold focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all"
                                value={formData.id_estudiante}
                                onChange={(e) => setFormData({...formData, id_estudiante: e.target.value})}
                            >
                                <option value="">--- Buscar Estudiante ---</option>
                                {estudiantes.map(est => <option key={est.id} value={est.id}>{est.primer_nombre} {est.primer_apellido}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Convocatoria</label>
                            <select 
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-semibold focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all"
                                value={selectedConv}
                                onChange={(e) => setSelectedConv(e.target.value)}
                            >
                                <option value="">--- Seleccionar Proyecto ---</option>
                                {convocatorias.map(conv => <option key={conv.id} value={conv.id}>{conv.titulo}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Actividad</label>
                            <select 
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-xs font-semibold focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all disabled:opacity-20"
                                value={formData.id_actividad}
                                disabled={!selectedConv}
                                onChange={(e) => setFormData({...formData, id_actividad: e.target.value})}
                            >
                                <option value="">--- Elegir Actividad ---</option>
                                {actividades.map(act => <option key={act.id} value={act.id}>{act.nombre}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Horas</label>
                            <input 
                                type="number" step="0.5"
                                className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-semibold focus:ring-4 focus:ring-[#1E3A8A]/5 transition-all"
                                value={formData.horas}
                                onChange={(e) => setFormData({...formData, horas: parseFloat(e.target.value)})}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-widest pl-1">Notas de Auditoría</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-[#1E3A8A]/5 min-h-[100px] transition-all"
                            placeholder="Describe el motivo del registro manual (Ej: Soporte físico planilla)"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" disabled={loading}
                        className="w-full h-14 bg-[#1E3A8A] text-white rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-[#2563EB] transition-all shadow-lg shadow-blue-900/10 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        {loading ? 'Procesando...' : 'Generar y Validar Folio'}
                    </button>
                </form>
            </div>
        </div>
    );
}
