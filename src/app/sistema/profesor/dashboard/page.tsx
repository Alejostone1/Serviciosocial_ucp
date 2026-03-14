import { ProfesorDashboardStats } from '../components/ProfesorDashboardStats';
import { ProfesorRecentActivities } from '../components/ProfesorRecentActivities';
import { ProfesorPendingReports } from '../components/ProfesorPendingReports';

export default function ProfesorDashboard() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard del Profesor</h1>
        <p className="text-gray-600">Resumen general de tus actividades y gestiones académicas</p>
      </div>

      {/* Stats Cards */}
      <ProfesorDashboardStats />

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <ProfesorRecentActivities />
        
        {/* Pending Reports */}
        <ProfesorPendingReports />
      </div>
    </div>
  );
}
