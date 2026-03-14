'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Users, Activity, Eye, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface Convocatoria {
  id: string;
  titulo: string;
  descripcion: string;
  estado: string;
  fecha_inicio: string;
  fecha_fin?: string;
  fecha_cierre_postulacion?: string;
  cupo_maximo?: number;
  cupo_disponible?: number;
  horas_totales_ofrecidas?: number;
  programa: {
    id: string;
    nombre: string;
    codigo: string;
  };
  categoria?: {
    id: string;
    nombre: string;
    color_hex?: string;
  };
  publicador: {
    id: string;
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
  };
  _count: {
    postulaciones: number;
    actividades: number;
  };
}

export function ProfesorConvocatoriasList() {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');

  // TODO: Replace with real API call
  useEffect(() => {
    const loadConvocatorias = async () => {
      try {
        setLoading(true);
        // const data = await getConvocatoriasForProfesor();
        // Mock data for now
        const mockData: Convocatoria[] = [
          {
            id: '1',
            titulo: 'Servicio Social Comunitario 2024',
            descripcion: 'Programa de servicio social enfocado en apoyo a comunidades locales',
            estado: 'PUBLICADA',
            fecha_inicio: '2024-01-15',
            fecha_fin: '2024-06-30',
            fecha_cierre_postulacion: '2024-02-15',
            cupo_maximo: 50,
            cupo_disponible: 25,
            horas_totales_ofrecidas: 120,
            programa: {
              id: '1',
              nombre: 'Ingeniería de Sistemas',
              codigo: 'IS-2020',
            },
            categoria: {
              id: '1',
              nombre: 'Comunitario',
              color_hex: '#10b981',
            },
            publicador: {
              id: '1',
              primer_nombre: 'Juan',
              primer_apellido: 'Pérez',
              correo: 'juan.perez@ucp.edu.co',
            },
            _count: {
              postulaciones: 25,
              actividades: 8,
            },
          },
          {
            id: '2',
            titulo: 'Tutorías Académicas',
            descripcion: 'Programa de tutorías para estudiantes de bajos recursos',
            estado: 'EN_CURSO',
            fecha_inicio: '2024-02-01',
            fecha_fin: '2024-05-31',
            fecha_cierre_postulacion: '2024-02-28',
            cupo_maximo: 30,
            cupo_disponible: 12,
            horas_totales_ofrecidas: 80,
            programa: {
              id: '2',
              nombre: 'Administración de Empresas',
              codigo: 'ADM-2019',
            },
            categoria: {
              id: '2',
              nombre: 'Académico',
              color_hex: '#3b82f6',
            },
            publicador: {
              id: '2',
              primer_nombre: 'María',
              primer_apellido: 'González',
              correo: 'maria.gonzalez@ucp.edu.co',
            },
            _count: {
              postulaciones: 18,
              actividades: 5,
            },
          },
        ];
        setConvocatorias(mockData);
      } catch (error) {
        console.error('Error loading convocatorias:', error);
      } finally {
        setLoading(false);
      }
    };

    loadConvocatorias();
  }, []);

  const filteredConvocatorias = convocatorias.filter(convocatoria => {
    const matchesSearch = convocatoria.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         convocatoria.descripcion.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || convocatoria.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'bg-gray-100 text-gray-700';
      case 'PUBLICADA':
        return 'bg-green-100 text-green-700';
      case 'EN_CURSO':
        return 'bg-blue-100 text-blue-700';
      case 'CERRADA':
        return 'bg-red-100 text-red-700';
      case 'CANCELADA':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoText = (estado: string) => {
    switch (estado) {
      case 'BORRADOR':
        return 'Borrador';
      case 'PUBLICADA':
        return 'Publicada';
      case 'EN_CURSO':
        return 'En Curso';
      case 'CERRADA':
        return 'Cerrada';
      case 'CANCELADA':
        return 'Cancelada';
      default:
        return estado;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Cargando convocatorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar convocatorias..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="todos">Todos los estados</option>
            <option value="BORRADOR">Borrador</option>
            <option value="PUBLICADA">Publicada</option>
            <option value="EN_CURSO">En Curso</option>
            <option value="CERRADA">Cerrada</option>
            <option value="CANCELADA">Cancelada</option>
          </select>
        </div>
      </div>

      {/* Convocatorias Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConvocatorias.map((convocatoria) => (
          <div key={convocatoria.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {convocatoria.titulo}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(convocatoria.estado)}`}>
                    {getEstadoText(convocatoria.estado)}
                  </span>
                </div>
                {convocatoria.categoria?.color_hex && (
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: convocatoria.categoria.color_hex }}
                  ></div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {convocatoria.descripcion}
              </p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(convocatoria.fecha_inicio).toLocaleDateString()} -{' '}
                  {convocatoria.fecha_fin ? new Date(convocatoria.fecha_fin).toLocaleDateString() : 'Sin fecha límite'}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {convocatoria.cupo_disponible} / {convocatoria.cupo_maximo} cupos disponibles
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Activity className="h-4 w-4 mr-2" />
                  {convocatoria._count.postulaciones} postulaciones • {convocatoria._count.actividades} actividades
                </div>
              </div>

              {/* Program */}
              <div className="mb-4">
                <p className="text-sm text-gray-500">Programa:</p>
                <p className="text-sm font-medium text-gray-900">
                  {convocatoria.programa.nombre} ({convocatoria.programa.codigo})
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Link
                  href={`/sistema/profesor/convocatorias/${convocatoria.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded-md hover:bg-blue-50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalles
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredConvocatorias.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Calendar className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron convocatorias</h3>
          <p className="text-gray-500">
            {searchTerm || filterEstado !== 'todos'
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'No hay convocatorias disponibles en este momento'}
          </p>
        </div>
      )}
    </div>
  );
}
