export default function TestSimplePage() {
    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-900 mb-4">🧪 Test Simple Admin</h1>
                <p className="text-slate-600 mb-8">Esta es una prueba directa en el administrador.</p>
                
                <div className="bg-white rounded-xl border border-slate-200 p-6">
                    <h2 className="text-xl font-semibold text-slate-900 mb-4">Información:</h2>
                    <div className="space-y-2 text-slate-700">
                        <p>✅ Estás en: /(sistema)/administrador/test-simple</p>
                        <p>✅ Si ves esto, el layout del administrador funciona</p>
                        <p>✅ El problema está específicamente en las rutas de noticias</p>
                    </div>
                </div>

                <div className="mt-8 bg-blue-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">🔍 Diagnóstico:</h3>
                    <p className="text-blue-800">
                        Si esta página funciona pero las noticias no, el problema está en:
                    </p>
                    <ul className="text-blue-800 mt-2 space-y-1">
                        <li>• El componente AdminSidebar</li>
                        <li>• El componente AdminHeader</li>
                        <li>• Alguna dependencia en las páginas de noticias</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
