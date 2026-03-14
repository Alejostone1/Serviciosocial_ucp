'use client';

import React, { useState } from 'react';
import { Search, QrCode, Info } from 'lucide-react';

export default function ValidarCertificadoForm() {
    const [codigo, setCodigo] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (codigo.trim()) {
            window.location.href = `/validar-certificado/${codigo}`;
        }
    };

    return (
        <>
            <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                        Código de Verificación
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <QrCode className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            id="codigo"
                            name="codigo"
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value)}
                            required
                            placeholder="Ingrese el código único del certificado"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E] focus:border-[#8B1E1E] text-lg"
                            pattern="[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}"
                            title="Formato: XXXXXXXX-XXXX-XXXX-XXXXXXXXXXXX"
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                        Formato: XXXXXXXX-XXXX-XXXX-XXXXXXXXXXXX
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#7a1616] transition-colors font-semibold text-lg"
                >
                    <Search className="w-5 h-5" />
                    Validar Certificado
                </button>
            </form>

            {/* Información adicional */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    ¿Cómo encontrar el código?
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• El código se encuentra en la esquina inferior derecha del certificado</li>
                    <li>• También puede escanear el código QR impreso en el documento</li>
                    <li>• El código es único y está vinculado directamente al certificado</li>
                </ul>
            </div>
        </>
    );
}
