'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
    Save,
    Loader2,
    Calendar,
    ArrowRight,
    Circle,
    Lock,
    UserCircle,
    Mail,
    Phone,
    Shield,
    Info,
    History,
    CheckCircle2,
    Clock,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PerfilPage() {
    const { user } = useAuth();
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [solicitudPendiente, setSolicitudPendiente] = useState<any>(null);

    // Form state con campos FIDEDIGNOS (Prisma)
    const [formData, setFormData] = useState({
        primerNombre: '',
        segundoNombre: '',
        primerApellido: '',
        segundoApellido: '',
        correo: '',
        tipoDocumento: '',
        documento: '',
        telefono: '',
        carrera: '',
        facultad: '',
        semestre: '',
        codigoEstudiantil: '',
        horasRequeridas: '',
        horasAcumuladas: '0',
        porcentajeAvance: '0',
        ultimoAcceso: 'Recientemente'
    });

    useEffect(() => {
        const cargarDatos = async () => {
            if (user) {
                const typedUser = user as any; 
                const perfil = typedUser.perfil_estudiante;
                const programa = typedUser.programa;
                
                setFormData({
                    primerNombre: user.primer_nombre || '',
                    segundoNombre: user.segundo_nombre || '',
                    primerApellido: user.primer_apellido || '',
                    segundoApellido: user.segundo_apellido || '',
                    correo: user.correo || '',
                    tipoDocumento: user.tipo_documento || 'CC',
                    documento: user.numero_documento || 'N/A',
                    telefono: user.telefono || '', // ASEGURANDO QUE TRAIGA EL TELÉFONO
                    carrera: programa?.nombre || 'No asignada',
                    facultad: programa?.facultad?.nombre || 'No asignada',
                    semestre: perfil?.semestre_actual?.toString() || '1',
                    codigoEstudiantil: perfil?.codigo_estudiantil || 'N/A',
                    horasRequeridas: programa?.horas_requeridas?.toString() || '180',
                    horasAcumuladas: perfil?.horas_acumuladas?.toString() || '0',
                    porcentajeAvance: perfil?.porcentaje_avance?.toString() || '0',
                    ultimoAcceso: user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString('es-CO') : 'Hoy'
                });

                // Verificar si hay una solicitud de cambio pendiente
                try {
                    const res = await fetch('/api/estudiante/perfil/solicitudes-pendientes');
                    if (res.ok) {
                        const data = await res.json();
                        if (data.solicitud) setSolicitudPendiente(data.solicitud);
                    }
                } catch (error) {
                    console.error("Error al cargar solicitudes:", error);
                }

                setCargando(false);
            }
        };
        
        cargarDatos();
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (solicitudPendiente) {
            toast.error("Ya tienes una solicitud de cambio bajo revisión del administrador.");
            return;
        }

        setGuardando(true);

        try {
            const res = await fetch('/api/estudiante/perfil/solicitar-cambio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    primer_nombre: formData.primerNombre,
                    segundo_nombre: formData.segundoNombre,
                    primer_apellido: formData.primerApellido,
                    segundo_apellido: formData.segundoApellido,
                    telefono: formData.telefono,
                    semestre_actual: parseInt(formData.semestre)
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast.success("Solicitud enviada. Los cambios se aplicarán una vez que el administrador los apruebe.");
                setSolicitudPendiente(data.solicitud);
            } else {
                throw new Error("Error al enviar solicitud");
            }
        } catch (error) {
            toast.error("No se pudo enviar la solicitud. Inténtalo de nuevo.");
        } finally {
            setGuardando(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (cargando) {
        return (
            <PageContainer>
                <div className="flex justify-center py-20 text-[#8B1E1E]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <div className="max-w-6xl mx-auto space-y-12 pb-20">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 border-b border-slate-100 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Verificado • {formData.ultimoAcceso}</span>
                        </div>
                        <h1 className="text-4xl font-semibold text-slate-900 tracking-tight">
                            {formData.primerNombre} {formData.primerApellido}
                        </h1>
                        <p className="text-slate-500 font-medium">Información Académica y de Identidad Institucional</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/sistema/estudiante/perfil/seguridad"
                            className="flex items-center justify-center gap-3 px-6 py-3.5 border border-slate-200 text-slate-600 rounded-2xl font-semibold hover:bg-slate-50 transition-all text-sm"
                        >
                            <Lock className="w-4 h-4" />
                            Seguridad Institucional
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={guardando || !!solicitudPendiente}
                            className="flex items-center justify-center gap-3 px-10 py-3.5 bg-[#8B1E1E] text-white rounded-2xl font-bold hover:bg-[#7a1a1a] transition-all disabled:opacity-50 text-sm shadow-md shadow-red-900/10"
                        >
                            {guardando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {guardando ? 'Firmando Solicitud...' : 'Solicitar Cambio de Datos'}
                        </button>
                    </div>
                </div>

                {/* Banner de Solicitud Pendiente */}
                {solicitudPendiente && (
                    <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-6 shadow-sm">
                        <div className="p-3 bg-white rounded-2xl shadow-sm text-amber-600 shrink-0">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div className="flex-1 space-y-1 text-center md:text-left">
                            <p className="font-bold text-amber-900">Solicitud de actualización bajo revisión</p>
                            <p className="text-sm text-amber-700/80 leading-relaxed font-medium">
                                Has solicitado un cambio en tus datos personales el día {new Date(solicitudPendiente.creado_en).toLocaleDateString()}. 
                                Los campos modificados serán validados por la oficina de Servicio Social antes de aplicarse.
                            </p>
                        </div>
                        <div className="px-6 py-2 bg-amber-100 rounded-full text-amber-800 font-bold text-xs uppercase tracking-widest border border-amber-200">
                            Pendiente
                        </div>
                    </div>
                )}

                {/* Quick Stats Grid Centrado */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: 'Identificador', value: formData.codigoEstudiantil },
                        { label: 'Facultad / Unidad', value: formData.facultad },
                        { label: 'Carga de Horas', value: `${formData.horasAcumuladas} / ${formData.horasRequeridas} h`, highlight: true },
                        { label: 'Periodo / Semestre', value: `${formData.semestre}° Ciclo` }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center justify-center p-8 border border-slate-200 rounded-[2.5rem] bg-white shadow-sm hover:shadow-md transition-all text-center min-h-[180px] relative overflow-hidden group border-b-4 border-b-slate-100 hover:border-b-[#8B1E1E]">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">{item.label}</p>
                            <p className={`text-lg font-bold leading-tight ${item.highlight ? 'text-[#8B1E1E]' : 'text-slate-800'}`}>
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Main Identity Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-2 space-y-8">
                        {/* Identidad */}
                        <div className="p-10 border border-slate-200 rounded-[3rem] bg-white space-y-10 shadow-sm">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <UserCircle className="w-6 h-6 text-[#8B1E1E]" />
                                <h2 className="text-xl font-semibold text-slate-800">Identidad del Estudiante</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primer Nombre</label>
                                    <input
                                        type="text"
                                        name="primerNombre"
                                        value={formData.primerNombre}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#8B1E1E] outline-none text-slate-900 font-bold transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Segundo Nombre</label>
                                    <input
                                        type="text"
                                        name="segundoNombre"
                                        value={formData.segundoNombre}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#8B1E1E] outline-none text-slate-900 font-bold transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Primer Apellido</label>
                                    <input
                                        type="text"
                                        name="primerApellido"
                                        value={formData.primerApellido}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#8B1E1E] outline-none text-slate-900 font-bold transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Segundo Apellido</label>
                                    <input
                                        type="text"
                                        name="segundoApellido"
                                        value={formData.segundoApellido}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#8B1E1E] outline-none text-slate-900 font-bold transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contacto y Registro */}
                        <div className="p-10 border border-slate-200 rounded-[3rem] bg-white space-y-10 shadow-sm">
                            <div className="flex items-center gap-3 pb-6 border-b border-slate-50">
                                <Shield className="w-6 h-6 text-slate-300" />
                                <h2 className="text-xl font-semibold text-slate-800">Contacto y Registro</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número de Contacto</label>
                                    <div className="relative">
                                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                        <input
                                            type="text"
                                            name="telefono"
                                            value={formData.telefono}
                                            onChange={handleInputChange}
                                            className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-[#8B1E1E] outline-none text-slate-900 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 text-[#8B1E1E]">Ciclo Académico Actual</label>
                                    <select
                                        name="semestre"
                                        value={formData.semestre}
                                        onChange={handleInputChange}
                                        className="w-full px-6 py-3.5 bg-white border border-slate-200 rounded-2xl outline-none font-bold"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                            <option key={s} value={s}>{s}° Semestre Académico</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Sidebar */}
                    <div className="space-y-8">
                        {/* Correo card */}
                        <div className="p-8 border border-slate-200 rounded-[3rem] bg-slate-50 space-y-8 shadow-sm">
                            <div className="space-y-2">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Correo de Enlace</h3>
                                <div className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                                    <Mail className="w-5 h-5 text-[#8B1E1E]" />
                                    <span className="text-xs font-black tracking-tight text-slate-700 truncate">{formData.correo}</span>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-slate-200">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-[#8B1E1E]/5 rounded-xl">
                                        <Info className="w-4 h-4 text-[#8B1E1E]" />
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed italic">
                                        Para modificar tu documento de identidad ({formData.tipoDocumento} {formData.documento}), debes presentar el documento original ante secretaría académica.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* SOPORTE CARD - REDESIGN TO LIGHT */}
                        <div className="p-10 border border-slate-200 rounded-[3rem] bg-white space-y-8 shadow-sm relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-10 -mt-10 transition-transform duration-700 group-hover:bg-[#8B1E1E]/5"></div>
                            
                            <div className="space-y-2 relative">
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Soporte Servicio Social</h3>
                                <p className="text-sm font-bold text-slate-800 tracking-tight leading-relaxed">¿Dudas sobre tus trámites?</p>
                            </div>

                            <div className="space-y-3 relative">
                                {[
                                    { text: 'Historial de Solicitudes', link: '#' },
                                    { text: 'Reglamento UCP', link: '#' },
                                    { text: 'Centro de Ayuda', link: '#' }
                                ].map(item => (
                                    <button key={item.text} className="w-full flex items-center justify-between py-3 px-1 border-b border-slate-50 text-xs font-bold text-slate-500 hover:text-[#8B1E1E] transition-all group">
                                        <span>{item.text}</span>
                                        <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}

function GraduationCap(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
        </svg>
    )
}
