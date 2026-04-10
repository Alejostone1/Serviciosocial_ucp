import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ReportarHorasClient from './reportar-client';

export const metadata = { title: 'Reportar Horas | Estudiante' };

export default async function ReportarHorasPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        redirect('/login');
    }

    return <ReportarHorasClient />;
}
