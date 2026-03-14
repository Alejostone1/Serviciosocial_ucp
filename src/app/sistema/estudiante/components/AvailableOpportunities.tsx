'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

interface Opportunity {
    id: string;
    categoria: string;
    titulo: string;
    descripcion: string;
    horas: number;
    organizacion: string;
    modalidad: string;
}

interface AvailableOpportunitiesProps {
    opportunities: Opportunity[];
}

export default function AvailableOpportunities({ opportunities }: AvailableOpportunitiesProps) {
    const getCategoriaColor = (categoria: string) => {
        const colors: { [key: string]: string } = {
            'EDUCACIÓN': 'bg-blue-100 text-blue-800',
            'SALUD': 'bg-green-100 text-green-800',
            'MEDIO AMBIENTE': 'bg-emerald-100 text-emerald-800',
            'DESARROLLO SOCIAL': 'bg-purple-100 text-purple-800',
            'TECNOLOGÍA': 'bg-orange-100 text-orange-800',
            'CULTURA': 'bg-pink-100 text-pink-800',
            'DEPORTES': 'bg-indigo-100 text-indigo-800'
        };
        return colors[categoria] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Convocatorias Disponibles</h2>
                <span className="bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full">
                    {opportunities.length} nuevas
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunities.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No hay convocatorias disponibles</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Vuelve pronto para ver nuevas oportunidades
                        </p>
                    </div>
                ) : (
                    opportunities.map((opportunity) => (
                        <div
                            key={opportunity.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-[#8B1E1E] transition-colors"
                        >
                            {/* Categoría */}
                            <div className="mb-3">
                                <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getCategoriaColor(opportunity.categoria)}`}>
                                    {opportunity.categoria}
                                </span>
                            </div>

                            {/* Título y descripción */}
                            <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                                {opportunity.titulo}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                {opportunity.descripcion}
                            </p>

                            {/* Detalles */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>{opportunity.horas} horas requeridas</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <MapPin className="w-4 h-4" />
                                    <span>{opportunity.organizacion}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Users className="w-4 h-4" />
                                    <span>{opportunity.modalidad}</span>
                                </div>
                            </div>

                            {/* Botón de postulación */}
                            <Link
                                href={`/estudiante/convocatorias/${opportunity.id}`}
                                className="block w-full bg-[#8B1E1E] text-white text-center py-2.5 px-4 rounded-lg font-medium hover:bg-[#7a1616] transition-colors"
                            >
                                Postularme
                            </Link>
                        </div>
                    ))
                )}
            </div>

            {opportunities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <Link
                        href="/estudiante/convocatorias"
                        className="block w-full text-center text-sm font-medium text-[#8B1E1E] hover:text-[#7a1616] transition-colors"
                    >
                        Ver todas las convocatorias →
                    </Link>
                </div>
            )}
        </div>
    );
}
