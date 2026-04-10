'use client';

import React, { useState, useEffect } from 'react';
import { 
    Users, 
    Search, 
    Plus, 
    Filter, 
    Loader2,
    Mail,
    FileSearch,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getEstudiantesAliado } from '../actions';
import { toast } from 'sonner';
import Link from 'next/link';

interface Estudiante {
    id: string;
    nombreCompleto: string;
    documento: string;
    correo: string;
    programa: string;
    horasAcumuladas: number;
    horasRequeridas: number;
}

export default function AliadoEstudiantesPage() {
    const [loading, setLoading] = useState(true);
    const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const data = await getEstudiantesAliado();
                setEstudiantes(data);
            } catch (error) {
                toast.error('Error al cargar estudiantes asociados');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const filtered = (estudiantes || []).filter(e => 
        e.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.documento.includes(searchTerm) ||
        e.programa.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-[1440px] mx-auto space-y-8 pb-20 px-4 md:px-0 animate-in fade-in duration-700">
            {/* Header Profesional */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 py-2 border-b border-slate-50">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#8B1E1E]" />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Base de Datos de Aliados</span>
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Estudiantes Asociados</h1>
                        <p className="text-slate-500 font-medium leading-relaxed max-w-2xl">
                            Gestiona los estudiantes vinculados a tus convocatorias y monitorea su progreso.
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-10 px-4 rounded-lg bg-[#8B1E1E] text-white flex items-center gap-2 text-sm font-semibold hover:bg-[#A02424] transition-all shadow-lg shadow-red-900/10">
                        <Download className="w-3.5 h-3.5" /> Exportar
                    </button>
                </div>
            </div>

            {/* Búsqueda y Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 preserve-3d" style={{
                transform: 'perspective(1000px) rotateX(2deg) translateZ(8px)',
                boxShadow: '0 15px 30px -8px rgba(0, 0, 0, 0.12)'
            }}>
                <div className="relative w-full sm:w-96 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#8B1E1E] transition-colors" />
                    <input 
                        placeholder="Buscar por nombre, programa o documento..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest ml-auto">
                    <Filter className="w-3.5 h-3.5" />
                    Mostrando <span className="text-slate-900">{filtered.length}</span> Estudiantes
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-40 bg-white rounded-3xl border border-slate-100 border-dashed hover:shadow-2xl transition-all duration-300 preserve-3d" style={{
                    transform: 'perspective(1000px) rotateX(2deg) translateZ(10px)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12)'
                }}>
                    <Loader2 className="w-10 h-10 text-slate-200 animate-spin mb-4" />
                    <p className="text-slate-600 font-medium">Sincronizando perfiles académicos...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((student) => {
                        const progress = Math.min((student.horasAcumuladas / student.horasRequeridas) * 100, 100);
                        const isCompleted = progress >= 100;

                        return (
                            <div key={student.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-lg hover:border-[#8B1E1E]/20 hover:shadow-2xl hover:shadow-slate-200/50 transition-all group preserve-3d" style={{
                                transform: 'perspective(1000px) rotateX(3deg) translateZ(15px)',
                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
                            }}>
                                <div className="flex justify-between items-start mb-6">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-bold border border-slate-100 group-hover:bg-[#8B1E1E] group-hover:text-white group-hover:border-[#8B1E1E] transition-all duration-300 shadow-md text-xs" style={{
                                        transform: 'translateZ(20px) rotateY(-5deg)',
                                        boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.15)'
                                    }}>
                                    </div>
                                    <div className={cn(
                                        "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest border transition-all duration-300",
                                        isCompleted ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                    )} style={{
                                        transform: 'translateZ(10px)',
                                        boxShadow: isCompleted ? '0 4px 8px -2px rgba(16, 185, 129, 0.2)' : '0 4px 8px -2px rgba(0, 0, 0, 0.1)'
                                    }}>
                                        {isCompleted ? 'Culminado' : 'En Proceso'}
                                    </div>
                                </div>
                                
                                <div className="space-y-1 mb-6 min-h-[56px]">
                                    <h3 className="text-lg font-semibold text-slate-900 leading-tight group-hover:text-[#8B1E1E] transition-colors">{student.nombreCompleto}</h3>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest truncate">{student.programa}</p>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Horas Reportadas</p>
                                            <p className="text-2xl font-bold text-slate-900 leading-none">{student.horasAcumuladas} <span className="text-sm text-slate-300 font-medium">/ {student.horasRequeridas}</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold text-slate-900 leading-none">{Math.round(progress)}%</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-50" style={{
                                    transform: 'translateZ(5px)',
                                    boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                                }}>
                                        <div 
                                            className={cn(
                                                "h-full rounded-full transition-all duration-1000",
                                                isCompleted ? "bg-emerald-500" : "bg-[#8B1E1E]"
                                            )} 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex gap-2">
                                    <Link 
                                        href={`/sistema/aliado/estudiantes/${student.id}`}
                                        className="flex-1 h-10 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold uppercase tracking-widest hover:bg-[#8B1E1E] hover:text-white transition-all flex items-center justify-center gap-2 border border-slate-50"
                                    >
                                        <FileSearch className="w-3 h-3" /> Ver Detalle
                                    </Link>
                                    <a 
                                        href={`mailto:${student.correo}`}
                                        className="h-10 w-10 bg-slate-50 text-slate-400 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-50"
                                    >
                                        <Mail className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {!loading && filtered.length === 0 && (
                <div className="py-32 text-center bg-white rounded-3xl border border-slate-100 border-dashed hover:shadow-2xl transition-all duration-300 preserve-3d" style={{
                    transform: 'perspective(1000px) rotateX(1deg) translateZ(5px)',
                    boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.08)'
                }}>
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100" style={{
                        transform: 'translateZ(15px) rotateY(10deg)',
                        boxShadow: '0 10px 20px -5px rgba(0, 0, 0, 0.15)'
                    }}>
                        <Users className="w-6 h-6 text-slate-200" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Sin estudiantes asociados</h3>
                    <p className="text-slate-500 font-medium">No hay estudiantes vinculados a tus convocatorias aún.</p>
                </div>
            )}
        </div>
    );
}
