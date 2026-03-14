import React from 'react';

export default function SimpleNuevaPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">📝 Crear Nueva Noticia (Simple)</h1>
                <p className="text-slate-600 mb-8">Esta es una versión simplificada para probar que la ruta funciona.</p>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Título *</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                placeholder="Ingresa un título claro y atractivo"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Resumen *</label>
                            <textarea 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24"
                                placeholder="Breve descripción que aparecerá en listados"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Contenido Completo *</label>
                            <textarea 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg h-48"
                                placeholder="Escribe el contenido completo de la noticia..."
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Autor *</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                                placeholder="Nombre completo del autor"
                            />
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <input type="checkbox" id="publicada" className="w-4 h-4 text-[#8B1E1E]" />
                            <label htmlFor="publicada" className="text-sm text-slate-700">
                                Publicar inmediatamente
                            </label>
                        </div>
                        
                        <div className="flex gap-4 pt-4">
                            <button className="px-6 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919]">
                                Crear Noticia
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
