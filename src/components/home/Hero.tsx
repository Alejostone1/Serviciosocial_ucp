import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Info } from "lucide-react";

export function Hero() {
    return (
        <section className="relative w-full min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900">
            {/* Optimized Background Image */}
            <div className="absolute inset-0 w-full h-full z-0">
                <Image
                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=2000&auto=format&fit=crop"
                    alt="Estudiantes UCP"
                    fill
                    priority
                    className="object-cover object-center opacity-40 scale-105"
                    sizes="100vw"
                    quality={85}
                />
            </div>

            {/* Content Container */}
            <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center pt-20">
                <div className="max-w-4xl mx-auto space-y-8">
                    
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white tracking-tight leading-[1.1]">
                            Servicio Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD7D7] to-white/70">Universitario</span>
                        </h1>
                        
                        <h2 className="text-2xl md:text-3xl font-semibold text-red-500 tracking-wide uppercase">
                            Universidad Católica de Pereira
                        </h2>
                    </div>

                    <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto font-medium leading-relaxed animate-in fade-in zoom-in duration-1000 delay-300">
                        Transformando realidades a través del compromiso social, la ética y la formación integral de nuestros estudiantes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5 justify-center items-center w-full animate-in fade-in slide-in-from-top-4 duration-1000 delay-500">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 border border-transparent text-base font-bold rounded-2xl text-white bg-[#8B1E1E] hover:bg-[#A52A2A] hover:shadow-[0_0_30px_rgba(139,30,30,0.3)] transition-all duration-300 gap-2 active:scale-95"
                        >
                            Empezar Ahora
                            <ArrowRight className="h-5 w-5" />
                        </Link>

                        <Link
                            href="/Publico/convocatorias"
                            className="w-full sm:w-auto inline-flex items-center justify-center px-10 py-5 border border-white/20 text-base font-bold rounded-2xl text-white bg-white/5 hover:bg-white/10 hover:border-white/40 transition-all duration-300 gap-2 backdrop-blur-md active:scale-95"
                        >
                            <Info className="h-5 w-5" />
                            Conocer Más
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Gradient Fade */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/50 to-transparent z-10 pointer-events-none" />
        </section>
    );
}

