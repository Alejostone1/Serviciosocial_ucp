import React from 'react';
import { CertificadosDashboardClient } from './certificados-dashboard-client';
import { getCertificados } from './actions';
import { Award, Download, Search, Filter, Shield, CheckCircle, XCircle } from 'lucide-react';

export const metadata = { title: 'Gestión de Certificados | Administrador' };

export default async function CertificadosPage() {
    const certificados = await getCertificados();

    const estadisticas = {
        total: certificados.length,
        vigentes: certificados.filter(c => c.esta_vigente).length,
        anulados: certificados.filter(c => !c.esta_vigente).length,
        delMes: certificados.filter(c => {
            const fecha = new Date(c.emitido_en);
            const ahora = new Date();
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        }).length
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Award className="w-6 h-6 text-[#8B1E1E]" />
                        <h1 className="text-2xl font-bold text-[#1e293b]">Gestión de Certificados</h1>
                    </div>
                    <p className="text-[#64748b] text-sm">Sistema de emisión y validación de certificados de servicio social con QR</p>
                </div>
                <div className="flex items-center gap-2">
                    <a
                        href="/validar-certificado"
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors text-sm font-semibold"
                    >
                        <Shield className="w-4 h-4" />
                        Validar Certificado
                    </a>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Award className="w-5 h-5 text-blue-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.total}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Total Certificados</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Emitidos en el sistema</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.vigentes}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Vigentes</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Certificados válidos</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-red-50 rounded-lg">
                            <XCircle className="w-5 h-5 text-red-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.anulados}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Anulados</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Certificados inválidos</p>
                </div>

                <div className="bg-white rounded-xl border border-[#e2e8f0] p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <div className="p-2 bg-orange-50 rounded-lg">
                            <Download className="w-5 h-5 text-orange-600" />
                        </div>
                        <span className="text-2xl font-bold text-[#1e293b]">{estadisticas.delMes}</span>
                    </div>
                    <p className="text-sm font-semibold text-[#1e293b]">Del Mes</p>
                    <p className="text-xs text-[#94a3b8] mt-1">Emitidos este mes</p>
                </div>
            </div>

            {/* Dashboard principal */}
            <CertificadosDashboardClient certificados={certificados} />
        </div>
    );
}
