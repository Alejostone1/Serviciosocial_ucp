'use client';

import React from 'react';
import { Calendar, MapPin, Clock, ExternalLink } from 'lucide-react';
import ProjectStatusBadge from './ProjectStatusBadge';

interface Project {
    id: string;
    nombre: string;
    organizacion: string;
    fechaInicio: string;
    fechaFin: string;
    horasAcumuladas: number;
    estado: 'EN PROGRESO' | 'ESPERANDO APROBACIÓN' | 'RECHAZADO';
}

interface ActiveProjectsCardProps {
    projects: Project[];
}

export default function ActiveProjectsCard({ projects }: ActiveProjectsCardProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">Mis Proyectos Activos</h2>
                <span className="bg-[#8B1E1E] text-white text-xs px-2 py-1 rounded-full">
                    {projects.length} proyectos
                </span>
            </div>

            <div className="space-y-4">
                {projects.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">No tienes proyectos activos</p>
                        <p className="text-sm text-gray-400 mt-1">
                            Postula a las convocatorias disponibles para comenzar
                        </p>
                    </div>
                ) : (
                    projects.map((project) => (
                        <div
                            key={project.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-[#8B1E1E] transition-colors"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">
                                        {project.nombre}
                                    </h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{project.organizacion}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            <span>{project.horasAcumuladas}h</span>
                                        </div>
                                    </div>
                                </div>
                                <ProjectStatusBadge status={project.estado} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    <span>{formatDate(project.fechaInicio)}</span>
                                    <span className="mx-2">→</span>
                                    <span>{formatDate(project.fechaFin)}</span>
                                </div>
                                <button className="text-[#8B1E1E] hover:text-[#7a1616] transition-colors">
                                    <ExternalLink className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {projects.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-sm font-medium text-[#8B1E1E] hover:text-[#7a1616] transition-colors">
                        Ver todos mis proyectos →
                    </button>
                </div>
            )}
        </div>
    );
}
