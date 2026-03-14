'use client';

import React from 'react';
import { Calendar, Activity, Clock, Users } from 'lucide-react';

interface StatCard {
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: React.ElementType;
}

export function ProfesorDashboardStats() {
  // TODO: Replace with real data from API
  const stats: StatCard[] = [
    {
      title: 'Convocatorias Activas',
      value: '12',
      change: '+2 este mes',
      changeType: 'increase',
      icon: Calendar,
    },
    {
      title: 'Actividades Totales',
      value: '48',
      change: '+8 este mes',
      changeType: 'increase',
      icon: Activity,
    },
    {
      title: 'Reportes Pendientes',
      value: '7',
      change: '-3 vs semana pasada',
      changeType: 'decrease',
      icon: Clock,
    },
    {
      title: 'Estudiantes Participantes',
      value: '156',
      change: '+12 este mes',
      changeType: 'increase',
      icon: Users,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className={cn(
                  'text-sm',
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}
