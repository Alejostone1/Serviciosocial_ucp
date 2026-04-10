export function Footer() {
    return (
        <footer className="w-full mt-auto border-t border-slate-200 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="py-6 flex flex-col md:flex-row items-center justify-between text-sm text-slate-500">
                    <p>
                        <span className="font-semibold text-slate-700">Sistema de Servicio Social</span>
                        {' '}— Universidad Católica de Pereira
                    </p>
                    <p className="mt-2 md:mt-0">
                        &copy; 2026 Todos los derechos reservados
                    </p>
                </div>
            </div>
        </footer>
    );
}
