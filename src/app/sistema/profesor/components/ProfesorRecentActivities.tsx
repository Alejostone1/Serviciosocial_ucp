'use client';

import React from 'react';
import { Activity, Calendar, Clock, User } from 'lucide-react';

interface Activity {
  id: string;
  type: 'actividad' | 'convocatoria' | 'postulacion' | 'reporte';
  title: string;
  description: string;
  date: string;
  status: string;
}

export function ProfesorRecentActivities() {
  // TODO: Replace with real data from API
  const activities: Activity[] = [
    {
      id: '1',
      type: 'actividad',
      title: 'Nueva actividad creada',
      description: 'Tutoría de matemáticas para el programa de Ingeniería',
      date: '2024-01-15',
      status: 'Activa',
    },
    {
      id: '2',
      type: 'postulacion',
      title: 'Postulación revisada',
      description: 'Estudiante Juan Pérez - Convocatoria de Servicio Comunitario',
      date: '2024-01-14',
      status: 'Aprobada',
    },
    {
      id: '3',
      type: 'reporte',
      title: 'Reporte de horas aprobado',
      description: 'María González - 8 horas en Actividad de Alfabetización',
      date: '2024-01-13',
      status: 'Aprobado',
    },
    {
      id: '4',
      type: 'convocatoria',
      title: 'Convocatoria actualizada',
      description: 'Servicio Social de Verano 2024 - Fecha extendida',
      date: '2024-01-12',
      status: 'Activa',
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'actividad':
        return Activity;
      case 'convocatoria':
        return Calendar;
      case 'postulacion':
        return User;
      case 'reporte':
        return Clock;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'actividad':
        return 'bg-blue-100 text-blue-600';
      case 'convocatoria':
        return 'bg-green-100 text-green-600';
      case 'postulacion':
        return 'bg-yellow-100 text-yellow-600';
      case 'reporte':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Actividades Recientes</h2>
        <p className="text-sm text-gray-600">Últimas actividades en el sistema</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.description}</p>
                  <div className="flex items-center mt-1 space-x-4">
                    <span className="text-xs text-gray-500">{activity.date}</span>
                    <span className="text-xs font-medium text-green-600">{activity.status}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          Ver todas las actividades
        </button>
      </div>
    </div>
  );
}
