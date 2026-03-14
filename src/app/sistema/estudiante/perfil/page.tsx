'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PageContainer } from '../components/layout/PageContainer';
import { SectionHeader } from '../components/ui/SectionHeader';
import { DashboardCard } from '../components/ui/DashboardCard';
import {
    User,
    Mail,
    Phone,
    GraduationCap,
    Calendar,
    Camera,
    Save,
    MapPin,
    Clock,
    Building,
    Shield,
    FileText,
    AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

export default function PerfilPage() {
    const { user } = useAuth();
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        correo: '',
        tipoDocumento: '',
        documento: '',
        telefono: '',
        carrera: '',
        facultad: '',
        semestre: ''
    });

    useEffect(() => {
        // Simulating data load from context/API to initialize form
        if (user) {
            setFormData({
                nombre: `${user.primer_nombre || ''} ${user.segundo_nombre || ''}`.trim(),
                apellidos: `${user.primer_apellido || ''} ${user.segundo_apellido || ''}`.trim(),
                correo: user.correo || '',
                tipoDocumento: 'CC', // Mock
                documento: user.numero_documento || '1088...',
                telefono: '300 000 0000', // Mock
                carrera: 'Ingeniería de Sistemas', // Mock
                facultad: 'Ingeniería', // Mock
                semestre: '8' // Mock
            });
            setCargando(false);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGuardando(true);

        // Simulating API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        toast.success("Perfil actualizado correctamente");
        setGuardando(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (cargando) {
        return (
            <PageContainer>
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-indigo-600 animate-spin" />
                </div>
            </PageContainer>
        );
    }

    const initials = (formData.nombre.charAt(0) + formData.apellidos.charAt(0)).toUpperCase() || 'U';

    return (
        <PageContainer>
            <SectionHeader
                title="Mi Perfil"
                description="Administra tu información personal y académica."
            >
                <button
                    onClick={handleSubmit}
                    disabled={guardando}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {guardando ? (
                        <>
                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                            <span>Guardando...</span>
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            <span>Guardar Cambios</span>
                        </>
                    )}
                </button>
            </SectionHeader>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Lateral Profile Info (Avatar + Status) */}
                <div className="lg:col-span-4 space-y-8">
                    <DashboardCard title="Foto de Perfil">
                        <div className="flex flex-col items-center">
                            <div className="relative group cursor-pointer mb-6">
                                <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-bold text-slate-400">
                                    {initials}
                                </div>
                                <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                                    <Camera className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">{formData.nombre} {formData.apellidos}</h3>
                            <p className="text-slate-500 text-sm text-center mb-4">{formData.correo}</p>

                            <div className="w-full flex justify-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 font-medium text-xs rounded-full ring-1 ring-inset ring-emerald-600/20">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                                    Cuenta Activa
                                </span>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-full ring-1 ring-inset ring-indigo-600/20">
                                    Estudiante
                                </span>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Estado de Cuenta" icon={Shield}>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Rol</span>
                                <span className="text-sm font-semibold text-slate-700">Estudiante</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-sm text-slate-500">Registro</span>
                                <span className="text-sm font-semibold text-slate-700">Hace 6 meses</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500">Último Acceso</span>
                                <span className="text-sm font-semibold text-slate-700">Hoy, 10:45 AM</span>
                            </div>
                        </div>
                    </DashboardCard>
                </div>

                {/* Form Inputs */}
                <div className="lg:col-span-8 flex flex-col gap-8">

                    <DashboardCard title="Información Personal" icon={User}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Nombres</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="nombre"
                                        value={formData.nombre}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900 text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Apellidos</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="apellidos"
                                        value={formData.apellidos}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900 text-sm transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Tipo Documento</label>
                                <select
                                    name="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900 text-sm transition-all appearance-none"
                                >
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Número Documento</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="documento"
                                        value={formData.documento}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm"
                                        readOnly
                                        disabled
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 group">
                                        <AlertCircle className="w-4 h-4 text-amber-500 cursor-help" />
                                        <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-900 text-white text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            Comunícate con soporte para modificar el documento.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        name="correo"
                                        value={formData.correo}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="telefono"
                                        value={formData.telefono}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900 text-sm transition-all"
                                        placeholder="No registrado"
                                    />
                                </div>
                            </div>
                        </div>
                    </DashboardCard>

                    <DashboardCard title="Información Académica" icon={GraduationCap}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Programa / Carrera</label>
                                <div className="relative">
                                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="carrera"
                                        value={formData.carrera}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Facultad</label>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        name="facultad"
                                        value={formData.facultad}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Semestre Actual</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <select
                                        name="semestre"
                                        value={formData.semestre}
                                        onChange={handleInputChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none text-slate-900 text-sm transition-all appearance-none"
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => (
                                            <option key={s} value={s}>{s}° Semestre</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">Horas Requeridas SS</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        value="180 Horas"
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-medium text-sm"
                                        readOnly
                                        disabled
                                    />
                                </div>
                            </div>

                        </div>
                    </DashboardCard>
                </div>
            </form>
        </PageContainer>
    );
}
