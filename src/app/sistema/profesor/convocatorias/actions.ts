'use server';

import { db } from '@/lib/prisma';
import { EstadoConvocatoria, Modalidad } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

/**
 * Validar permisos de PROFESOR
 */
async function checkProfesor() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user.role !== 'PROFESOR' && session.user.role !== 'ADMINISTRADOR')) {
        throw new Error('No autorizado');
    }
    return session;
}

/**
 * Obtener las convocatorias del profesor logueado
 */
export async function getConvocatoriasProfesor() {
    const session = await checkProfesor();

    try {
        return await db.execute(async (prisma) => {
            const convocatorias = await prisma.convocatoria.findMany({
                where: {
                    publicado_por: session.user.id
                },
                include: {
                    categoria: true,
                    programa: {
                        include: {
                            facultad: true
                        }
                    },
                    publicador: {
                        select: {
                            id: true,
                            primer_nombre: true,
                            primer_apellido: true,
                            correo: true,
                        },
                    },
                    _count: {
                        select: {
                            postulaciones: true,
                            actividades: true
                        }
                    }
                },
                orderBy: {
                    creado_en: 'desc'
                }
            });

            return convocatorias.map(conv => ({
                ...conv,
                horas_totales_ofrecidas: conv.horas_totales_ofrecidas ? Number(conv.horas_totales_ofrecidas) : null,
            }));
        }, 'Error al obtener convocatorias del profesor');
    } catch (error) {
        console.error('Error en getConvocatoriasProfesor:', error);
        throw error;
    }
}

/**
 * Crear convocatoria (Versión Profesor)
 * Si enviarARevision = true, estado = ESPERANDO_CONFIRMACION
 * Si enviarARevision = false, estado = BORRADOR
 */
export async function crearConvocatoriaProfesor(data: any, enviarARevision: boolean = true) {
    const session = await checkProfesor();

    try {
        return await db.execute(async (prisma) => {
            const userId = session.user.id;

            // Obtener el programa del profesor si no se especifica
            let id_programa = data.id_programa;
            if (!id_programa) {
                const usuario = await prisma.usuario.findUnique({
                    where: { id: userId },
                    select: { id_programa: true }
                });
                id_programa = usuario?.id_programa;
            }

            // Determinar estado según el flujo
            const estado = enviarARevision ? 'ESPERANDO_CONFIRMACION' : 'BORRADOR';

            // Crear la convocatoria
            const convocatoria = await prisma.convocatoria.create({
                data: {
                    titulo: data.titulo,
                    descripcion: data.descripcion,
                    objetivo: data.objetivo || null,
                    id_categoria: data.id_categoria || null,
                    id_programa: id_programa || null,
                    modalidad: data.modalidad,
                    lugar: data.lugar || null,
                    url_convocatoria_externa: data.url_convocatoria_externa || null,
                    competencias_requeridas: data.competencias_requeridas || [],
                    estado: estado as EstadoConvocatoria,
                    fecha_inicio: new Date(data.fecha_inicio),
                    fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : null,
                    fecha_cierre_postulacion: data.fecha_cierre_postulacion ? new Date(data.fecha_cierre_postulacion) : null,
                    cupo_maximo: data.cupo_maximo ? parseInt(data.cupo_maximo) : null,
                    cupo_disponible: data.cupo_maximo ? parseInt(data.cupo_maximo) : null,
                    horas_totales_ofrecidas: data.horas_totales_ofrecidas ? parseFloat(data.horas_totales_ofrecidas) : null,
                    url_banner: data.url_banner || null,
                    requiere_entrevista: data.requiere_entrevista || false,
                    publicado_por: userId,
                }
            });

            // Si hay actividades, crearlas también
            if (data.actividades && data.actividades.length > 0) {
                await prisma.actividad.createMany({
                    data: data.actividades.map((act: any) => ({
                        id_convocatoria: convocatoria.id,
                        nombre: act.nombre,
                        descripcion: act.descripcion || null,
                        tipo_actividad: act.tipo_actividad,
                        horas_estimadas: act.horas_estimadas,
                        esta_activa: true,
                        creado_por: userId,
                    }))
                });
            }

            revalidatePath('/sistema/profesor/convocatorias');
            return convocatoria;
        }, 'Error al crear convocatoria');
    } catch (error) {
        console.error('Error en crearConvocatoriaProfesor:', error);
        throw error;
    }
}

/**
 * Obtener opciones para el formulario (categorías, etc.)
 */
export async function getOpcionesProfesor() {
    await checkProfesor();

    return await db.execute(async (prisma) => {
        const [categorias, programasRaw] = await Promise.all([
            prisma.categoriaServicioSocial.findMany({ where: { esta_activa: true } }),
            prisma.programa.findMany({ where: { esta_activo: true } })
        ]);
        
        // Convertir Decimals a números
        const programas = programasRaw.map(p => ({
            ...p,
            horas_requeridas: p.horas_requeridas ? Number(p.horas_requeridas) : null
        }));
        
        return { categorias, programas };
    }, 'Error al obtener opciones');
}
