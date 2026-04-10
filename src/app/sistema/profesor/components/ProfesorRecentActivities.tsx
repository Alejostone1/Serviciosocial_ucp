'use client';

import React from 'react';
import { Activity as ActivityIcon, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'actividad' | 'convocatoria' | 'postulacion' | 'reporte';
  title: string;
  description: string;
  date: string;
  status: string;
}

export function ProfesorRecentActivities() {
  const activities: Activity[] = [
    {
      id: '1',
      type: 'actividad',
      title: 'Nueva actividad creada',
      description: 'Taller de refuerzo en Matemáticas Básicas',
      date: 'Hace 15 min',
      status: 'Activa',
    },
    {
      id: '2',
      type: 'postulacion',
      title: 'Postulación recibida',
      description: 'Juan Camilo Pérez - Ingeniería de Sistemas',
      date: 'Hace 2 horas',
      status: 'Pendiente',
    },
    {
      id: '3',
      type: 'reporte',
      title: 'Reporte validado',
      description: 'Validaste 8 horas para María José González',
      date: 'Ayer',
      status: 'Aprobado',
    },
  ];

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'actividad': return ActivityIcon;
      case 'convocatoria': return Calendar;
      case 'postulacion': return User;
      case 'reporte': return Clock;
      default: return ActivityIcon;
    }
  };

  const getActivityStyles = (type: Activity['type']) => {
    switch (type) {
      case 'actividad': return 'bg-indigo-50 text-indigo-600';
      case 'convocatoria': return 'bg-[#8B1E1E]/5 text-[#8B1E1E]';
      case 'postulacion': return 'bg-amber-50 text-amber-600';
      case 'reporte': return 'bg-emerald-50 text-emerald-600';
      default: return 'bg-gray-50 text-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="divide-y divide-slate-50">
        {activities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <div key={activity.id} className="p-5 hover:bg-slate-50 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", getActivityStyles(activity.type))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className="text-sm font-semibold text-slate-900 truncate">{activity.title}</p>
                    <span className="text-[11px] font-medium text-slate-400 shrink-0">{activity.date}</span>
                  </div>
                  <p className="text-sm text-slate-500 truncate mb-2 font-normal">{activity.description}</p>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md", getActivityStyles(activity.type))}>
                        {activity.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
