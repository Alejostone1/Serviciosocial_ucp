export default function NoticiasDirectasPage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">📰 Noticias (Ruta Directa)</h1>
                <p className="text-slate-600 mb-8">Esta es una prueba con ruta directa sin carpetas anidadas.</p>
                
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-green-900 mb-3">✅ Si ves esta página, el problema está en:</h2>
                    <ul className="text-green-800 space-y-2">
                        <li>1. La estructura de carpetas anidadas</li>
                        <li>2. El componente original page.tsx</li>
                        <li>3. Alguna dependencia rota</li>
                    </ul>
                </div>

                <div className="mt-8 bg-white rounded-xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Enlaces de Prueba:</h3>
                    <div className="space-y-3">
                        <a href="/(sistema)/administrador/noticias" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100">
                            📁 Noticias (ruta original)
                        </a>
                        <a href="/(sistema)/administrador/noticias/nueva" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100">
                            ➕ Nueva Noticia
                        </a>
                        <a href="/(sistema)/administrador/noticias/debug" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100">
                            🔍 Debug Noticias
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
