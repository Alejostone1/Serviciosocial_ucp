import React from 'react';
import { Shield, QrCode } from 'lucide-react';
import Link from 'next/link';
import ValidarCertificadoForm from './validar-form';

export const metadata = { title: 'Validar Certificado' };

export default function ValidarCertificadoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo y título */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#8B1E1E] rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#1e293b] mb-2">
                        Validar Certificado
                    </h1>
                    <p className="text-gray-600">
                        Ingrese el código de verificación del certificado
                    </p>
                </div>

                {/* Formulario de validación */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                    <ValidarCertificadoForm />
                </div>

                {/* Enlaces de navegación */}
                <div className="mt-8 text-center">
                    <Link
                        href="/administrador/certificados"
                        className="text-[#8B1E1E] hover:text-[#7a1616] font-medium text-sm"
                    >
                        ← Panel de Administración
                    </Link>
                </div>

                {/* Footer informativo */}
                <div className="mt-8 text-center text-xs text-gray-500">
                    <p>
                        Sistema de Validación de Certificados de Servicio Social
                    </p>
                    <p className="mt-1">
                        Universidad Católica de Pereira © 2026
                    </p>
                </div>
            </div>
        </div>
    );
}
