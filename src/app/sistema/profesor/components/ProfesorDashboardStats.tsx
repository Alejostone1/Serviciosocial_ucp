'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Activity, Clock, Users } from 'lucide-react';

export function ProfesorDashboardStats() {
  const stats = [
    {
      title: 'Convocatorias',
      value: '12',
      change: '+2 este mes',
      icon: Calendar,
      color: 'bg-[#8B1E1E]',
      lightColor: 'bg-[#8B1E1E]/5',
      textColor: 'text-[#8B1E1E]'
    },
    {
      title: 'Actividades',
      value: '48',
      change: '+8 este mes',
      icon: Activity,
      color: 'bg-indigo-600',
      lightColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      title: 'Pendientes',
      value: '07',
      change: '-3 vs ayer',
      icon: Clock,
      color: 'bg-amber-600',
      lightColor: 'bg-amber-50',
      textColor: 'text-amber-700'
    },
    {
      title: 'Estudiantes',
      value: '156',
      change: '+12 nuevos',
      icon: Users,
      color: 'bg-emerald-600',
      lightColor: 'bg-emerald-50',
      textColor: 'text-emerald-700'
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="group bg-white rounded-2xl p-6 border border-slate-100 transition-all duration-300 hover:border-[#8B1E1E]/20 hover:shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 duration-300", stat.lightColor, stat.textColor)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", stat.lightColor, stat.textColor)}>
                {stat.change}
            </span>
          </div>
          
          <div className="space-y-1">
            <p className="text-3xl font-semibold text-slate-900 tracking-tight">{stat.value}</p>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
