'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ChevronLeft, 
    Trash2, 
    Layers, 
    Users, 
    ShieldAlert, 
    GraduationCap, 
    MoveRight,
    Search,
    Check,
    Info,
    RotateCcw,
    FileText
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
    getDatosGestionEliminacion, 
    ejecutarEliminacionGobernanza 
} from '../../eliminar-actions';
import { InstitutionalLoader } from '@/components/ui/InstitutionalLoader';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Reasignacion {
    idPrograma: string;
    idNuevaFacultad: string | 'ELIMINAR';
    nombre: string;
}

export default function GestionEliminacionFacultad({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [executing, setExecuting] = useState(false);
    const [data, setData] = useState<any>(null);
    const [reasignaciones, setReasignaciones] = useState<Reasignacion[]>([]);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    const cargarDatos = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await getDatosGestionEliminacion(params.id);
            setData(resp);
            setReasignaciones(resp.facultad.programas.map((p: any) => ({
                idPrograma: p.id,
                idNuevaFacultad: '',
                nombre: p.nombre
            })));
        } catch (error) {
            console.error('Error al cargar datos:', error);
            toast.error('Error al cargar los datos');
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        cargarDatos();
    }, [cargarDatos]);

    const handleReasignar = (idProg: string, idFac: string | 'ELIMINAR') => {
        setReasignaciones(prev => prev.map(r => 
            r.idPrograma === idProg ? { ...r, idNuevaFacultad: idFac } : r
        ));
    };

    const isReady = reasignaciones.every(r => r.idNuevaFacultad !== '');

    const handleConfirmarEliminacion = async () => {
        setExecuting(true);
        try {
            await ejecutarEliminacionGobernanza(params.id, reasignaciones);
            toast.success('Protocolo de desvinculación ejecutado con éxito');
            router.replace('/administrador/facultades');
        } catch (error: any) {
            toast.error(error.message || 'Error en la ejecución del protocolo');
            setIsConfirmOpen(false);
        } finally {
            setExecuting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center space-y-6">
            <InstitutionalLoader />
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-stone-400">Verificando integridad de datos...</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
            {/* Minimalist Top Nav */}
            <nav className="fixed top-0 inset-x-0 h-20 bg-white/80 backdrop-blur-md border-b border-stone-200 z-[100] px-8">
                <div className="max-w-6xl mx-auto h-full flex items-center justify-between">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors py-2 group"
                    >
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span className="text-[11px] font-black uppercase tracking-widest">Volver</span>
                    </button>
                    
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Estado del Proceso</p>
                            <p className={cn(
                                "text-[11px] font-black uppercase tracking-widest",
                                isReady ? "text-green-600" : "text-amber-500"
                            )}>
                                {isReady ? 'Integridad Validada' : 'Pendiente de Definición'}
                            </p>
                        </div>
                        <button 
                            disabled={!isReady || executing}
                            onClick={() => setIsConfirmOpen(true)}
                            className={cn(
                                "px-8 py-3 rounded-md text-[11px] font-black uppercase tracking-[0.2em] transition-all border",
                                isReady 
                                    ? "bg-[#8B1E1E] border-[#8B1E1E] text-white hover:bg-[#721818] shadow-lg shadow-[#8B1E1E]/20" 
                                    : "bg-stone-100 border-stone-200 text-stone-300 cursor-not-allowed"
                            )}
                        >
                            {executing ? 'Procesando...' : 'Finalizar Protocolo'}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto pt-36 pb-24 px-8">
                {/* Protocol Header */}
                <header className="mb-16 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="h-0.5 w-12 bg-[#8B1E1E]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#8B1E1E]">Gobernanza Administrativa</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-stone-900">Protocolo de Desvinculación de <span className="text-stone-400">Facultad</span></h1>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-12 gap-y-2 pt-4">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Unidad:</span>
                            <span className="text-xs font-bold text-stone-700">{data.facultad.nombre}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Código:</span>
                            <span className="text-xs font-bold text-stone-700">{data.facultad.codigo || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-stone-400 uppercase">Programas:</span>
                            <span className="text-xs font-bold text-stone-700">{data.facultad.programas.length}</span>
                        </div>
                    </div>
                </header>

                {/* Technical Brief */}
                <div className="bg-white border border-stone-200 rounded-lg p-8 mb-16 space-y-6">
                    <div className="flex items-start gap-4">
                        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-1" />
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-widest">Información de Seguridad de Datos</h3>
                            <p className="text-sm text-stone-500 leading-relaxed font-light">
                                Según las políticas de integridad del sistema <span className="font-medium text-stone-700">UCP Pereira</span>, ningún programa académico puede quedar en estado de orfandad tras la eliminación de su facultad raíz. Debe decidir el destino administrativo para cada una de las siguientes unidades académicas.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-2 mb-4">
                        <h4 className="text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">Gestión de Unidades Académicas</h4>
                    </div>

                    <div className="divide-y divide-stone-100 border border-stone-200 bg-white rounded-lg overflow-hidden shadow-sm">
                        {data.facultad.programas.map((prog: any) => {
                            const reasignacion = reasignaciones.find(r => r.idPrograma === prog.id);
                            return (
                                <div key={prog.id} className="p-8 hover:bg-stone-50/50 transition-colors flex flex-col lg:flex-row gap-8 items-start lg:items-center">
                                    <div className="flex-1 space-y-3">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">{prog.nivel_formacion}</p>
                                            <h5 className="text-lg font-bold text-stone-800">{prog.nombre}</h5>
                                        </div>
                                        <div className="flex items-center gap-6 pt-2">
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                                <Users className="w-3 h-3" />
                                                {prog._count.usuarios} Estudiantes
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-tighter">
                                                <FileText className="w-3 h-3" />
                                                {prog._count.convocatorias} Convocatorias
                                            </div>
                                        </div>
                                    </div>

                                    <div className="w-full lg:w-96 flex flex-col gap-2">
                                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest pl-1">Asignación Administrativa</label>
                                        
                                        {reasignacion?.idNuevaFacultad ? (
                                            <div className="group relative flex items-center bg-stone-50 border border-stone-200 rounded-lg h-12 px-4 animate-in fade-in slide-in-from-right-2 duration-300 transition-all hover:border-[#8B1E1E]/30">
                                                <div className="flex-1 flex flex-col overflow-hidden">
                                                    <span className="text-[10px] font-black text-stone-300 uppercase tracking-tighter leading-none mb-0.5">Destino</span>
                                                    <span className="text-xs font-bold text-stone-700 truncate uppercase tracking-widest leading-none">
                                                        {reasignacion.idNuevaFacultad === 'ELIMINAR' ? '🗑 ELIMINACIÓN REQUERIDA' : '✓ REASIGNACIÓN CONFIRMADA'}
                                                    </span>
                                                </div>
                                                <button 
                                                    onClick={() => handleReasignar(prog.id, '')}
                                                    className="shrink-0 p-2 text-stone-300 hover:text-[#8B1E1E] transition-all hover:bg-white rounded-md shadow-sm border border-transparent hover:border-stone-100"
                                                    title="Modificar destino"
                                                >
                                                    <RotateCcw className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="relative group">
                                                <select 
                                                    value={reasignacion?.idNuevaFacultad || ''}
                                                    onChange={(e) => handleReasignar(prog.id, e.target.value)}
                                                    className="w-full h-12 bg-white border border-stone-200 rounded-lg px-4 pr-10 text-[11px] font-bold text-stone-500 uppercase tracking-widest appearance-none outline-none focus:ring-1 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-all cursor-pointer group-hover:border-stone-400 shadow-sm"
                                                >
                                                    <option value="">Seleccionar Nuevo Destino</option>
                                                    {prog._count.usuarios === 0 && prog._count.convocatorias === 0 && (
                                                        <optgroup label="ZONA DE ELIMINACIÓN">
                                                            <option value="ELIMINAR" className="text-[#8B1E1E] font-black italic">ELIMINAR ESTE PROGRAMA</option>
                                                        </optgroup>
                                                    )}
                                                    <optgroup label="REASIGNACIÓN INSTITUCIONAL">
                                                        {data.otrasFacultades.map((of: any) => (
                                                            <option key={of.id} value={of.id}>MOVER A: {of.nombre}</option>
                                                        ))}
                                                    </optgroup>
                                                </select>
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-300 group-hover:text-stone-500 transition-colors">
                                                    <ChevronLeft className="w-3.5 h-3.5 -rotate-90" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="mt-16 text-center space-y-4">
                    <p className="text-[9px] font-medium text-stone-400 leading-relaxed max-w-xl mx-auto uppercase tracking-widest">
                        La eliminación de una unidad básica de gobernanza requiere una auditoría técnica completa del núcleo académico. Esta acción quedará registrada en los logs de auditoría institucional.
                    </p>
                </div>
            </main>

            <ConfirmDialog 
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmarEliminacion}
                title="¿Confirmar Ejecución del Protocolo?"
                description="Se procederá con la reubicación de las unidades académicas y la eliminación definitiva de la facultad. Asegúrese de que todos los destinos sean correctos."
                confirmText="CONFIRMAR Y EJECUTAR"
                type="danger"
                isLoading={executing}
            />
        </div>
    );
}
