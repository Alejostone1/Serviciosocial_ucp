import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { emailService } from '@/lib/email';
import { whatsappService } from '@/lib/whatsapp';

async function getSession() {
    return await getServerSession(authOptions);
}

// Esquemas de validación
const crearPlantillaSchema = z.object({
    nombre: z.string().min(1, 'El nombre es requerido'),
    tipo: z.enum(['POSTULACION_RECIBIDA', 'POSTULACION_ACEPTADA', 'POSTULACION_RECHAZADA', 'REPORTE_ENVIADO', 'REPORTE_APROBADO', 'REPORTE_RECHAZADO', 'REPORTE_AJUSTE', 'CERTIFICADO_EMITIDO', 'CONVOCATORIA_PUBLICADA', 'SISTEMA']),
    asunto_correo: z.string().optional(),
    mensaje_plantilla: z.string().min(1, 'El mensaje es requerido'),
    mensaje_whatsapp: z.string().optional(),
    variables: z.array(z.string()).optional(),
});

const crearNotificacionMasivaSchema = z.object({
    id_plantilla: z.string().uuid().optional(),
    titulo: z.string().min(1, 'El título es requerido'),
    mensaje: z.string().min(1, 'El mensaje es requerido'),
    canales: z.array(z.enum(['INTERNA', 'CORREO', 'WHATSAPP', 'SMS'])).default(['INTERNA']),
    fecha_programada: z.string().datetime().optional(),
    destinatarios_filtro: z.object({
        programas: z.array(z.string().uuid()).optional(),
        roles: z.array(z.enum(['ADMINISTRADOR', 'PROFESOR', 'ALIADO', 'AUXILIAR', 'ESTUDIANTE'])).optional(),
        facultades: z.array(z.string().uuid()).optional(),
        usuarios_especificos: z.array(z.string().uuid()).optional(),
    }).optional(),
});

// GET: Obtener todas las notificaciones (con filtros)
export async function GET(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const tipo = searchParams.get('tipo');
        const pagina = parseInt(searchParams.get('pagina') || '1');
        const limite = parseInt(searchParams.get('limite') || '20');

        const where: any = {};
        if (tipo) {
            where.tipo = tipo;
        }

        const [notificaciones, total] = await Promise.all([
            prisma.notificacion.findMany({
                where,
                include: {
                    usuario: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                            rol: true,
                        },
                    },
                },
                orderBy: { creado_en: 'desc' },
                skip: (pagina - 1) * limite,
                take: limite,
            }),
            prisma.notificacion.count({ where }),
        ]);

        return NextResponse.json({
            datos: notificaciones,
            paginacion: {
                pagina,
                limite,
                total,
                totalPaginas: Math.ceil(total / limite),
            },
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// POST: Crear notificación masiva o plantilla
export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session?.user?.id || session.user.role !== 'ADMINISTRADOR') {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const body = await request.json();
        const { accion } = body;

        if (accion === 'crear_plantilla') {
            const validatedData = crearPlantillaSchema.parse(body);
            
            const plantilla = await prisma.plantillaNotificacion.create({
                data: {
                    ...validatedData,
                    creado_por: session.user.id,
                    variables: validatedData.variables || [],
                },
            });

            return NextResponse.json(plantilla, { status: 201 });
        }

        if (accion === 'crear_masiva') {
            const validatedData = crearNotificacionMasivaSchema.parse(body);
            
            // Obtener destinatarios según los filtros
            const destinatarios = await obtenerDestinatarios(validatedData.destinatarios_filtro);
            
            const notificacionMasiva = await prisma.notificacionMasiva.create({
                data: {
                    ...validatedData,
                    creado_por: session.user.id,
                    destinatarios_count: destinatarios.length,
                    fecha_programada: validatedData.fecha_programada ? new Date(validatedData.fecha_programada) : null,
                },
            });

            // Si no está programada, enviar inmediatamente
            if (!validatedData.fecha_programada) {
                await procesarEnvioMasivo(notificacionMasiva.id, destinatarios);
            }

            return NextResponse.json(notificacionMasiva, { status: 201 });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Datos inválidos', detalles: error.errors }, { status: 400 });
        }
        console.error('Error al crear notificación:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}

// Función auxiliar para obtener destinatarios según filtros
async function obtenerDestinatarios(filtros?: any) {
    if (!filtros) return [];

    const where: any = { esta_bloqueado: false };

    if (filtros.roles && filtros.roles.length > 0) {
        where.rol = { in: filtros.roles };
    }

    if (filtros.programas && filtros.programas.length > 0) {
        where.id_programa = { in: filtros.programas };
    }

    if (filtros.usuarios_especificos && filtros.usuarios_especificos.length > 0) {
        where.id = { in: filtros.usuarios_especificos };
    }

    // Si hay filtros por facultad, necesitamos join con programas
    if (filtros.facultades && filtros.facultades.length > 0) {
        const usuariosPorFacultad = await prisma.usuario.findMany({
            where: {
                ...where,
                programa: {
                    id_facultad: { in: filtros.facultades }
                }
            },
            select: { id: true }
        });
        return usuariosPorFacultad;
    }

    return await prisma.usuario.findMany({
        where,
        select: { id: true, correo: true, telefono: true }
    });
}

// Función auxiliar para procesar envío masivo
async function procesarEnvioMasivo(notificacionMasivaId: string, destinatarios: any[]) {
    const notificacion = await prisma.notificacionMasiva.findUnique({
        where: { id: notificacionMasivaId },
        include: { plantilla: true }
    });

    if (!notificacion) return;

    let enviados = 0;
    let fallidos = 0;

    for (const destinatario of destinatarios) {
        for (const canal of notificacion.canales) {
            try {
                // Crear registro en historial
                const historial = await prisma.historialEnvioNotif.create({
                    data: {
                        id_notificacion_masiva: notificacionMasivaId,
                        id_usuario_destino: destinatario.id,
                        canal,
                        direccion_envio: canal === 'CORREO' ? destinatario.correo : destinatario.telefono,
                        mensaje_enviado: notificacion.mensaje,
                        estado: 'ENVIADO',
                        enviado_en: new Date(),
                    },
                });

                // Si es canal interno, crear notificación individual
                if (canal === 'INTERNA') {
                    await prisma.notificacion.create({
                        data: {
                            id_usuario: destinatario.id,
                            tipo: 'SISTEMA',
                            titulo: notificacion.titulo,
                            mensaje: notificacion.mensaje,
                        },
                    });
                }

                // Enviar por correo
                if (canal === 'CORREO' && destinatario.correo) {
                    const emailResult = await emailService.sendNotificationEmail(
                        destinatario.correo,
                        notificacion.titulo,
                        notificacion.mensaje,
                        {
                            nombre: destinatario.primer_nombre,
                            programa: destinatario.programa?.nombre,
                        }
                    );
                    
                    if (!emailResult.success) {
                        throw new Error(emailResult.error);
                    }
                }

                // Enviar por WhatsApp
                if (canal === 'WHATSAPP' && destinatario.telefono) {
                    const whatsappResult = await whatsappService.sendNotificationMessage(
                        destinatario.telefono,
                        notificacion.mensaje,
                        {
                            nombre: destinatario.primer_nombre,
                            programa: destinatario.programa?.nombre,
                        }
                    );
                    
                    if (!whatsappResult.success) {
                        throw new Error(whatsappResult.error);
                    }
                }

                enviados++;
            } catch (error) {
                console.error(`Error enviando a ${destinatario.id} por ${canal}:`, error);
                fallidos++;
                
                await prisma.historialEnvioNotif.create({
                    data: {
                        id_notificacion_masiva: notificacionMasivaId,
                        id_usuario_destino: destinatario.id,
                        canal,
                        direccion_envio: canal === 'CORREO' ? destinatario.correo : destinatario.telefono,
                        mensaje_enviado: notificacion.mensaje,
                        estado: 'FALLIDO',
                        error_detalle: error instanceof Error ? error.message : 'Error desconocido',
                    },
                });
            }
        }
    }

    // Actualizar estado de la notificación masiva
    await prisma.notificacionMasiva.update({
        where: { id: notificacionMasivaId },
        data: {
            estado: fallidos === 0 ? 'ENVIADO' : 'FALLIDO',
            enviados_count: enviados,
            fallidos_count: fallidos,
            enviado_en: new Date(),
        },
    });
}
