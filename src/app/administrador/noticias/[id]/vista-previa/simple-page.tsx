import React from 'react';

export default function SimpleVistaPreviaPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">👁️ Vista Previa de Noticia (Simple)</h1>
                <p className="text-slate-600 mb-8">Esta es una versión simplificada para probar que la ruta funciona.</p>
                
                <div className="bg-white rounded-xl border border-slate-200 p-8">
                    <div className="space-y-6">
                        <div className="border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span>Por: Autor de Prueba</span>
                                <span>•</span>
                                <span>7 de marzo de 2026</span>
                                <span>•</span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Publicado</span>
                            </div>
                        </div>
                        
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">Título de Ejemplo de la Noticia</h2>
                            <div className="text-lg text-slate-700 mb-6 p-4 bg-slate-50 rounded-lg border-l-4 border-[#8B1E1E]">
                                Este es el resumen de ejemplo de la noticia. Aquí va una breve descripción que aparecerá en las vistas previas.
                            </div>
                            <div className="prose max-w-none">
                                <p className="text-slate-800 leading-relaxed">
                                    Este es el contenido completo de la noticia. Aquí iría todo el texto detallado de la noticia 
                                    que estamos viendo en vista previa. Esta es una versión simplificada para demostrar que la 
                                    ruta funciona correctamente.
                                </p>
                                <p className="text-slate-800 leading-relaxed mt-4">
                                    Si puedes ver esta página, significa que la ruta de vista previa está funcionando 
                                    correctamente y el problema está en el componente original o en los datos que se están 
                                    pasando.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex gap-4 pt-6 border-t border-slate-200">
                            <button className="px-6 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919]">
                                Editar Noticia
                            </button>
                            <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                                Volver al Listado
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">✅ Esta página funciona correctamente</h3>
                    <p className="text-sm text-blue-700">Si ves esto, la ruta está funcionando. El problema está en el componente original.</p>
                </div>
            </div>
        </div>
    );
}
