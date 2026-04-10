'use client';

import Link from "next/link";
import { Clock, Search, FileBadge } from "lucide-react";
import { motion } from "framer-motion";

export function QuickAccess() {
    const cards = [
        {
            title: "Reportar Horas",
            description: "Registra y gestiona tu progreso académico y social de forma ágil y segura.",
            icon: Clock,
            href: "/login",
            delay: "0ms"
        },
        {
            title: "Buscar Proyectos",
            description: "Explora oportunidades para impactar positivamente en comunidades locales.",
            icon: Search,
            href: "/Publico/convocatorias",
            delay: "100ms"
        },
        {
            title: "Descargar Certificados",
            description: "Obtén tus constancias de participación oficiales al culminar tus servicios.",
            icon: FileBadge,
            href: "/Publico/verificacion",
            delay: "200ms"
        }
    ];

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                {/* Section Header */}
                <div className="mb-12 flex items-center gap-4">
                    <div className="w-12 h-1 bg-[#8B1E1E] rounded-full"></div>
                    <h2 className="text-3xl font-bold text-gray-900">Accesos Rápidos</h2>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {cards.map((card, index) => {
                        const Icon = card.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.1 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                            >

                                <Link
                                    href={card.href}
                                    className="group block bg-white rounded-xl p-8 border border-gray-200/50 shadow-lg hover:shadow-xl hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm h-full"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-6 group-hover:bg-[#8B1E1E] transition-colors duration-300">
                                            <Icon className="h-8 w-8 text-[#8B1E1E] group-hover:text-white transition-colors duration-300" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8B1E1E] transition-colors duration-300">
                                            {card.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed">
                                            {card.description}
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </div>

            </div>
        </section>
    );
}
