import React from 'react';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/prisma';
import { DeleteNoticiaButton } from '@/components/noticias/delete-noticia-button';

async function getNoticias() {
    const noticias = await db.execute(async (prisma) => {
        return await prisma.noticia.findMany({
            include: {
                imagenes: {
                    where: { orden: 0 },
                    take: 1
                }
            },
            orderBy: {
                creado_en: 'desc'
            }
        });
    }, 'Error al obtener noticias');

    return noticias;
}

export const metadata = {
    title: 'Gestión de Noticias | Administrador',
};

export default async function NoticiasPage() {
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMINISTRADOR') {
        redirect('/login');
    }

    const noticias = await getNoticias();

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Noticias</h1>
                    <p className="text-slate-600 mt-1">Administra las noticias institucionales del sistema</p>
                </div>
                
                <Link
                    href="/administrador/noticias/nueva"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Nueva Noticia
                </Link>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar noticias..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20"
                        />
                    </div>
                    
                    <select className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20">
                        <option value="">Todas</option>
                        <option value="publicadas">Publicadas</option>
                        <option value="borrador">Borradores</option>
                    </select>
                </div>
            </div>

            {/* News Table */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Noticia
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Autor
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Estado
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Fecha
                                </th>
                                <th className="text-left px-6 py-3 text-xs font-medium text-slate-500 uppercase tracking-wider">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {noticias.map((noticia) => (
                                <tr key={noticia.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {noticia.imagenes.length > 0 && (
                                                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={noticia.imagenes[0].url_imagen}
                                                        alt={noticia.titulo}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-slate-900 line-clamp-1">
                                                    {noticia.titulo}
                                                </div>
                                                <div className="text-sm text-slate-500 line-clamp-1">
                                                    {noticia.resumen}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900">{noticia.autor}</div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            noticia.publicada 
                                                ? 'bg-emerald-100 text-emerald-800' 
                                                : 'bg-amber-100 text-amber-800'
                                        }`}>
                                            {noticia.publicada ? 'Publicada' : 'Borrador'}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-900">
                                            {format(new Date(noticia.creado_en), 'dd MMM yyyy', { locale: es })}
                                        </div>
                                    </td>
                                    
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                href={`/administrador/noticias/${noticia.id}/vista-previa`}
                                                className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                                                title="Ver noticia"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </Link>
                                            
                                            <Link
                                                href={`/administrador/noticias/${noticia.id}/editar`}
                                                className="p-1.5 text-slate-600 hover:text-slate-900 transition-colors"
                                                title="Editar noticia"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            
                                            <DeleteNoticiaButton
                                                noticiaId={noticia.id}
                                                noticiaTitulo={noticia.titulo}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {noticias.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-slate-500 mb-4">No hay noticias registradas</div>
                        <Link
                            href="/administrador/noticias/nueva"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#8B1E1E] text-white rounded-lg hover:bg-[#731919] transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Crear primera noticia
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
