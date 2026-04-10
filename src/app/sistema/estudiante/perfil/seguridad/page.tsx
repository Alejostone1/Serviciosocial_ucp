'use client';

import React, { useState } from 'react';
import { PageContainer } from '../../components/layout/PageContainer';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { 
    Lock, 
    ShieldCheck, 
    Eye, 
    EyeOff, 
    Loader2, 
    AlertCircle, 
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SeguridadPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
    
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const togglePass = (field: keyof typeof showPass) => {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Las contraseñas nuevas no coinciden");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("La nueva contraseña debe tener al menos 8 caracteres");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/auth/cambiar-contrasena', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Error al cambiar la contraseña");
            }

            toast.success("Contraseña actualizada exitosamente");
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            
            // Redirigir de vuelta al perfil después de un momento
            setTimeout(() => {
                router.push('/sistema/estudiante/perfil');
            }, 2000);

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageContainer>
            <div className="max-w-xl mx-auto space-y-10 pb-20">
                
                {/* Header Sencillo */}
                <div className="space-y-4 border-b border-slate-100 pb-8">
                    <Link 
                        href="/sistema/estudiante/perfil"
                        className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-[#8B1E1E] transition-colors group"
                    >
                        <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />
                        Volver al Perfil
                    </Link>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Seguridad de Cuenta</h1>
                        <p className="text-slate-500 font-medium text-sm">Gestiona tus credenciales de acceso al sistema UCP.</p>
                    </div>
                </div>

                {/* Formulario Integrado con Contornos */}
                <form onSubmit={handleSubmit} className="p-8 border border-slate-200 rounded-3xl bg-white shadow-sm space-y-8">
                    
                    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                        <ShieldCheck className="w-5 h-5 text-[#8B1E1E]" />
                        <h2 className="text-lg font-semibold text-slate-800">Cambiar Contraseña</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Contraseña Actual */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contraseña Actual</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E]" />
                                <input
                                    type={showPass.current ? "text" : "password"}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] outline-none text-slate-900 font-medium transition-all"
                                    placeholder="Contraseña actual"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePass('current')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPass.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100"></div>

                        {/* Nueva Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-[#8B1E1E] uppercase tracking-widest ml-1">Nueva Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E]" />
                                <input
                                    type={showPass.new ? "text" : "password"}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] outline-none text-slate-900 font-medium transition-all"
                                    placeholder="Mínimo 8 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePass('new')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPass.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Confirmar Nueva Contraseña */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#8B1E1E]" />
                                <input
                                    type={showPass.confirm ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-2xl focus:border-[#8B1E1E] focus:ring-1 focus:ring-[#8B1E1E] outline-none text-slate-900 font-medium transition-all"
                                    placeholder="Debe coincidir con la anterior"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePass('confirm')}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPass.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-[#8B1E1E] text-white rounded-2xl font-bold hover:bg-[#7a1a1a] transition-all disabled:opacity-50 text-sm shadow-md active:scale-[0.99]"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                            {loading ? 'Confirmando...' : 'Cambiar Contraseña Institucional'}
                        </button>
                        
                        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700">
                            <AlertCircle className="w-4 h-4 mt-0.5" />
                            <p className="text-[10px] font-medium leading-relaxed">
                                Al cambiar tu contraseña, se cerrarán todas las sesiones activas en otros dispositivos por seguridad.
                            </p>
                        </div>
                    </div>
                </form>

                {/* Pie de página con verificación */}
                <div className="text-center space-y-4">
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Estándar de Seguridad UCP 2026</p>
                    <div className="flex justify-center gap-4">
                        <div className="bg-slate-100 p-2 rounded-lg opacity-30 grayscale"><Lock className="w-4 h-4" /></div>
                        <div className="bg-slate-100 p-2 rounded-lg opacity-30 grayscale"><CheckCircle2 className="w-4 h-4" /></div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
}
