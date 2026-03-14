import { getUsuarioById } from '../actions';
import { notFound } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { StatusBadge } from '@/components/ui/status-badge';
import Link from 'next/link';
import {
    ChevronLeft,
    Mail,
    Phone,
    Calendar,
    FileText,
    ExternalLink,
    Clock,
    Award,
    Briefcase,
    User,
    GraduationCap
} from 'lucide-react';

export default async function UsuarioDetallePage({ params }: { params: { id: string } }) {
    const usuario = await getUsuarioById(params.id);

    if (!usuario) {
        notFound();
    }

    const nombreCompleto = [
        usuario.primer_nombre,
        usuario.segundo_nombre,
        usuario.primer_apellido,
        usuario.segundo_apellido
    ].filter(Boolean).join(' ');

    const participaciones = usuario.postulaciones_enviadas || [];
    const reportes = usuario.reportes_como_estudiante || [];
    const certificados = usuario.certificados_obtenidos || [];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

            {/* Cabecera de Identidad: Enfoque Humano y Serio */}
            <div className="flex flex-col space-y-6">
                <nav>
                    <Link
                        href="/administrador/usuarios"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold uppercase tracking-wider"
                    >
                        <ChevronLeft className="w-3 h-3" />
                        Directorio de Usuarios
                    </Link>
                </nav>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                {usuario.rol}
                            </span>
                            <StatusBadge status={usuario.esta_bloqueado ? 'BLOQUEADO' : 'ACTIVO'} />
                        </div>
                        <h1 className="text-4xl font-semibold tracking-tight text-slate-900">
                            {nombreCompleto}
                        </h1>
                        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-slate-500 font-medium">
                            <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-slate-400" />
                                {usuario.tipo_documento} {usuario.numero_documento}
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                {usuario.correo}
                            </div>
                            {usuario.telefono && (
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" />
                                    {usuario.telefono}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            href={`/administrador/usuarios/${usuario.id}/editar`}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#8B1E1E] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-[#721818] transition-all"
                        >
                            Editar Información
                        </Link>
                    </div>
                </div>
            </div>

            {/* Grid Principal: Estructura Equilibrada */}
            <div className="grid grid-cols-12 gap-8">

                {/* Lateral: Situación Académica y Métricas */}
                <div className="col-span-12 lg:col-span-4 space-y-8">

                    {usuario.perfil_estudiante && (
                        <section className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-slate-700" />
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Servicio Social Universitario</h3>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Semestre Actual</p>
                                        <p className="text-lg font-semibold text-slate-900">{usuario.perfil_estudiante.semestre_actual || 'N/A'}°</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Código Interno</p>
                                        <p className="text-lg font-semibold text-slate-900">{usuario.perfil_estudiante.codigo_estudiantil || '—'}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Horas Cumplidas</p>
                                            <p className="text-3xl font-bold text-[#8B1E1E]">
                                                {Number(usuario.perfil_estudiante.horas_acumuladas)}
                                                <span className="text-sm text-slate-400 ml-1 font-medium">h</span>
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-600 mb-1">{Number(usuario.perfil_estudiante.porcentaje_avance)}%</p>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full">
                                        <div
                                            className="h-full bg-[#8B1E1E] rounded-full"
                                            style={{ width: `${Number(usuario.perfil_estudiante.porcentaje_avance)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {usuario.programa && (
                        <section className="bg-white border border-slate-200 shadow-sm rounded-lg p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-slate-100 rounded">
                                    <Briefcase className="w-4 h-4 text-slate-600" />
                                </div>
                                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Programa Académico</h3>
                            </div>
                            <p className="text-sm font-semibold text-slate-700 leading-snug">
                                {usuario.programa.nombre}
                            </p>
                        </section>
                    )}

                    <section className="bg-slate-50 border border-slate-200 rounded-lg p-6">
                        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-4">Registro en Plataforma</h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Último acceso</span>
                                <span className="font-semibold text-slate-700">
                                    {usuario.ultimo_acceso
                                        ? format(new Date(usuario.ultimo_acceso), "dd MMM, HH:mm", { locale: es })
                                        : '—'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Miembro desde</span>
                                <span className="font-semibold text-slate-700">{format(new Date(usuario.creado_en), "dd/MM/yyyy", { locale: es })}</span>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Central: Historial y Acreditaciones */}
                <div className="col-span-12 lg:col-span-8 space-y-8">

                    {/* Sección: Participaciones */}
                    <section className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Participación en Proyectos</h3>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                {participaciones.length} REGISTROS
                            </span>
                        </div>

                        <div className="p-0">
                            {participaciones.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-sm font-medium italic bg-slate-50/30">
                                    No se registran participaciones en convocatorias.
                                </div>
                            ) : (
                                <>
                                    {/* Desktop View */}
                                    <div className="hidden md:block">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 text-left">
                                                    <th className="px-6 py-4">Título del Proyecto</th>
                                                    <th className="px-6 py-4">Fecha</th>
                                                    <th className="px-6 py-4">Estado</th>
                                                    <th className="px-1 py-4"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {participaciones.map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[300px]">{p.convocatoria.titulo}</td>
                                                        <td className="px-6 py-4 text-slate-500 font-medium">{format(new Date(p.postulado_en), "dd MMM yyyy", { locale: es })}</td>
                                                        <td className="px-6 py-4"><StatusBadge status={p.estado} /></td>
                                                        <td className="px-4 py-4 text-right">
                                                            <Link href={`/administrador/convocatorias/${p.id_convocatoria}`} className="text-slate-400 hover:text-slate-900 transition-colors">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Mobile View */}
                                    <div className="md:hidden divide-y divide-slate-100">
                                        {participaciones.map((p: any) => (
                                            <div key={p.id} className="p-4 space-y-4">
                                                <div className="flex justify-between items-start gap-4">
                                                    <p className="font-semibold text-slate-900 text-sm line-clamp-2">{p.convocatoria.titulo}</p>
                                                    <Link href={`/administrador/convocatorias/${p.id_convocatoria}`} className="p-2 text-slate-400"><ExternalLink className="w-4 h-4" /></Link>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[11px] font-medium text-slate-500">{format(new Date(p.postulado_en), "dd MMM, yyyy", { locale: es })}</span>
                                                    <StatusBadge status={p.estado} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Sección: Horas/Reportes */}
                    <section className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Control de Actividades y Horas</h3>
                        </div>
                        <div className="p-0">
                            {reportes.length === 0 ? (
                                <div className="p-12 text-center text-slate-400 text-sm font-medium italic bg-slate-50/30">
                                    No se registran actividades validadas.
                                </div>
                            ) : (
                                <>
                                    <div className="hidden md:block">
                                        <table className="w-full text-sm font-medium">
                                            <thead>
                                                <tr className="bg-slate-50/50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 text-left">
                                                    <th className="px-6 py-4">Descripción de Actividad</th>
                                                    <th className="px-6 py-4 text-center">Intensidad</th>
                                                    <th className="px-6 py-4 text-right">Estado</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50 text-slate-700">
                                                {reportes.map((r: any) => (
                                                    <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                                                        <td className="px-6 py-4 font-semibold text-slate-900 truncate max-w-[400px]">{r.actividad.nombre}</td>
                                                        <td className="px-6 py-4 text-center font-bold text-slate-900">{Number(r.horas_reportadas)} horas</td>
                                                        <td className="px-6 py-4 text-right"><StatusBadge status={r.estado} /></td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="md:hidden divide-y divide-slate-100">
                                        {reportes.map((r: any) => (
                                            <div key={r.id} className="p-4 flex justify-between items-center gap-4">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-slate-900 text-sm truncate">{r.actividad.nombre}</p>
                                                    <p className="text-[11px] font-medium text-slate-500 mt-1">{Number(r.horas_reportadas)} h reportadas</p>
                                                </div>
                                                <StatusBadge status={r.estado} />
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Certificados */}
                    <section className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
                        <div className="px-6 py-4 bg-white border-b border-slate-100">
                            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Documentación y Certificados</h3>
                        </div>
                        <div className="p-6">
                            {certificados.length === 0 ? (
                                <div className="text-center py-6 text-slate-400 text-sm font-medium italic">
                                    No se han emitido certificados oficiales para este usuario.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {certificados.map((c: any) => (
                                        <div key={c.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-md hover:border-[#8B1E1E] transition-all group">
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-slate-800">Certificado Servicio Social</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{Number(c.total_horas)} h • {format(new Date(c.emitido_en), "MMM yyyy", { locale: es })}</p>
                                            </div>
                                            <a
                                                href={c.url_pdf}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 border border-slate-200 rounded text-slate-400 group-hover:text-[#8B1E1E] group-hover:border-[#8B1E1E] transition-colors"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}