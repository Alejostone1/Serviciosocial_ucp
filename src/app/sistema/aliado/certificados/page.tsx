'use client';

import React, { useState, useEffect } from 'react';
import { 
    Award, 
    Search, 
    Download,
    Loader2,
    Inbox,
    Calendar,
    User,
    FileText,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCertificadosEmitidosAliado } from '../actions';
import { toast } from 'sonner';

export default function AliadoCertificadosPage() {
    const [loading, setLoading] = useState(true);
    const [certificados, setCertificados] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getCertificadosEmitidosAliado();
            setCertificados(data);
        } catch (error) {
            toast.error('Error al cargar certificados');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const filteredCertificados = certificados.filter(c => 
        c.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.estudiante.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.convocatoria?.titulo || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="px-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Certificados Emitidos</h1>
                <p className="text-slate-500 text-lg font-normal mt-2 leading-relaxed max-w-2xl">
                    Visualiza los certificados de servicio social que has emitido a los estudiantes.
                </p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between px-2">
                <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1E3A8A] transition-colors" />
                    <input 
                        placeholder="Buscar por estudiante o convocatoria..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 h-11 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-[#1E3A8A]/5 focus:border-[#1E3A8A]/20 text-sm transition-all font-medium"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 opacity-30 grayscale">
                    <Loader2 className="w-10 h-10 text-slate-400 animate-spin mb-4" />
                    <p className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">Cargando certificados...</p>
                </div>
            ) : filteredCertificados.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCertificados.map((cert) => (
                        <div key={cert.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-2xl bg-[#1E3A8A]/5 flex items-center justify-center border border-[#1E3A8A]/10">
                                        <Award className="w-6 h-6 text-[#1E3A8A]" />
                                    </div>
                                    <div>
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest border",
                                            cert.esta_vigente 
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                : 'bg-slate-100 text-slate-500 border-slate-200'
                                        )}>
                                            {cert.esta_vigente ? 'Vigente' : 'No vigente'}
                                        </span>
                                    </div>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {new Date(cert.emitido_en).toLocaleDateString('es-CO')}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">
                                        {cert.estudiante.primer_nombre} {cert.estudiante.primer_apellido}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1 text-slate-400">
                                        <User className="w-3 h-3" />
                                        <span className="text-[10px] font-bold uppercase tracking-wider">{cert.estudiante.numero_documento}</span>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Proyecto</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {cert.convocatoria?.titulo || cert.nombre_convocatoria || 'N/A'}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-[10px] font-bold bg-white text-slate-500 px-2 py-0.5 rounded border border-slate-100">
                                            {cert.total_horas} horas
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                        <FileText className="w-3 h-3" />
                                        Código: {cert.codigo_verificacion.slice(0, 8)}...
                                    </div>
                                </div>

                                <button 
                                    className="w-full h-11 bg-slate-50 text-slate-600 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-[#1E3A8A] hover:text-white transition-all border border-slate-100 flex items-center justify-center gap-2"
                                    onClick={() => window.open(cert.url_pdf, '_blank')}
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar Certificado
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-40 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 border-dashed">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                        <Award className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin Certificados</h3>
                    <p className="text-slate-400 max-w-xs mx-auto font-medium">
                        No has emitido certificados de servicio social aún.
                    </p>
                </div>
            )}
        </div>
    );
}
