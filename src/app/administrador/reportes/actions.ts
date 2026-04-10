'use server';

import { db } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { transformDecimalsToNumbers } from '@/lib/decimal-utils';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') throw new Error('No autorizado');
    return session;
}

/**
 * Obtener todos los datos para el panel de reportes
 */
export async function getDatosReportes() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const [
                totalEstudiantes,
                totalConvocatorias,
                totalHoras,
                totalCertificados,
                estudiantesPorPrograma,
                estudiantesPorFacultad,
                convocatoriasPorEstado,
                actividadesPorTipo,
                reportesPorEstado,
                estudiantesConHoras
            ] = await Promise.all([
                // Total estudiantes
                prisma.usuario.count({
                    where: { rol: 'ESTUDIANTE' }
                }),
                
                // Total convocatorias este año
                prisma.convocatoria.count({
                    where: {
                        creado_en: {
                            gte: new Date(new Date().getFullYear(), 0, 1)
                        }
                    }
                }),
                
                // Total horas acumuladas
                prisma.perfilEstudiante.aggregate({
                    _sum: { horas_acumuladas: true }
                }),
                
                // Total certificados emitidos
                prisma.certificado.count(),
                
                // Estudiantes por programa
                prisma.programa.findMany({
                    select: {
                        id: true,
                        nombre: true,
                        facultad: {
                            select: {
                                id: true,
                                nombre: true
                            }
                        },
                        _count: {
                            select: {
                                usuarios: {
                                    where: { rol: 'ESTUDIANTE' }
                                }
                            }
                        }
                    }
                }),
                
                // Estudiantes por facultad
                prisma.facultad.findMany({
                    include: {
                        programas: {
                            include: {
                                usuarios: {
                                    where: { rol: 'ESTUDIANTE' },
                                    select: { id: true }
                                }
                            }
                        }
                    }
                }),
                
                // Convocatorias por estado
                prisma.convocatoria.groupBy({
                    by: ['estado'],
                    _count: true
                }),
                
                // Actividades por tipo
                prisma.actividad.groupBy({
                    by: ['tipo_actividad'],
                    _count: true
                }),
                
                // Reportes por estado
                prisma.reporteHoras.groupBy({
                    by: ['estado'],
                    _count: true
                }),
                
                // Estudiantes con horas
                prisma.perfilEstudiante.findMany({
                    where: {
                        horas_acumuladas: {
                            gt: 0
                        }
                    },
                    include: {
                        usuario: {
                            select: {
                                id: true,
                                primer_nombre: true,
                                primer_apellido: true,
                                correo: true,
                                numero_documento: true
                            }
                        }
                    },
                    orderBy: {
                        horas_acumuladas: 'desc'
                    },
                    take: 100
                })
            ]);

            // Enriquecer datos de estudiantes con programas
            const estudiantesConPrograma = await Promise.all(
                estudiantesConHoras.map(async (estudiante) => {
                    const usuarioCompleto = await prisma.usuario.findUnique({
                        where: { id: estudiante.id_usuario },
                        include: {
                            programa: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    });
                    
                    return {
                        ...estudiante,
                        usuario: usuarioCompleto,
                        programa: usuarioCompleto?.programa
                    };
                })
            );

            const datosReportes = {
                estadisticas: {
                    totalEstudiantes,
                    totalConvocatorias,
                    totalHoras: Number(totalHoras._sum.horas_acumuladas || 0),
                    totalCertificados
                },
                estudiantesPorPrograma: estudiantesPorPrograma.map(p => ({
                    ...p,
                    totalEstudiantes: p._count.usuarios
                })),
                estudiantesPorFacultad: estudiantesPorFacultad.map(f => ({
                    ...f,
                    totalEstudiantes: f.programas.reduce((acc, programa) => acc + programa.usuarios.length, 0)
                })),
                convocatoriasPorEstado: convocatoriasPorEstado.map(c => ({
                    estado: c.estado,
                    cantidad: c._count
                })),
                actividadesPorTipo: actividadesPorTipo.map(a => ({
                    tipo: a.tipo_actividad,
                    cantidad: a._count
                })),
                reportesPorEstado: reportesPorEstado.map(r => ({
                    estado: r.estado,
                    cantidad: r._count
                })),
                estudiantesConHoras: estudiantesConPrograma.map(e => ({
                    ...e,
                    horas_acumuladas: Number(e.horas_acumuladas)
                })),
                horasPorMes: [],
                certificadosPorMes: [],
                programasMasActivos: [],
                facultadesMasActivas: []
            };
            
            return transformDecimalsToNumbers(datosReportes);
        }, 'Error al obtener datos de reportes');
    } catch (error) {
        console.error('Error en getDatosReportes:', error);
        throw error;
    }
}

/**
 * Generar reporte Excel de estudiantes
 */
export async function generarReporteEstudiantesExcel() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const estudiantes = await prisma.usuario.findMany({
                where: { rol: 'ESTUDIANTE' },
                include: {
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    perfil_estudiante: true
                }
            });

            return estudiantes.map(estudiante => ({
                'Documento': estudiante.numero_documento,
                'Nombre': `${estudiante.primer_nombre} ${estudiante.segundo_nombre || ''} ${estudiante.primer_apellido} ${estudiante.segundo_apellido || ''}`.trim(),
                'Correo': estudiante.correo,
                'Teléfono': estudiante.telefono || 'N/A',
                'Programa': estudiante.programa?.nombre || 'N/A',
                'Facultad': estudiante.programa?.facultad.nombre || 'N/A',
                'Semestre': estudiante.perfil_estudiante?.semestre_actual || 'N/A',
                'Código Estudiantil': estudiante.perfil_estudiante?.codigo_estudiantil || 'N/A',
                'Horas Previas': Number(estudiante.perfil_estudiante?.horas_previas || 0),
                'Horas Acumuladas': Number(estudiante.perfil_estudiante?.horas_acumuladas || 0),
                'Porcentaje Avance': Number(estudiante.perfil_estudiante?.porcentaje_avance || 0),
                'Fecha Creación': estudiante.creado_en.toLocaleDateString(),
                'Último Acceso': estudiante.ultimo_acceso?.toLocaleDateString() || 'Nunca'
            }));
        }, 'Error al generar reporte de estudiantes');
    } catch (error) {
        console.error('Error en generarReporteEstudiantesExcel:', error);
        throw error;
    }
}

/**
 * Generar reporte Excel de convocatorias
 */
export async function generarReporteConvocatoriasExcel() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const convocatorias = await prisma.convocatoria.findMany({
                include: {
                    categoria: true,
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    publicador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    },
                    postulaciones: {
                        select: {
                            estado: true
                        }
                    },
                    actividades: {
                        select: {
                            id: true,
                            tipo_actividad: true,
                            horas_estimadas: true
                        }
                    }
                }
            });

            return convocatorias.map(convocatoria => ({
                'ID': convocatoria.id,
                'Título': convocatoria.titulo,
                'Descripción': convocatoria.descripcion,
                'Objetivo': convocatoria.objetivo || 'N/A',
                'Modalidad': convocatoria.modalidad,
                'Lugar': convocatoria.lugar || 'N/A',
                'Categoría': convocatoria.categoria?.nombre || 'N/A',
                'Programa': convocatoria.programa?.nombre || 'N/A',
                'Facultad': convocatoria.programa?.facultad.nombre || 'N/A',
                'Estado': convocatoria.estado,
                'Fecha Inicio': convocatoria.fecha_inicio.toLocaleDateString(),
                'Fecha Fin': convocatoria.fecha_fin?.toLocaleDateString() || 'N/A',
                'Fecha Cierre Postulaciones': convocatoria.fecha_cierre_postulacion?.toLocaleDateString() || 'N/A',
                'Cupo Máximo': convocatoria.cupo_maximo || 'Ilimitado',
                'Cupo Disponible': convocatoria.cupo_disponible || 'N/A',
                'Horas Ofrecidas': Number(convocatoria.horas_totales_ofrecidas || 0),
                'Requiere Entrevista': convocatoria.requiere_entrevista ? 'Sí' : 'No',
                'Competencias': convocatoria.competencias_requeridas.join(', '),
                'Publicado Por': `${convocatoria.publicador.primer_nombre} ${convocatoria.publicador.primer_apellido}`,
                'Correo Publicador': convocatoria.publicador.correo,
                'Total Postulaciones': convocatoria.postulaciones.length,
                'Postulaciones Aceptadas': convocatoria.postulaciones.filter(p => p.estado === 'ACEPTADA').length,
                'Total Actividades': convocatoria.actividades.length,
                'Total Horas Actividades': convocatoria.actividades.reduce((sum, act) => sum + Number(act.horas_estimadas), 0),
                'Fecha Creación': convocatoria.creado_en.toLocaleDateString()
            }));
        }, 'Error al generar reporte de convocatorias');
    } catch (error) {
        console.error('Error en generarReporteConvocatoriasExcel:', error);
        throw error;
    }
}

/**
 * Generar reporte Excel de actividades y horas
 */
export async function generarReporteActividadesExcel() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const actividades = await prisma.actividad.findMany({
                include: {
                    convocatoria: {
                        select: {
                            titulo: true,
                            categoria: {
                                select: {
                                    nombre: true
                                }
                            },
                            programa: {
                                select: {
                                    nombre: true,
                                    facultad: {
                                        select: {
                                            nombre: true
                                        }
                                    }
                                }
                            }
                        }
                    },
                    creador: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    },
                    reportes: {
                        select: {
                            estado: true,
                            horas_reportadas: true,
                            horas_aprobadas: true,
                            reportado_en: true
                        }
                    }
                }
            });

            return actividades.map(actividad => ({
                'ID': actividad.id,
                'Nombre': actividad.nombre,
                'Descripción': actividad.descripcion || 'N/A',
                'Tipo Actividad': actividad.tipo_actividad,
                'Horas Estimadas': Number(actividad.horas_estimadas),
                'Horas Máximas': Number(actividad.horas_maximas || 0),
                'Fecha Inicio': actividad.fecha_inicio?.toLocaleDateString() || 'N/A',
                'Fecha Límite': actividad.fecha_limite?.toLocaleDateString() || 'N/A',
                'Ubicación': actividad.ubicacion || 'N/A',
                'Materiales Requeridos': actividad.materiales_requeridos.join(', '),
                'Estado Activa': actividad.esta_activa ? 'Sí' : 'No',
                'Convocatoria': actividad.convocatoria?.titulo || 'N/A',
                'Categoría': actividad.convocatoria?.categoria?.nombre || 'N/A',
                'Programa': actividad.convocatoria?.programa?.nombre || 'N/A',
                'Facultad': actividad.convocatoria?.programa?.facultad.nombre || 'N/A',
                'Creado Por': `${actividad.creador.primer_nombre} ${actividad.creador.primer_apellido}`,
                'Correo Creador': actividad.creador.correo,
                'Total Reportes': actividad.reportes.length,
                'Reportes Aprobados': actividad.reportes.filter(r => r.estado === 'APROBADO').length,
                'Reportes Rechazados': actividad.reportes.filter(r => r.estado === 'RECHAZADO').length,
                'Reportes Pendientes': actividad.reportes.filter(r => r.estado === 'REPORTADO').length,
                'Total Horas Reportadas': actividad.reportes.reduce((sum, r) => sum + Number(r.horas_reportadas), 0),
                'Total Horas Aprobadas': actividad.reportes.reduce((sum, r) => sum + Number(r.horas_aprobadas || 0), 0),
                'Fecha Creación': actividad.creado_en.toLocaleDateString()
            }));
        }, 'Error al generar reporte de actividades');
    } catch (error) {
        console.error('Error en generarReporteActividadesExcel:', error);
        throw error;
    }
}

/**
 * Generar reporte Excel de certificados
 */
export async function generarReporteCertificadosExcel() {
    await checkAdmin();
    
    try {
        return await db.execute(async (prisma) => {
            const certificados = await prisma.certificado.findMany({
                include: {
                    estudiante: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            numero_documento: true,
                            correo: true
                        }
                    },
                    emisor: {
                        select: {
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true
                        }
                    }
                }
            });

            return certificados.map(certificado => ({
                'ID': certificado.id,
                'Código Verificación': certificado.codigo_verificacion,
                'Estudiante Documento': certificado.estudiante.numero_documento,
                'Estudiante Nombre': `${certificado.estudiante.primer_nombre} ${certificado.estudiante.primer_apellido}`,
                'Estudiante Correo': certificado.estudiante.correo,
                'Fecha Emisión': certificado.emitido_en.toLocaleDateString(),
                'Emitido Por': `${certificado.emisor.primer_nombre} ${certificado.emisor.primer_apellido}`,
                'Correo Emisor': certificado.emisor.correo
            }));
        }, 'Error al generar reporte de certificados');
    } catch (error) {
        console.error('Error en generarReporteCertificadosExcel:', error);
        throw error;
    }
}
