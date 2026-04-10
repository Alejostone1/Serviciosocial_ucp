import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { generarPDFCertificado } from '@/app/administrador/certificados/actions';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id_convocatoria } = await request.json();

        if (!id_convocatoria) {
            return NextResponse.json({ error: 'ID de convocatoria requerido' }, { status: 400 });
        }

        // Verificar que el usuario sea estudiante
        if (session.user.role !== 'ESTUDIANTE') {
            return NextResponse.json({ error: 'Solo estudiantes pueden generar certificados' }, { status: 403 });
        }

        // Obtener información del estudiante y sus horas
        const resultado = await db.execute(async (prisma) => {
            // Obtener perfil del estudiante
            const perfil = await prisma.perfilEstudiante.findUnique({
                where: { id_usuario: session.user.id },
                include: {
                    usuario: {
                        include: {
                            programa: {
                                include: {
                                    facultad: true
                                }
                            }
                        }
                    }
                }
            });

            if (!perfil) {
                throw new Error('Perfil de estudiante no encontrado');
            }

            // Verificar si ya existe un certificado para esta convocatoria
            const certificadoExistente = await prisma.certificado.findFirst({
                where: {
                    id_estudiante: session.user.id,
                    id_convocatoria: id_convocatoria
                }
            });

            if (certificadoExistente) {
                return {
                    certificado: certificadoExistente,
                    yaExiste: true
                };
            }

            // Obtener horas aprobadas en esta convocatoria
            const reportesAprobados = await prisma.reporteHoras.findMany({
                where: {
                    id_estudiante: session.user.id,
                    id_convocatoria: id_convocatoria,
                    estado: 'APROBADO'
                },
                include: {
                    actividad: {
                        include: {
                            convocatoria: true
                        }
                    }
                }
            });

            if (reportesAprobados.length === 0) {
                throw new Error('No tienes horas aprobadas en esta convocatoria');
            }

            const totalHoras = reportesAprobados.reduce((sum, reporte) => 
                sum + Number(reporte.horas_aprobadas || reporte.horas_reportadas), 0
            );

            // Obtener información de la convocatoria
            const convocatoria = await prisma.convocatoria.findUnique({
                where: { id: id_convocatoria },
                include: {
                    categoria: true
                }
            });

            if (!convocatoria) {
                throw new Error('Convocatoria no encontrada');
            }

            // Obtener administrador para emitir el certificado
            const admin = await prisma.usuario.findFirst({
                where: { rol: 'ADMINISTRADOR' }
            });

            if (!admin) {
                throw new Error('No hay administradores disponibles para emitir certificados');
            }

            // Crear el certificado
            const nuevoCertificado = await prisma.certificado.create({
                data: {
                    id_estudiante: session.user.id,
                    id_convocatoria: id_convocatoria,
                    emitido_por: admin.id,
                    total_horas: totalHoras,
                    periodo_desde: reportesAprobados[0].fecha_actividad,
                    periodo_hasta: reportesAprobados[reportesAprobados.length - 1].fecha_actividad,
                    descripcion: `Certificado de servicio social por ${totalHoras} horas completadas en "${convocatoria.titulo}"`,
                    nombre_aliado: convocatoria.publicado_por === admin.id ? 'Universidad Católica de Pereira' : 'Organización Externa',
                    nombre_convocatoria: convocatoria.titulo,
                    url_pdf: null as any, // Se genera dinámicamente
                    emitido_en: new Date(),
                    esta_vigente: true,
                },
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
                }
            });

            return {
                certificado: nuevoCertificado,
                yaExiste: false,
                totalHoras,
                convocatoria: convocatoria.titulo
            };
        }, 'Error al generar certificado');

        return NextResponse.json({
            mensaje: resultado.yaExiste ? 'Certificado ya existente' : 'Certificado generado exitosamente',
            certificado: resultado.certificado,
            yaExiste: resultado.yaExiste,
            totalHoras: resultado.totalHoras,
            convocatoria: resultado.convocatoria
        });

    } catch (error) {
        console.error('Error al generar certificado:', error);
        return NextResponse.json({ 
            error: error instanceof Error ? error.message : 'Error interno del servidor' 
        }, { status: 500 });
    }
}
