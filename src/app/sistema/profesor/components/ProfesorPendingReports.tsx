'use client';

import React, { useState, useEffect } from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle, ChevronRight, User, Loader2 } from 'lucide-react';
import { getReportesParaAprobacionFinal } from '../reportes/actions';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export function ProfesorPendingReports() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getReportesParaAprobacionFinal()
      .then(data => setReports(data.slice(0, 5)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'VALIDADO_AUXILIAR': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'PENDIENTE_VALIDACION': return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'EN_REVISION': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  if (loading) return (
    <div className="flex justify-center py-10 opacity-30 italic text-xs">
        <Loader2 className="w-4 h-4 animate-spin mr-2" /> Cargando pendientes...
    </div>
  );

  if (reports.length === 0) return (
    <div className="p-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-100 mb-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sin reportes pendientes</p>
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm shadow-slate-200/50 mb-6">
      <div className="divide-y divide-slate-50">
        {reports.map((report) => (
          <div key={report.id} className="p-5 hover:bg-slate-50 transition-all duration-300 group">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0 group-hover:bg-white transition-colors shadow-sm">
                <User className="h-4 w-4 text-slate-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <p className="text-sm font-bold text-slate-900 truncate tracking-tight">{report.estudiante.primer_nombre} {report.estudiante.primer_apellido}</p>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter shrink-0">{new Date(report.reportado_en).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mb-2.5 font-medium">{report.actividad.nombre}</p>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className={cn("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border", getStatusStyles(report.status))}>
                            {report.estado === 'VALIDADO_AUXILIAR' ? 'Validado Auxiliar' : 'Pendiente'}
                        </span>
                        <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                            {report.horas_reportadas}H
                        </span>
                    </div>
                    <Link href="/sistema/profesor/reportes" className="text-[10px] font-black text-[#8B1E1E] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                        Gestionar <ChevronRight className="w-3 h-3" />
                    </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
