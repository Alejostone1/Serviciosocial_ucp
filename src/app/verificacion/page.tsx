import React from 'react';
import { Navbar } from '@/components/home/Navbar';
import { Footer } from '@/components/home/Footer';
import { SearchCheck, FileBadge, ShieldCheck, AlertCircle } from 'lucide-react';
import { validarCertificado } from '@/app/administrador/certificados/actions';
import { ValidacionCertificadoClient } from '@/app/validar-certificado/[codigo]/validacion-client';
import Link from 'next/link';

export const metadata = {
    title: 'Verificación de Certificados | Servicio Social UCP',
};

export default async function VerificacionPage({ 
    searchParams 
}: { 
    searchParams: { codigo?: string } 
}) {
    const codigo = searchParams.codigo;
    let resultado = null;

    if (codigo) {
        resultado = await validarCertificado(codigo);
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
                {codigo ? (
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8 flex items-center justify-between">
                            <Link 
                                href="/verificacion"
                                className="text-sm font-medium text-[#8B1E1E] hover:underline flex items-center gap-2"
                            >
                                ← Realizar otra búsqueda
                            </Link>
                            <div className="text-xs text-gray-400 font-mono">
                                Mostrando resultados para: {codigo}
                            </div>
                        </div>
                        
                        {/* Reutilizamos el componente de validación visual premium */}
                        <ValidacionCertificadoClient resultado={resultado as any} codigo={codigo} />
                        
                        {!resultado?.valido && (
                            <div className="mt-8 max-w-md mx-auto p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div className="text-sm text-amber-800">
                                    <p className="font-bold mb-1">¿No encuentras el certificado?</p>
                                    <p>Asegúrate de haber ingresado el código completo de 36 caracteres incluyendo los guiones. Los certificados antiguos podrían haber cambiado de formato.</p>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-12">
                        {/* Lado izquierdo: Textos explicativos */}
                        <div className="space-y-8">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                                    Verificación de<br />
                                    <span className="text-[#8B1E1E]">Certificados Digitales</span>
                                </h1>
                                <p className="text-lg text-gray-600 leading-relaxed">
                                    Verifique la autenticidad y validez de los certificados de Servicio Social emitidos por la Universidad Católica de Pereira usando el código alfa-numérico de seguridad.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1 h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-[#8B1E1E]">1</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Localiza el código</h3>
                                        <p className="text-sm text-gray-600">Encuentra el código único de verificación ubicado en la parte inferior del certificado físico o digital.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="shrink-0 mt-1 h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-[#8B1E1E]">2</div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Ingresa y valida</h3>
                                        <p className="text-sm text-gray-600">Ingresa el código en el formulario para acceder al documento original almacenado en nuestra base de datos.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lado derecho: Tarjeta de búsqueda */}
                        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-12 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <FileBadge className="h-48 w-48 text-[#8B1E1E]" />
                            </div>

                            <div className="relative z-10">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Validar Documento</h2>
                                <p className="text-gray-500 mb-8">Ingresa el código seguro completo generado en tu certificado.</p>

                                <form action="/verificacion" method="GET" className="space-y-6">
                                    <div>
                                        <label htmlFor="codigo" className="block text-sm font-medium text-gray-700 mb-2">
                                            Código de Certificado
                                        </label>
                                        <input
                                            type="text"
                                            id="codigo"
                                            name="codigo"
                                            required
                                            placeholder="XXXXXXXX-XXXX-XXXX-XXXXXXXXXXXX"
                                            className="block w-full px-5 py-4 text-lg font-mono uppercase border border-gray-300 rounded-xl bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 focus:border-[#8B1E1E] focus:bg-white transition-all shadow-inner"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full flex items-center justify-center py-4 px-8 border border-transparent rounded-xl shadow-md text-lg font-bold text-white bg-[#8B1E1E] hover:bg-[#731919] transition-all transform hover:-translate-y-1 gap-3"
                                    >
                                        <SearchCheck className="h-6 w-6" />
                                        Verificar Certificado
                                    </button>
                                </form>

                                <div className="mt-8 text-center text-xs text-gray-400 flex items-center justify-center gap-2">
                                    <ShieldCheck className="h-4 w-4" />
                                    Validación oficial vinculada a base de datos UCP
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
}
