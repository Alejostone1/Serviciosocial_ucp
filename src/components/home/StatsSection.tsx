export function StatsSection() {
    const stats = [
        {
            value: "+45,000",
            label: "Horas de Impacto",
            description: "Dedicadas a la transformación"
        },
        {
            value: "1,250",
            label: "Estudiantes Activos",
            description: "Participando en el territorio"
        },
        {
            value: "150+",
            label: "Proyectos Sociales",
            description: "Vinculados actualmente"
        }
    ];

    return (
        <section className="py-20 bg-slate-900 relative overflow-hidden">
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('/grid.svg')] bg-center"></div>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

            <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex flex-col items-center md:items-start text-center md:text-left space-y-2">
                                <div className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                    {stat.value}
                                </div>
                                <div className="space-y-1">
                                    <div className="text-red-500 font-bold text-xs uppercase tracking-widest">
                                        {stat.label}
                                    </div>
                                    <div className="text-slate-400 text-sm font-medium">
                                        {stat.description}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
