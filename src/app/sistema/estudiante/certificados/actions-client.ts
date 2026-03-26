'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generarPDFCertificado } from '@/lib/certificado-pdf';
import { db } from '@/lib/prisma';

/**
 * Acción server para ESTUDIANTES generar PDF de SUS certificados
 * Valida que el certificado pertenezca al estudiante logueado
 */
export async function generarPDFEstudiante(idCertificado: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ESTUDIANTE') {
        throw new Error('No autorizado. Solo estudiantes pueden descargar sus certificados.');
    }

    // Validar que el certificado pertenece al estudiante
    const certificado = await db.execute(async (prisma) => {
        return await prisma.certificado.findUnique({
            where: { id: idCertificado },
            select: { id_estudiante: true }
        });
    }, 'Error al validar propiedad del certificado');

    if (!certificado || certificado.id_estudiante !== session.user.id) {
        throw new Error('Certificado no encontrado o no tienes acceso a este certificado.');
    }

    // Generar PDF profesional usando shared function
    const pdfBase64 = await generarPDFCertificado(idCertificado);

    // Registrar en log de actividad
    await db.execute(async (prisma) => {
        await prisma.logActividad.create({
            data: {
                accion: 'ESTUDIANTE_DESCARGA_CERTIFICADO',
                entidad: 'CERTIFICADO',
                id_entidad: idCertificado,
                descripcion: `El estudiante ${session.user.name} descargó su certificado`,
                id_usuario: session.user.id,
                resultado: 'EXITOSO'
            }
        });
    }, 'Error al registrar descarga de certificado');

    return pdfBase64;
}
