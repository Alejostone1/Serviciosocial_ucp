import DashboardClient from './dashboard-client';
import { getDashboardStats } from './actions';

export const metadata = {
  title: 'Dashboard Administrador | Servicio Social UCP',
};

export default async function AdministradorDashboard() {
  const stats = await getDashboardStats();

  return <DashboardClient stats={stats} />;
}
