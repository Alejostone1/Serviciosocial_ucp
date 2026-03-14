'use client';

import React from 'react';
import { Clock, FileText, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface PendingReport {
  id: string;
  studentName: string;
  activityName: string;
  hours: number;
  submittedDate: string;
  status: 'REPORTADO' | 'PENDIENTE_VALIDACION' | 'EN_REVISION' | 'APROBADO' | 'RECHAZADO' | 'REQUIERE_AJUSTE';
}

export function ProfesorPendingReports() {
  // TODO: Replace with real data from API
  const reports: PendingReport[] = [
    {
      id: '1',
      studentName: 'Ana Martínez',
      activityName: 'Tutoría de Matemáticas',
      hours: 4,
      submittedDate: '2024-01-15',
      status: 'PENDIENTE_VALIDACION',
    },
    {
      id: '2',
      studentName: 'Carlos Rodríguez',
      activityName: 'Alfabetización Digital',
      hours: 6,
      submittedDate: '2024-01-14',
      status: 'EN_REVISION',
    },
    {
      id: '3',
      studentName: 'María González',
      activityName: 'Servicio Comunitario',
      hours: 8,
      submittedDate: '2024-01-13',
      status: 'REQUIERE_AJUSTE',
    },
    {
      id: '4',
      studentName: 'Pedro López',
      activityName: 'Apoyo Administrativo',
      hours: 5,
      submittedDate: '2024-01-12',
      status: 'REPORTADO',
    },
  ];

  const getStatusIcon = (status: PendingReport['status']) => {
    switch (status) {
      case 'REPORTADO':
        return FileText;
      case 'PENDIENTE_VALIDACION':
        return Clock;
      case 'EN_REVISION':
        return AlertCircle;
      case 'APROBADO':
        return CheckCircle;
      case 'RECHAZADO':
        return XCircle;
      case 'REQUIERE_AJUSTE':
        return AlertCircle;
      default:
        return FileText;
    }
  };

  const getStatusColor = (status: PendingReport['status']) => {
    switch (status) {
      case 'REPORTADO':
        return 'bg-gray-100 text-gray-600';
      case 'PENDIENTE_VALIDACION':
        return 'bg-yellow-100 text-yellow-600';
      case 'EN_REVISION':
        return 'bg-blue-100 text-blue-600';
      case 'APROBADO':
        return 'bg-green-100 text-green-600';
      case 'RECHAZADO':
        return 'bg-red-100 text-red-600';
      case 'REQUIERE_AJUSTE':
        return 'bg-orange-100 text-orange-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: PendingReport['status']) => {
    switch (status) {
      case 'REPORTADO':
        return 'Reportado';
      case 'PENDIENTE_VALIDACION':
        return 'Pendiente de Validación';
      case 'EN_REVISION':
        return 'En Revisión';
      case 'APROBADO':
        return 'Aprobado';
      case 'RECHAZADO':
        return 'Rechazado';
      case 'REQUIERE_AJUSTE':
        return 'Requiere Ajuste';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Reportes Pendientes</h2>
        <p className="text-sm text-gray-600">Reportes de horas que requieren tu atención</p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {reports.map((report) => {
          const Icon = getStatusIcon(report.status);
          return (
            <div key={report.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-gray-900">{report.studentName}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      <Icon className="h-3 w-3 mr-1" />
                      {getStatusText(report.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{report.activityName}</p>
                  <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500">
                    <span>{report.hours} horas</span>
                    <span>•</span>
                    <span>Enviado: {report.submittedDate}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 border border-blue-600 rounded hover:bg-blue-50">
                    Revisar
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
          Ver todos los reportes
        </button>
      </div>
    </div>
  );
}
