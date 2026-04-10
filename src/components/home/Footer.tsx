import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail, Globe, Share2, AtSign } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-[#0f172a] text-gray-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12">

                    {/* Column 1: Logo & Description */}
                    <div className="flex flex-col space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="rounded-full overflow-hidden w-12 h-12 flex items-center justify-center shrink-0 shadow-lg bg-white p-0.5">
                                <Image 
                                    src="/uploads/logo_ucp_redondo.png" 
                                    alt="UCP Logo" 
                                    width={48} 
                                    height={48} 
                                    className="object-contain"
                                />
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
                            <a 
                                href="https://www.ucp.edu.co/" 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-[#8B1E1E] hover:text-white transition-all duration-300"
                            >
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
                                <Link 
                                    href="https://www.ucp.edu.co/estudiantes/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white hover:translate-x-1 transition-all inline-block"
                                >
                                    Portal Universidad UCP
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="https://biblioteca.ucp.edu.co/?_gl=1%2Ag4yilv%2A_ga%2AMTc1NDE2NDE3Ny4xNzEzMTAzMzk1%2A_ga_XK0W1H99YR%2AczE3NzUxNzU3MDQkbzk1JGcwJHQxNzc1MTc1NzA0JGo2MCRsMCRoNDMxNTQ2OTg3" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white hover:translate-x-1 transition-all inline-block"
                                >
                                    Portal Biblioteca UCP
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="https://www.ucp.edu.co/preguntas-frecuentes/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white hover:translate-x-1 transition-all inline-block"
                                >
                                    Preguntas Frecuentes
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="https://www.ucp.edu.co/institucion/" 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hover:text-white hover:translate-x-1 transition-all inline-block"
                                >
                                    Directorio Institucional
                                </Link>
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
                        {/* Google Maps Embed */}
                        <div className="w-full h-40 rounded-xl overflow-hidden border border-gray-700 relative group grayscale hover:grayscale-0 transition-all duration-500">
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.7979876920404!2d-75.72756683231884!3d4.804713409290396!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e387ded630d51eb%3A0xeb69a2107b84758c!2sUniversidad%20Cat%C3%B3lica%20de%20Pereira!5e0!3m2!1ses-419!2sco!4v1775058520160!5m2!1ses-419!2sco"
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                className="absolute inset-0 group-hover:filter-none"
                            />
                            <div className="absolute inset-0 bg-[#0f172a]/40 group-hover:bg-transparent transition-colors pointer-events-none" />
                            <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none group-hover:opacity-0 transition-opacity">
                                <div className="bg-[#8B1E1E] p-2 rounded-full shadow-lg">
                                    <MapPin className="h-5 w-5 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="relative z-30 pt-8 mt-8 border-t border-gray-800 bg-[#0f172a] flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
                    <p className="text-white font-medium">© 2026 Universidad Católica de Pereira. Todos los derechos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/privacidad" className="hover:text-white transition-colors">Política de Privacidad</Link>
                        <Link href="/terminos" className="hover:text-white transition-colors">Términos y Condiciones</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
