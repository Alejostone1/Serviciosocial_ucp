'use client';

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    Download,
    FileText,
    Search,
    Filter,
    Shield,
    CheckCircle,
    XCircle,
    Eye,
    Trash2,
    QrCode,
    Award,
    Calendar,
    User,
    Building,
    Clock
} from 'lucide-react';
import { DataTable, ColumnDef } from '@/components/ui/data-table';
import { StatusBadge } from '@/components/ui/status-badge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { toast } from 'sonner';
import { generarPDFCertificado, anularCertificado } from './actions';

interface Certificado {
    id: string;
    id_estudiante: string;
    id_convocatoria: string | null;
    emitido_por: string;
    total_horas: number;
    periodo_desde: string | null;
    periodo_hasta: string | null;
    codigo_verificacion: string;
    url_pdf: string | null;
    descripcion: string | null;
    nombre_aliado: string | null;
    nombre_convocatoria: string | null;
    emitido_en: string;
    esta_vigente: boolean;
    motivo_anulacion: string | null;
    estudiante: {
        id: string;
        primer_nombre: string;
        segundo_nombre: string | null;
        primer_apellido: string;
        segundo_apellido: string | null;
        numero_documento: string;
        correo: string;
        programa: {
            id: string;
            nombre: string;
            facultad: {
                id: string;
                nombre: string;
            };
        } | null;
        perfil_estudiante: {
            horas_acumuladas: number;
        } | null;
    };
    convocatoria: {
        id: string;
        titulo: string;
        categoria: {
            id: string;
            nombre: string;
        } | null;
    } | null;
    emisor: {
        primer_nombre: string;
        primer_apellido: string;
        correo: string;
    };
}

interface CertificadosDashboardClientProps {
    certificados: Certificado[];
}

export function CertificadosDashboardClient({ certificados }: CertificadosDashboardClientProps) {
    const [filteredCertificados, setFilteredCertificados] = useState<Certificado[]>(certificados);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCertificado, setSelectedCertificado] = useState<Certificado | null>(null);
    const [isAnularDialogOpen, setIsAnularDialogOpen] = useState(false);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState<string | null>(null);
    const [anulacionMotivo, setAnulacionMotivo] = useState('');
    const [filters, setFilters] = useState({
        estado: 'todos',
        programa: '',
        facultad: '',
        fechaDesde: null as Date | null,
        fechaHasta: null as Date | null
    });

    // Aplicar filtros
    useEffect(() => {
        let filtered = certificados;

        // Filtro de búsqueda
        if (searchTerm) {
            filtered = filtered.filter(cert =>
                cert.estudiante.primer_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.estudiante.primer_apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.estudiante.numero_documento.includes(searchTerm) ||
                cert.codigo_verificacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                cert.estudiante.programa?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filtro de estado
        if (filters.estado !== 'todos') {
            filtered = filtered.filter(cert =>
                filters.estado === 'vigente' ? cert.esta_vigente : !cert.esta_vigente
            );
        }

        // Filtro de programa
        if (filters.programa) {
            filtered = filtered.filter(cert =>
                cert.estudiante.programa?.nombre.toLowerCase().includes(filters.programa.toLowerCase())
            );
        }

        // Filtro de facultad
        if (filters.facultad) {
            filtered = filtered.filter(cert =>
                cert.estudiante.programa?.facultad.nombre.toLowerCase().includes(filters.facultad.toLowerCase())
            );
        }

        // Filtro de fechas
        if (filters.fechaDesde) {
            filtered = filtered.filter(cert => {
                if (!cert.emitido_en) return false;
                try {
                    return new Date(cert.emitido_en) >= filters.fechaDesde!;
                } catch (error) {
                    return false;
                }
            });
        }

        if (filters.fechaHasta) {
            filtered = filtered.filter(cert => {
                if (!cert.emitido_en) return false;
                try {
                    return new Date(cert.emitido_en) <= filters.fechaHasta!;
                } catch (error) {
                    return false;
                }
            });
        }

        setFilteredCertificados(filtered);
    }, [certificados, searchTerm, filters]);

    const handleGeneratePDF = async (certificado: Certificado) => {
        setIsGeneratingPDF(certificado.id);
        const toastId = toast.loading('Generando PDF del certificado...');

        try {
            const pdfBase64 = await generarPDFCertificado(certificado.id);

            // Convertir Base64 a Blob de forma segura
            const byteCharacters = atob(pdfBase64);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: 'application/pdf' });

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Certificado-${certificado.estudiante.primer_nombre}-${certificado.estudiante.primer_apellido}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success('✅ PDF generado exitosamente', { id: toastId });
        } catch (error) {
            toast.error('Error al generar PDF', { id: toastId });
        } finally {
            setIsGeneratingPDF(null);
        }
    };

    const handleAnularCertificado = async () => {
        if (!selectedCertificado || !anulacionMotivo.trim()) return;

        try {
            await anularCertificado(selectedCertificado.id, anulacionMotivo);
            toast.success('✅ Certificado anulado exitosamente');
            setIsAnularDialogOpen(false);
            setSelectedCertificado(null);
            setAnulacionMotivo('');
            window.location.reload();
        } catch (error) {
            toast.error('Error al anular certificado');
        }
    };

    const columns: ColumnDef<Certificado>[] = [
        {
            header: 'Estudiante',
            cell: (certificado) => (
                <div className="min-w-0">
                    <p className="font-bold text-[#1e293b]">
                        {certificado.estudiante.primer_nombre} {certificado.estudiante.primer_apellido}
                    </p>
                    <p className="text-xs text-[#94a3b8] font-mono break-all">{certificado.estudiante.numero_documento}</p>
                    <p className="text-xs text-[#64748b] break-all">{certificado.estudiante.correo}</p>
                </div>
            ),
        },
        {
            header: 'Programa/Facultad',
            cell: (certificado) => (
                <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#1e293b] truncate">
                        {certificado.estudiante.programa?.nombre || 'N/A'}
                    </p>
                    <p className="text-xs text-[#64748b] truncate">
                        {certificado.estudiante.programa?.facultad.nombre || 'N/A'}
                    </p>
                </div>
            ),
        },
        {
            header: 'Horas',
            cell: (certificado) => (
                <div className="text-sm">
                    <div className="font-bold text-[#8B1E1E]">{certificado.total_horas}h</div>
                    <div className="text-[#94a3b8]">Totales</div>
                </div>
            ),
        },
        {
            header: 'Período',
            cell: (certificado) => (
                <div className="text-xs">
                    {certificado.periodo_desde && certificado.periodo_hasta ? (
                        <>
                            <div>Desde: {certificado.periodo_desde}</div>
                            <div>Hasta: {certificado.periodo_hasta}</div>
                        </>
                    ) : (
                        <span className="text-[#94a3b8]">Sin período definido</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Código',
            cell: (certificado) => (
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <button
                        onClick={() => navigator.clipboard.writeText(certificado.codigo_verificacion)}
                        className="text-left text-xs font-mono bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-[#1e293b] transition-colors max-w-[170px] truncate"
                        title="Clic para copiar código completo"
                    >
                        {certificado.codigo_verificacion.substring(0, 8)}...
                    </button>
                    <button
                        onClick={() => window.open(`/administrador/validar-certificado/${certificado.codigo_verificacion}`, '_blank')}
                        className="inline-flex items-center gap-1 p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title={`Ver código completo: ${certificado.codigo_verificacion}`}
                    >
                        <QrCode className="w-4 h-4" />
                        <span className="text-[11px] font-semibold">Verificar</span>
                    </button>
                </div>
            ),
        },
        {
            header: 'Estado',
            cell: (certificado) => (
                <StatusBadge
                    status={certificado.esta_vigente ? 'VIGENTE' : 'ANULADO'}
                />
            ),
        },
        {
            header: 'Fecha Emisión',
            cell: (certificado) => {
                if (!certificado.emitido_en) {
                    return (
                        <div className="text-xs text-gray-500">
                            <div>Sin fecha</div>
                        </div>
                    );
                }
                
                try {
                    const fecha = new Date(certificado.emitido_en);
                    // Validar que la fecha sea válida
                    if (isNaN(fecha.getTime())) {
                        return (
                            <div className="text-xs text-red-500">
                                <div>Fecha inválida</div>
                            </div>
                        );
                    }
                    
                    return (
                        <div className="text-xs">
                            <div>{format(fecha, 'dd/MM/yyyy', { locale: es })}</div>
                            <div className="text-[#94a3b8]">
                                {format(fecha, 'HH:mm:ss', { locale: es })}
                            </div>
                        </div>
                    );
                } catch (error) {
                    return (
                        <div className="text-xs text-red-500">
                            <div>Error de fecha</div>
                        </div>
                    );
                }
            },
        },
        {
            header: 'Acciones',
            cell: (certificado) => (
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.open(`/administrador/validar-certificado/${certificado.codigo_verificacion}`, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-all active:scale-95"
                        title="Validar certificado en línea"
                    >
                        <Shield className="w-4 h-4" />
                        <span>Validar</span>
                    </button>

                    <button
                        onClick={() => handleGeneratePDF(certificado)}
                        disabled={isGeneratingPDF === certificado.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar Diploma PDF"
                    >
                        {isGeneratingPDF === certificado.id ? (
                            <div className="w-4 h-4 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <Download className="w-4 h-4" />
                        )}
                        <span>{isGeneratingPDF === certificado.id ? 'Generando...' : 'Descargar'}</span>
                    </button>

                    {certificado.esta_vigente && (
                        <button
                            onClick={() => {
                                setSelectedCertificado(certificado);
                                setIsAnularDialogOpen(true);
                            }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200 transition-all active:scale-95"
                            title="Anular certificado permanentemente"
                        >
                            <XCircle className="w-4 h-4" />
                            <span>Anular</span>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    const clearFilters = () => {
        setFilters({
            estado: 'todos',
            programa: '',
            facultad: '',
            fechaDesde: null,
            fechaHasta: null
        });
        setSearchTerm('');
    };

    return (
        <div className="space-y-6">
            {/* Barra de búsqueda y filtros */}
            <div className="bg-white rounded-xl border border-[#e2e8f0] p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, documento, código o programa..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>

                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 text-gray-600 hover:text-gray-800"
                        >
                            Limpiar
                        </button>
                    </div>
                </div>

                {/* Panel de filtros avanzados */}
                {showFilters && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                                <select
                                    value={filters.estado}
                                    onChange={(e) => setFilters(prev => ({ ...prev, estado: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="todos">Todos</option>
                                    <option value="vigente">Vigentes</option>
                                    <option value="anulados">Anulados</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Programa</label>
                                <input
                                    type="text"
                                    placeholder="Filtrar por programa..."
                                    value={filters.programa}
                                    onChange={(e) => setFilters(prev => ({ ...prev, programa: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Facultad</label>
                                <input
                                    type="text"
                                    placeholder="Filtrar por facultad..."
                                    value={filters.facultad}
                                    onChange={(e) => setFilters(prev => ({ ...prev, facultad: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha Emisión</label>
                                <input
                                    type="date"
                                    value={filters.fechaDesde ? filters.fechaDesde.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, fechaDesde: e.target.value ? new Date(e.target.value) : null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm mb-2"
                                    placeholder="Desde"
                                />
                                <input
                                    type="date"
                                    value={filters.fechaHasta ? filters.fechaHasta.toISOString().split('T')[0] : ''}
                                    onChange={(e) => setFilters(prev => ({ ...prev, fechaHasta: e.target.value ? new Date(e.target.value) : null }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    placeholder="Hasta"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Tabla de certificados */}
            <div className="bg-white rounded-xl border border-[#e2e8f0]">
                <DataTable
                    columns={columns}
                    data={filteredCertificados}
                    searchPlaceholder="Buscar certificado..."
                    emptyMessage="No se encontraron certificados que coincidan con los filtros aplicados."
                />
            </div>

            {/* Diálogo de anulación */}
            <ConfirmDialog
                isOpen={isAnularDialogOpen}
                onClose={() => {
                    setIsAnularDialogOpen(false);
                    setSelectedCertificado(null);
                    setAnulacionMotivo('');
                }}
                onConfirm={handleAnularCertificado}
                title="Anular Certificado"
                description={`¿Está seguro que desea anular el certificado de ${selectedCertificado?.estudiante.primer_nombre} ${selectedCertificado?.estudiante.primer_apellido}? Esta acción no se puede deshacer.`}
                confirmText="Sí, Anular"
                type="danger"
            />
        </div>
    );
}
