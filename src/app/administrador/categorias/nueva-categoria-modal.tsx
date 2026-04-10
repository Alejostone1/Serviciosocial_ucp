'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FormModal } from '@/components/ui/form-modal';
import { toast } from 'sonner';
import { crearCategoria } from './actions';
import * as LucideIcons from 'lucide-react';

const icons = [
    'Tags', 'TreePine', 'GraduationCap', 'Users', 'Heart', 'Library', 'Briefcase', 'Code',
    'Microscope', 'Globe', 'Languages', 'Book', 'FileText', 'Lightbulb', 'Hammer', 'Cpu',
    'Layers', 'Table', 'Layout', 'MessageSquare', 'Settings', 'Activity', 'Anchor', 'Award',
    'BarChart', 'Battery', 'Bell', 'Box', 'Camera', 'CheckCircle', 'Cloud', 'Compass',
    'CreditCard', 'Database', 'Eye', 'Feather', 'Flag', 'Flashlight', 'Folder', 'Gift',
    'HardDrive', 'Headphones', 'Home', 'Image', 'Inbox', 'Key', 'LifeBuoy', 'Link',
    'Lock', 'Map', 'Music', 'Package', 'Paperclip', 'PieChart', 'Printer', 'Radio',
    'Save', 'Search', 'Send', 'Smartphone', 'Speaker', 'Star', 'Sun', 'Terminal',
    'ThumbsUp', 'Trash', 'Truck', 'Tv', 'Video', 'Watch', 'Wifi', 'Zap'
];

const schema = z.object({
    nombre: z.string().min(3, 'Mínimo 3 caracteres').max(100),
    descripcion: z.string().optional().or(z.literal('')),
    icono: z.string().max(100).default('Tags'),
    color_hex: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Debe ser un hex válido ej. #FF0000').optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (cat: any) => void;
}

export function NuevaCategoriaModal({ isOpen, onClose, onSuccess }: Props) {
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { color_hex: '#8B1E1E', icono: 'Tags' }
    });

    const watchIcon = watch('icono') || 'Tags';
    const watchColor = watch('color_hex') || '#8B1E1E';

    // Manejar cambio de color para actualizar la vista previa
    const handleColorChange = (color: string) => {
        setValue('color_hex', color);
    };

    const onSubmit = async (values: FormData) => {
        setIsLoading(true);
        const toastId = toast.loading('Creando categoría...');
        try {
            const cat = await crearCategoria({
                nombre: values.nombre,
                descripcion: values.descripcion || undefined,
                icono: values.icono,
                color_hex: values.color_hex || undefined,
            });
            toast.success('✅ Categoría creada', { id: toastId, description: `'${cat.nombre}' ha sido registrada.` });
            reset();
            onSuccess(cat);
        } catch (e: any) {
            toast.error('Error al crear', { id: toastId, description: 'La categoría ya existe o no tienes permisos.' });
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = "w-full px-3.5 py-2.5 border border-[#e2e8f0] rounded-lg text-sm text-[#1e293b] focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] transition-colors bg-[#f8fafc] focus:bg-white placeholder:text-[#94a3b8]";

    return (
        <FormModal isOpen={isOpen} onClose={onClose} title="Nueva Categoría" subtitle="Crea una categoría para clasificar las convocatorias de servicio social.">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Nombre <span className="text-red-500">*</span></label>
                    <input {...register('nombre')} className={inputClass} placeholder="Ej. Medio Ambiente" />
                    {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Descripción</label>
                    <textarea
                        {...register('descripcion')}
                        rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="Descripción opcional..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Ícono <span className="text-red-500">*</span></label>
                    <div className="border border-[#e2e8f0] rounded-lg p-3 bg-[#f8fafc] max-h-40 overflow-y-auto grid grid-cols-8 gap-2">
                        {icons.map((iconName) => {
                            const IconComponent = (LucideIcons as any)[iconName];
                            return (
                                <button
                                    key={iconName}
                                    type="button"
                                    onClick={() => setValue('icono', iconName)}
                                    className={`p-2 flex items-center justify-center rounded-md transition-all border ${watchIcon === iconName
                                            ? 'shadow-md scale-110 border-2'
                                            : 'bg-white border-transparent text-[#64748b] hover:bg-slate-50 hover:border-slate-200'
                                        }`}
                                    style={{
                                        backgroundColor: watchIcon === iconName ? watchColor : undefined,
                                        borderColor: watchIcon === iconName ? watchColor : undefined,
                                        color: watchIcon === iconName ? 'white' : undefined
                                    }}
                                    title={iconName}
                                >
                                    {IconComponent && <IconComponent className="w-5 h-5" />}
                                </button>
                            );
                        })}
                    </div>
                    {/* Vista previa del icono con color */}
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-2">Vista previa:</p>
                        <div className="flex items-center gap-2">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center border-2"
                                style={{
                                    backgroundColor: watchColor,
                                    borderColor: watchColor,
                                    color: 'white'
                                }}
                            >
                                {(LucideIcons as any)[watchIcon] ? React.createElement((LucideIcons as any)[watchIcon], { className: "w-4 h-4" }) : React.createElement(LucideIcons.Tags, { className: "w-4 h-4" })}
                            </div>
                            <span className="text-sm font-mono text-gray-700">{watchColor}</span>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-[#334155] mb-1.5">Color Hexadecimal</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            {...register('color_hex')}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                            {...register('color_hex')}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className={`${inputClass} font-mono`}
                            placeholder="#000000"
                        />
                    </div>
                    {errors.color_hex && <p className="mt-1 text-xs text-red-500">{errors.color_hex.message}</p>}
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-[#f1f5f9]">
                    <button type="button" onClick={() => { reset(); onClose(); }} className="px-4 py-2 text-sm font-semibold text-[#475569] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors">
                        Cancelar
                    </button>
                    <button type="submit" disabled={isLoading} className="px-5 py-2 text-sm font-bold text-white bg-[#8B1E1E] rounded-lg hover:bg-[#731919] transition-colors disabled:opacity-60 flex items-center gap-2">
                        {isLoading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Guardando...</> : 'Crear Categoría'}
                    </button>
                </div>
            </form>
        </FormModal>
    );
}
