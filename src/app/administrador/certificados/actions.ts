'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';
import { generarPDFCertificado as generatePDFLib } from '@/lib/certificado-pdf';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') throw new Error('No autorizado');
    return session;
}

/**
 * Generar QR para certificado
 */
export async function generarQRCertificado(codigoVerificacion: string) {
    try {
        const urlValidacion = `${process.env.NEXT_PUBLIC_APP_URL}/validar-certificado/${codigoVerificacion}`;

        const qrCodeDataURL = await QRCode.toDataURL(urlValidacion, {
            width: 200,
            margin: 2,
            color: {
                dark: '#8B1E1E',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error al generar QR:', error);
        throw new Error('Error al generar código QR');
    }
}

/**
 * Validar certificado por código (Soporta código completo o parcial de al menos 8 caracteres)
 */
export async function validarCertificado(codigoVerificacion: string) {
    try {
        // Normalizar entrada
        const searchCode = codigoVerificacion.trim().toLowerCase();

        // 1. Intentar búsqueda exacta (Máxima eficiencia)
        let certificado = await db.execute(async (prisma) => {
            return await prisma.certificado.findFirst({
                where: {
                    OR: [
                        { codigo_verificacion: searchCode.length === 36 ? searchCode : undefined },
                        // Si no es un UUID completo, Prisma fallará en findUnique/findFirst sobre un campo UUID
                        // así que usamos findFirst con una condición que solo se activa si es UUID
                    ],
                    esta_vigente: true
                },
                include: {
                    estudiante: {
                        include: {
                            programa: { include: { facultad: true } },
                            perfil_estudiante: true
                        }
                    },
                    convocatoria: {
                        include: {
                            categoria: true,
                            programa: { include: { facultad: true } }
                        }
                    },
                    emisor: {
                        select: { primer_nombre: true, primer_apellido: true, correo: true }
                    }
                }
            });
        }, 'Error al validar certificado');

        // 2. Si no se encontró y el código tiene al menos 8 caracteres, intentar búsqueda parcial
        if (!certificado && searchCode.length >= 8) {
            certificado = await db.execute(async (prisma) => {
                // Como codigo_verificacion es tipo UUID, no podemos usar startsWith directamente en Prisma.
                // Usamos queryRaw para buscar por texto.
                const results: any[] = await prisma.$queryRawUnsafe(`
                    SELECT id FROM certificados 
                    WHERE CAST(codigo_verificacion AS TEXT) ILIKE $1 
                    LIMIT 1
                `, `${searchCode}%`);

                if (results.length > 0) {
                    // Si encontramos el ID, lo buscamos con todos sus includes
                    return await prisma.certificado.findUnique({
                        where: { id: results[0].id },
                        include: {
                            estudiante: {
                                include: {
                                    programa: { include: { facultad: true } },
                                    perfil_estudiante: true
                                }
                            },
                            convocatoria: {
                                include: {
                                    categoria: true,
                                    programa: { include: { facultad: true } }
                                }
                            },
                            emisor: {
                                select: { primer_nombre: true, primer_apellido: true, correo: true }
                            }
                        }
                    });
                }
                return null;
            });
        }

        if (!certificado) {
            return {
                valido: false,
                mensaje: 'Certificado no encontrado o no vigente. Si estás usando un código corto, asegúrate de que sea el correcto.',
                datos: null
            };
        }

        // Registrar validación
        await db.execute(async (prisma) => {
            await prisma.logActividad.create({
                data: {
                    accion: 'VALIDAR_CERTIFICADO',
                    entidad: 'CERTIFICADO',
                    id_entidad: certificado.id,
                    descripcion: `Certificado ${certificado.codigo_verificacion} validado exitosamente (Entrada: ${searchCode})`,
                    id_usuario: null 
                }
            });
        }, 'Error al registrar validación');

        return {
            valido: true,
            mensaje: 'Certificado válido y vigente',
            datos: {
                id: certificado.id,
                codigo_verificacion: certificado.codigo_verificacion,
                total_horas: Number(certificado.total_horas),
                emitido_en: certificado.emitido_en.toLocaleDateString(),
                periodo_desde: certificado.periodo_desde?.toLocaleDateString(),
                periodo_hasta: certificado.periodo_hasta?.toLocaleDateString(),
                esta_vigente: certificado.esta_vigente,
                descripcion: certificado.descripcion,
                nombre_aliado: certificado.nombre_aliado,
                nombre_convocatoria: certificado.nombre_convocatoria,
                estudiante: certificado.estudiante ? {
                    id: certificado.estudiante.id,
                    primer_nombre: certificado.estudiante.primer_nombre,
                    primer_apellido: certificado.estudiante.primer_apellido,
                    correo: certificado.estudiante.correo,
                    numero_documento: certificado.estudiante.numero_documento,
                    programa: certificado.estudiante.programa ? {
                        id: certificado.estudiante.programa.id,
                        nombre: certificado.estudiante.programa.nombre,
                        codigo: certificado.estudiante.programa.codigo,
                        horas_requeridas: certificado.estudiante.programa.horas_requeridas ? Number(certificado.estudiante.programa.horas_requeridas) : null,
                        facultad: certificado.estudiante.programa.facultad ? {
                            id: certificado.estudiante.programa.facultad.id,
                            nombre: certificado.estudiante.programa.facultad.nombre,
                            codigo: certificado.estudiante.programa.facultad.codigo
                        } : null
                    } : null,
                    perfil_estudiante: certificado.estudiante.perfil_estudiante ? {
                        horas_acumuladas: Number(certificado.estudiante.perfil_estudiante.horas_acumuladas),
                        horas_previas: Number(certificado.estudiante.perfil_estudiante.horas_previas),
                        porcentaje_avance: Number(certificado.estudiante.perfil_estudiante.porcentaje_avance)
                    } : null
                } : null,
                convocatoria: certificado.convocatoria ? {
                    id: certificado.convocatoria.id,
                    titulo: certificado.convocatoria.titulo,
                    descripcion: certificado.convocatoria.descripcion,
                    modalidad: certificado.convocatoria.modalidad,
                    estado: certificado.convocatoria.estado,
                    programa: certificado.convocatoria.programa ? {
                        id: certificado.convocatoria.programa.id,
                        nombre: certificado.convocatoria.programa.nombre,
                        codigo: certificado.convocatoria.programa.codigo,
                        horas_requeridas: certificado.convocatoria.programa.horas_requeridas ? Number(certificado.convocatoria.programa.horas_requeridas) : null,
                        facultad: certificado.convocatoria.programa.facultad ? {
                            id: certificado.convocatoria.programa.facultad.id,
                            nombre: certificado.convocatoria.programa.facultad.nombre,
                            codigo: certificado.convocatoria.programa.facultad.codigo
                        } : null
                    } : null,
                    categoria: certificado.convocatoria.categoria
                } : null,
                emisor: certificado.emisor
            }
        };
    } catch (error) {
        console.error('Error en validarCertificado:', error);
        return {
            valido: false,
            mensaje: 'Error al validar certificado',
            datos: null
        };
    }
}

/**
 * Generar PDF del certificado con diseño espectacular (PARA ADMIN)
 */
export async function generarPDFCertificado(idCertificado: string) {
    await checkAdmin();

    try {
        const pdfBase64 = await generatePDFLib(idCertificado);

        // Registrar generación de PDF en log (Admin version)
        await db.execute(async (prisma) => {
            const session = await getServerSession(authOptions);
            const certificado = await prisma.certificado.findUnique({ where: { id: idCertificado } });
            
            await prisma.logActividad.create({
                data: {
                    accion: 'ADMIN_DESCARGA_CERTIFICADO',
                    entidad: 'CERTIFICADO',
                    id_entidad: idCertificado,
                    descripcion: `Administrador descargó el certificado ${certificado?.codigo_verificacion || idCertificado}`,
                    id_usuario: session?.user?.id || '',
                    resultado: 'EXITOSO'
                }
            });
        }, 'Error al registrar log de certificado administrativo');

        return pdfBase64;
    } catch (error) {
        console.error('Error en generarPDFCertificado:', error);
        throw error;
    }
}

/**
 * Obtener todos los certificados con filtros
 */
export async function getCertificados(filtros?: {
    estado?: string;
    programa?: string;
    facultad?: string;
    fechaDesde?: Date;
    fechaHasta?: Date;
}) {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const whereClause: any = {};

            if (filtros?.estado) {
                whereClause.esta_vigente = filtros.estado === 'vigente';
            }

            if (filtros?.fechaDesde || filtros?.fechaHasta) {
                whereClause.emitido_en = {};
                if (filtros.fechaDesde) {
                    whereClause.emitido_en.gte = filtros.fechaDesde;
                }
                if (filtros.fechaHasta) {
                    whereClause.emitido_en.lte = filtros.fechaHasta;
                }
            }

            const certificados = await prisma.certificado.findMany({
                where: whereClause,
                include: {
                    estudiante: {
                        include: {
                            programa: {
                                include: {
                                    facultad: true
                                }
                            },
                            perfil_estudiante: true
                        }
                    },
                    convocatoria: {
                        include: {
                            categoria: true,
                            programa: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    },
                    emisor: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                },
                orderBy: { emitido_en: 'desc' }
            });

            // Aplicar filtros adicionales en memoria
            let certificadosFiltrados = certificados;

            if (filtros?.programa) {
                certificadosFiltrados = certificadosFiltrados.filter(c =>
                    c.estudiante.programa?.nombre.toLowerCase().includes(filtros.programa!.toLowerCase())
                );
            }

            if (filtros?.facultad) {
                certificadosFiltrados = certificadosFiltrados.filter(c =>
                    c.estudiante.programa?.facultad?.nombre.toLowerCase().includes(filtros.facultad!.toLowerCase())
                );
            }

            return certificadosFiltrados.map(certificado => ({
                id: certificado.id,
                codigo_verificacion: certificado.codigo_verificacion,
                total_horas: Number(certificado.total_horas),
                emitido_en: certificado.emitido_en.toLocaleDateString(),
                periodo_desde: certificado.periodo_desde?.toLocaleDateString() || null,
                periodo_hasta: certificado.periodo_hasta?.toLocaleDateString() || null,
                esta_vigente: certificado.esta_vigente,
                descripcion: certificado.descripcion,
                nombre_aliado: certificado.nombre_aliado,
                nombre_convocatoria: certificado.nombre_convocatoria,
                url_pdf: certificado.url_pdf,
                estudiante: certificado.estudiante ? {
                    id: certificado.estudiante.id,
                    primer_nombre: certificado.estudiante.primer_nombre,
                    primer_apellido: certificado.estudiante.primer_apellido,
                    correo: certificado.estudiante.correo,
                    numero_documento: certificado.estudiante.numero_documento,
                    programa: certificado.estudiante.programa ? {
                        id: certificado.estudiante.programa.id,
                        nombre: certificado.estudiante.programa.nombre,
                        codigo: certificado.estudiante.programa.codigo,
                        horas_requeridas: certificado.estudiante.programa.horas_requeridas ? Number(certificado.estudiante.programa.horas_requeridas) : null,
                        facultad: certificado.estudiante.programa.facultad ? {
                            id: certificado.estudiante.programa.facultad.id,
                            nombre: certificado.estudiante.programa.facultad.nombre,
                            codigo: certificado.estudiante.programa.facultad.codigo
                        } : null
                    } : null,
                    perfil_estudiante: certificado.estudiante.perfil_estudiante ? {
                        horas_acumuladas: Number(certificado.estudiante.perfil_estudiante.horas_acumuladas),
                        horas_previas: Number(certificado.estudiante.perfil_estudiante.horas_previas),
                        porcentaje_avance: Number(certificado.estudiante.perfil_estudiante.porcentaje_avance)
                    } : null
                } : null,
                convocatoria: certificado.convocatoria ? {
                    id: certificado.convocatoria.id,
                    titulo: certificado.convocatoria.titulo,
                    descripcion: certificado.convocatoria.descripcion,
                    modalidad: certificado.convocatoria.modalidad,
                    estado: certificado.convocatoria.estado,
                    programa: certificado.convocatoria.programa ? {
                        id: certificado.convocatoria.programa.id,
                        nombre: certificado.convocatoria.programa.nombre,
                        codigo: certificado.convocatoria.programa.codigo,
                        horas_requeridas: certificado.convocatoria.programa.horas_requeridas ? Number(certificado.convocatoria.programa.horas_requeridas) : null,
                        facultad: certificado.convocatoria.programa.facultad ? {
                            id: certificado.convocatoria.programa.facultad.id,
                            nombre: certificado.convocatoria.programa.facultad.nombre,
                            codigo: certificado.convocatoria.programa.facultad.codigo
                        } : null
                    } : null,
                    categoria: certificado.convocatoria.categoria
                } : null,
                emisor: certificado.emisor
            }));
        }, 'Error al obtener certificados');
    } catch (error) {
        console.error('Error en getCertificados:', error);
        throw error;
    }
}

/**
 * Anular certificado
 */
export async function anularCertificado(idCertificado: string, motivo: string) {
    await checkAdmin();

    try {
        return await db.execute(async (prisma) => {
            const certificado = await prisma.certificado.update({
                where: { id: idCertificado },
                data: {
                    esta_vigente: false,
                    motivo_anulacion: motivo
                }
            });

            // Registrar anulación
            await prisma.logActividad.create({
                data: {
                    accion: 'ANULAR_CERTIFICADO',
                    entidad: 'CERTIFICADO',
                    id_entidad: idCertificado,
                    descripcion: `Certificado anulado: ${motivo}`,
                    id_usuario: (await getServerSession(authOptions))?.user?.id || ''
                }
            });

            return certificado;
        }, 'Error al anular certificado');
    } catch (error) {
        console.error('Error en anularCertificado:', error);
        throw error;
    }
}
