import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail, Globe, Share2, AtSign } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#0f172a] text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

                    {/* Column 1: Logo & Description */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-white p-1.5 rounded-lg text-[#0f172a]">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl font-bold text-white leading-none tracking-tight">
                                    Servicio Social
                                </span>
                                <span className="text-xs font-medium text-gray-400 leading-none mt-1 uppercase tracking-wider">
                                    UCP Pereira
                                </span>
                            </div>
                        </div>
                        <p className="text-sm leading-relaxed text-gray-400">
                            Comprometidos con el desarrollo regional y la formación de ciudadanos socialmente responsables a través de proyectos de impacto.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all duration-300">
                                <Globe className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all duration-300">
                                <Share2 className="h-5 w-5" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all duration-300">
                                <AtSign className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Links */}
                    <div className="flex flex-col">
                        <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Enlaces de Interés</h3>
                        <ul className="space-y-4 text-sm font-medium">
                            <li>
                                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Portal Biblioteca UCP</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Calendario Académico</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Preguntas Frecuentes</Link>
                            </li>
                            <li>
                                <Link href="#" className="hover:text-white hover:translate-x-1 transition-all inline-block">Directorio Institucional</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Column 3: Contact */}
                    <div className="flex flex-col">
                        <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contacto</h3>
                        <ul className="space-y-5 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-[#8B1E1E] shrink-0 mt-0.5" />
                                <span className="leading-relaxed text-gray-400">Avenida de las Américas No. 38-88,<br />Pereira, Risaralda - Colombia</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-[#8B1E1E] shrink-0" />
                                <span className="text-gray-400">+57 (606) 312 4000 Ext. 104</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-[#8B1E1E] shrink-0" />
                                <a href="mailto:serviciosocial@ucp.edu.co" className="hover:text-white transition-colors text-gray-400">serviciosocial@ucp.edu.co</a>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Map */}
                    <div className="flex flex-col">
                        <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Ubicación</h3>
                        {/* Simulated Map */}
                        <div className="w-full h-40 bg-gray-800 rounded-xl overflow-hidden border border-gray-700 relative group grayscale hover:grayscale-0 transition-all duration-500">
                            <div
                                className="absolute inset-0 z-0 bg-cover bg-center"
                                style={{
                                    backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop')"
                                }}
                            />
                            <div className="absolute inset-0 bg-[#0f172a]/40 group-hover:bg-[#0f172a]/20 transition-colors z-10" />
                            <div className="absolute inset-0 flex items-center justify-center z-20">
                                <div className="bg-[#8B1E1E] p-2 rounded-full shadow-lg transform group-hover:scale-110 transition-transform">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="pt-8 mt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <p>© 2026 Universidad Católica de Pereira. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
                        <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
