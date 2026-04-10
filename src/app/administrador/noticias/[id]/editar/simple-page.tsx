import React from 'react';

export default function SimpleEditPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">✏️ Editar Noticia (Simple)</h1>
                <p className="text-slate-600 mb-8">Esta es una versión simplificada para probar que la ruta funciona.</p>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Título</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                placeholder="Título de la noticia"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Contenido</label>
                            <textarea 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg h-32"
                                placeholder="Contenido de la noticia"
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <button className="px-6 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919]">
                                Guardar Cambios
                            </button>
                            <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50">
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="font-semibold text-green-800 mb-2">✅ Esta página funciona correctamente</h3>
                    <p className="text-sm text-green-700">Si ves esto, la ruta está funcionando. El problema está en el componente original.</p>
                </div>
            </div>
        </div>
    );
}
