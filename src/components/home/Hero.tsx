import Link from "next/link";
import { ArrowRight, Info } from "lucide-react";
import { UCPLogo } from "@/components/ui/UCPLogo";

export function Hero() {
    return (
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-900">
            {/* Background Image Setup */}
            <div
                className="absolute inset-0 w-full h-full z-0"
                style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2670&auto=format&fit=crop')",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat"
                }}
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10" />

            {/* Content */}
            <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center h-full pt-20 pb-28">
                <div className="max-w-5xl mx-auto space-y-6 animate-fade-in flex flex-col items-center">

                    {/* Removed badge - cleaner design */}

                    {/* Título Principal */}
                    <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white tracking-tight leading-[1.05] drop-shadow-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Servicio Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-200 to-gray-400">Universitario</span>
                    </h1>

                    {/* Subtítulo */}
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white/90 tracking-tight mt-6" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Universidad Católica de Pereira
                    </h2>

                    {/* Texto Descriptivo */}
                    <p className="mt-8 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed tracking-wide" style={{ fontFamily: 'Arial, sans-serif' }}>
                        Transformando realidades a través del compromiso social, la ética y la formación integral de nuestros estudiantes.
                    </p>

                    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-xl text-white bg-[#8B1E1E] hover:bg-[#731919] hover:shadow-lg hover:shadow-[#8B1E1E]/20 transition-all duration-300 gap-2 focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            Empezar Ahora
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <Link
                            href="/convocatorias"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-white/30 text-base font-bold rounded-xl text-white hover:bg-white/10 hover:border-white/50 transition-all duration-300 gap-2 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            <Info className="h-5 w-5" />
                            Conocer Más
                        </Link>
                    </div>
                </div>
            </div>

            {/* Very subtle transition */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50/30 to-transparent z-20 pointer-events-none" />
        </section>
    );
}
