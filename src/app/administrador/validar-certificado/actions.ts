'use server';

import { db } from '@/lib/prisma';
import { generarPDFCertificado } from '@/lib/certificado-pdf';

/**
 * Permite a cualquier usuario con un código de verificación válido
 * obtener el PDF oficial del diploma/certificado.
 * Esta acción es pública para permitir la validación y descarga institucional.
 */
export async function descargarPDFPublico(codigoVerificacion: string) {
    try {
        // Encontrar el certificado por su código de verificación
        // Nota: Solo se permiten certificados vigentes
        const certificado = await db.execute(async (prisma) => {
            return await prisma.certificado.findFirst({
                where: {
                    codigo_verificacion: codigoVerificacion,
                    esta_vigente: true
                },
                select: { id: true }
            });
        }, 'Error al buscar certificado para descarga pública');

        if (!certificado) {
            throw new Error('Certificado no encontrado o no está vigente para descarga.');
        }

        // Generar el PDF institucional usando la librería compartida
        const pdfBase64 = await generarPDFCertificado(certificado.id);

        return {
            success: true,
            pdfBase64,
            filename: `UCP_Certificado_${codigoVerificacion.slice(0, 8)}.pdf`
        };
    } catch (error) {
        console.error('Error en descarga pública de certificado:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Error al procesar la descarga'
        };
    }
}
