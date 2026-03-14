'use client';

import Image from 'next/image';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    CheckCircle,
    XCircle,
    User,
    Building,
    Clock,
    Award,
    Calendar,
    QrCode,
    ExternalLink,
    Download,
    FileText
} from 'lucide-react';
import QRCode from 'qrcode';

interface ValidacionResult {
    valido: boolean;
    mensaje: string;
    datos: any;
}

interface ValidacionCertificadoClientProps {
    resultado: ValidacionResult;
    codigo: string;
}

export function ValidacionCertificadoClient({ resultado, codigo }: ValidacionCertificadoClientProps) {
    const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
    const [copiado, setCopiado] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const generarQR = async () => {
            try {
                const urlValidacion = `${window.location.origin}/validar-certificado/${codigo}`;
                const qr = await QRCode.toDataURL(urlValidacion, {
                    width: 200,
                    margin: 2,
                    color: {
                        dark: '#8B1E1E',
                        light: '#FFFFFF'
                    }
                });
                setQrCodeDataURL(qr);
            } catch (error) {
                console.error('Error al generar QR:', error);
            }
        };

        generarQR();
    }, [codigo]);

    const copiarAlPortapapeles = () => {
        navigator.clipboard.writeText(codigo);
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2000);
    };

    const descargarCertificado = () => {
        // Aquí podríamos implementar la descarga del certificado si está disponible
        window.print();
    };

    if (!resultado.valido) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-200 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle className="w-8 h-8 text-red-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-red-600 mb-4">Certificado Inválido</h1>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 font-medium">{resultado.mensaje}</p>
                    </div>

                    <div className="space-y-3 text-sm text-gray-600">
                        <p>Posibles razones:</p>
                        <ul className="text-left space-y-2 ml-4">
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span>El certificado ha sido anulado</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span>El código de verificación es incorrecto</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-red-500">•</span>
                                <span>El certificado ha expirado</span>
                            </li>
                        </ul>
                    </div>

                    <button
                        onClick={() => window.history.back()}
                        className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                        Volver
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <Shield className="w-6 h-6 text-[#8B1E1E]" />
                            <h1 className="text-xl font-bold text-[#1e293b]">Validación de Certificado</h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Sistema de Verificación de Autenticidad
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Certificado Válido */}
                    <div className="bg-white rounded-2xl shadow-lg border border-green-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-green-600 p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <CheckCircle className="w-8 h-8" />
                                <h2 className="text-2xl font-bold">Certificado Válido</h2>
                            </div>
                            <p className="text-green-100">
                                Este certificado es auténtico y se encuentra vigente en nuestros registros.
                            </p>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Información del estudiante */}
                            <div className="border-l-4 border-green-500 pl-4">
                                <h3 className="font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                                    <User className="w-5 h-5 text-green-600" />
                                    Datos del Estudiante
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Nombre:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.estudiante.primer_nombre} {resultado.datos.estudiante.primer_apellido}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Documento:</span>
                                        <span className="font-semibold font-mono">
                                            {resultado.datos.estudiante.numero_documento}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Programa:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.estudiante.programa?.nombre || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Facultad:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.estudiante.programa?.facultad?.nombre || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detalles del certificado */}
                            <div className="border-l-4 border-blue-500 pl-4">
                                <h3 className="font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                                    <Award className="w-5 h-5 text-blue-600" />
                                    Detalles del Certificado
                                </h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Horas:</span>
                                        <span className="font-bold text-green-600">
                                            {resultado.datos.total_horas} horas
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Período:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.periodo_desde && resultado.datos.periodo_hasta
                                                ? `${resultado.datos.periodo_desde} - ${resultado.datos.periodo_hasta}`
                                                : 'No definido'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Fecha Emisión:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.emitido_en}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Emitido por:</span>
                                        <span className="font-semibold">
                                            {resultado.datos.emisor?.primer_nombre} {resultado.datos.emisor?.primer_apellido}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Información de convocatoria si existe */}
                            {resultado.datos.convocatoria && (
                                <div className="border-l-4 border-purple-500 pl-4">
                                    <h3 className="font-bold text-[#1e293b] mb-3 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-purple-600" />
                                        Convocatoria Relacionada
                                    </h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Título:</span>
                                            <span className="font-semibold">
                                                {resultado.datos.convocatoria.titulo}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Categoría:</span>
                                            <span className="font-semibold">
                                                {resultado.datos.convocatoria.categoria?.nombre || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Código QR y Validación */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#8B1E1E] to-blue-900 p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <QrCode className="w-8 h-8" />
                                <h2 className="text-2xl font-bold">Código QR</h2>
                            </div>
                            <p className="text-blue-100">
                                Escanee este código QR para validar rápidamente el certificado
                            </p>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Código QR */}
                            <div className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    {qrCodeDataURL && (
                                        <Image
                                            src={qrCodeDataURL}
                                            alt="Código QR de validación"
                                            width={192}
                                            height={192}
                                            className="rounded-lg"
                                        />
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 mt-2">
                                    Código único de verificación
                                </p>
                            </div>

                            {/* Código de verificación */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700">
                                        Código de Verificación:
                                    </span>
                                    <button
                                        onClick={copiarAlPortapapeles}
                                        className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        {copiado ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Copiado
                                            </>
                                        ) : (
                                            <>
                                                <ExternalLink className="w-4 h-4" />
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                                <div className="font-mono text-lg bg-white border border-gray-300 rounded px-3 py-2 text-center">
                                    {codigo}
                                </div>
                            </div>

                            {/* Información de validación */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                                    <Shield className="w-4 h-4" />
                                    Información de Validación
                                </h4>
                                <div className="space-y-1 text-sm text-blue-700">
                                    <p>• Este certificado fue verificado digitalmente</p>
                                    <p>• La validez puede ser confirmada en cualquier momento</p>
                                    <p>• Los datos son auténticos y provienen del sistema oficial</p>
                                    <p>• Fecha de validación: {mounted ? new Date().toLocaleString() : 'Cargando...'}</p>
                                </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex gap-3">
                                <button
                                    onClick={descargarCertificado}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar Certificado
                                </button>
                                <button
                                    onClick={() => window.print()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                                >
                                    <FileText className="w-4 h-4" />
                                    Imprimir
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-gray-200 mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="text-center text-sm text-gray-500">
                        <p>© 2024 Universidad Católica de Pereira - Sistema de Servicio Social</p>
                        <p className="mt-1">
                            Para verificar la autenticidad de este certificado, visite:{' '}
                            <a
                                href={`/validar-certificado/${codigo}`}
                                className="text-blue-600 hover:underline font-medium"
                            >
                                /validar-certificado/{codigo}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
