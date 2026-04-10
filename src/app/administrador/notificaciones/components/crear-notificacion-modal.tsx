'use client';

import React, { useState, useEffect } from 'react';
import { X, Users, User, Mail, MessageSquare, Send, Plus, Trash2, Search, ChevronDown, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

interface Usuario {
    id: string;
    primer_nombre: string;
    primer_apellido: string;
    correo: string;
    telefono?: string;
    rol: string;
    programa?: {
        id: string;
        nombre: string;
    };
    facultad?: {
        id: string;
        nombre: string;
    };
}

interface Programa {
    id: string;
    nombre: string;
}

interface Facultad {
    id: string;
    nombre: string;
}

interface Plantilla {
    id: string;
    nombre: string;
    tipo: string;
    asunto_correo: string | null;
    mensaje_plantilla: string;
    mensaje_whatsapp: string | null;
    variables: string[];
    esta_activa: boolean;
}

interface CrearNotificacionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    plantillas?: Plantilla[];
}

export function CrearNotificacionModal({ isOpen, onClose, onSuccess, plantillas: plantillasProp }: CrearNotificacionModalProps) {
    const [activeTab, setActiveTab] = useState<'inmediato' | 'programado'>('inmediato');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    
    // Estado del formulario
    const [formData, setFormData] = useState({
        titulo: '',
        mensaje: '',
        canales: [] as string[],
        tipo_envio: 'individual' as 'individual' | 'todos' | 'filtro',
        usuariosSeleccionados: [] as string[],
        filtros: {
            programas: [] as string[],
            facultades: [] as string[],
            roles: [] as string[]
        },
        programacion: {
            fecha: '',
            hora: '12:00'
        },
        id_plantilla: '' as string
    });

    // Datos para filtros
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [programas, setProgramas] = useState<Programa[]>([]);
    const [facultades, setFacultades] = useState<Facultad[]>([]);
    const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdowns, setShowDropdowns] = useState({
        programas: false,
        facultades: false,
        roles: false
    });

    const roles = ['ESTUDIANTE', 'ADMINISTRADOR', 'PROFESOR', 'ALIADO', 'AUXILIAR'];
    const canalesDisponibles = [
        { id: 'INTERNA', label: 'Notificación Interna', icon: MessageSquare },
        { id: 'CORREO', label: 'Correo Electrónico', icon: Mail },
        { id: 'WHATSAPP', label: 'WhatsApp', icon: Send }
    ];

    // Cargar datos iniciales
    useEffect(() => {
        if (isOpen) {
            cargarDatos();
            // Usar plantillas pasadas como prop o cargar del servidor
            if (plantillasProp && plantillasProp.length > 0) {
                setPlantillas(plantillasProp);
            } else {
                cargarPlantillas();
            }
        }
    }, [isOpen, plantillasProp]);

    const cargarPlantillas = async () => {
        try {
            const response = await fetch('/api/admin/notificaciones?tipo=plantillas');
            if (response.ok) {
                const data = await response.json();
                setPlantillas(data.datos || []);
            }
        } catch (error) {
            console.error('Error cargando plantillas:', error);
        }
    };

    const cargarDatos = async () => {
        try {
            const [usuariosRes, programasRes, facultadesRes] = await Promise.all([
                fetch('/api/admin/usuarios'),
                fetch('/api/admin/programas'),
                fetch('/api/admin/facultades')
            ]);

            if (usuariosRes.ok) {
                const usuariosData = await usuariosRes.json();
                setUsuarios(usuariosData);
            }

            if (programasRes.ok) {
                const programasData = await programasRes.json();
                setProgramas(programasData);
            }

            if (facultadesRes.ok) {
                const facultadesData = await facultadesRes.json();
                setFacultades(facultadesData);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            toast.error('Error al cargar datos');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let payload: any = {
                accion: 'crear_masiva',
                titulo: formData.titulo,
                mensaje: formData.mensaje,
                canales: formData.canales,
            };

            // Construir filtros según tipo de envío
            if (formData.tipo_envio === 'todos') {
                payload.destinatarios_filtro = {};
            } else if (formData.tipo_envio === 'individual') {
                payload.destinatarios_filtro = {
                    usuarios_especificos: formData.usuariosSeleccionados
                };
            } else if (formData.tipo_envio === 'filtro') {
                payload.destinatarios_filtro = {
                    programas: formData.filtros.programas.length > 0 ? formData.filtros.programas : undefined,
                    facultades: formData.filtros.facultades.length > 0 ? formData.filtros.facultades : undefined,
                    roles: formData.filtros.roles.length > 0 ? formData.filtros.roles : undefined
                };
            }

            // Agregar programación si aplica
            if (activeTab === 'programado') {
                payload.fecha_programada = `${formData.programacion.fecha}T${formData.programacion.hora}:00`;
            }

            console.log('Payload enviado:', payload);

            const response = await fetch('/api/admin/notificaciones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const responseData = await response.json();

            if (response.ok) {
                toast.success('Notificación creada y enviada exitosamente');
                onSuccess();
                handleClose();
            } else {
                console.error('Error response:', responseData);
                toast.error(responseData.error || responseData.detalles?.[0]?.message || 'Error al crear notificación');
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Error al crear notificación');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setStep(1);
        setFormData({
            titulo: '',
            mensaje: '',
            canales: [],
            tipo_envio: 'individual',
            usuariosSeleccionados: [],
            filtros: { programas: [], facultades: [], roles: [] },
            programacion: { fecha: '', hora: '12:00' },
            id_plantilla: ''
        });
        onClose();
    };

    const toggleCanal = (canal: string) => {
        setFormData(prev => ({
            ...prev,
            canales: prev.canales.includes(canal)
                ? prev.canales.filter(c => c !== canal)
                : [...prev.canales, canal]
        }));
    };

    const toggleUsuario = (usuarioId: string) => {
        setFormData(prev => ({
            ...prev,
            usuariosSeleccionados: prev.usuariosSeleccionados.includes(usuarioId)
                ? prev.usuariosSeleccionados.filter(id => id !== usuarioId)
                : [...prev.usuariosSeleccionados, usuarioId]
        }));
    };

    const toggleFiltro = (tipo: 'programas' | 'facultades' | 'roles', valor: string) => {
        setFormData(prev => ({
            ...prev,
            filtros: {
                ...prev.filtros,
                [tipo]: prev.filtros[tipo].includes(valor)
                    ? prev.filtros[tipo].filter(v => v !== valor)
                    : [...prev.filtros[tipo], valor]
            }
        }));
    };

    const seleccionarPlantilla = (plantilla: Plantilla) => {
        setFormData(prev => ({
            ...prev,
            id_plantilla: plantilla.id,
            titulo: plantilla.asunto_correo || plantilla.nombre,
            mensaje: plantilla.mensaje_plantilla
        }));
    };

    const limpiarPlantilla = () => {
        setFormData(prev => ({
            ...prev,
            id_plantilla: '',
            titulo: '',
            mensaje: ''
        }));
    };

    const usuariosFiltrados = usuarios.filter(usuario =>
        `${usuario.primer_nombre} ${usuario.primer_apellido} ${usuario.correo}`.toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    const getPreviewUsuarios = () => {
        if (formData.tipo_envio === 'todos') return 'Todos los usuarios del sistema';
        if (formData.tipo_envio === 'individual') return `${formData.usuariosSeleccionados.length} usuarios seleccionados`;
        if (formData.tipo_envio === 'filtro') {
            const filtrosActivos = [
                formData.filtros.programas.length > 0 ? `${formData.filtros.programas.length} programas` : '',
                formData.filtros.facultades.length > 0 ? `${formData.filtros.facultades.length} facultades` : '',
                formData.filtros.roles.length > 0 ? `${formData.filtros.roles.length} roles` : ''
            ].filter(Boolean).join(', ');
            return `Usuarios por filtros: ${filtrosActivos || 'Ningún filtro activo'}`;
        }
        return '';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Crear Notificación Masiva</h2>
                        <p className="text-gray-600 mt-1">Envía notificaciones a múltiples usuarios</p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Progress Steps */}
                <div className="px-8 py-6 border-b bg-gray-50/50">
                    <div className="flex items-center justify-between max-w-2xl mx-auto">
                        {[1, 2, 3].map((stepNum) => {
                            const labels = ['Contenido', 'Destinatarios', 'Configuración'];
                            return (
                                <div key={stepNum} className="flex flex-col items-center group">
                                    <div className="flex items-center">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 shadow-sm ${
                                            step >= stepNum 
                                                ? 'bg-[#8B1E1E] text-white ring-4 ring-[#8B1E1E]/10' 
                                                : 'bg-white border-2 border-gray-200 text-gray-400'
                                        }`}>
                                            {step > stepNum ? <Check className="w-5 h-5" /> : stepNum}
                                        </div>
                                        {stepNum < 3 && (
                                            <div className="w-20 sm:w-32 h-0.5 mx-2 relative overflow-hidden bg-gray-200">
                                                <div className={`absolute inset-0 bg-[#8B1E1E] transition-transform duration-500 origin-left ${
                                                    step > stepNum ? 'scale-x-100' : 'scale-x-0'
                                                }`} />
                                            </div>
                                        )}
                                    </div>
                                    <span className={`mt-3 text-xs font-semibold uppercase tracking-wider transition-colors duration-300 ${
                                        step >= stepNum ? 'text-[#8B1E1E]' : 'text-gray-400'
                                    }`}>
                                        {labels[stepNum - 1]}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Selector de Plantillas */}
                            {plantillas.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-blue-900 mb-2">
                                        <FileText className="w-4 h-4 inline mr-1" />
                                        Usar Plantilla (opcional)
                                    </label>
                                    <div className="flex gap-2">
                                        <select
                                            value={formData.id_plantilla}
                                            onChange={(e) => {
                                                const plantilla = plantillas.find(p => p.id === e.target.value);
                                                if (plantilla) {
                                                    seleccionarPlantilla(plantilla);
                                                } else {
                                                    limpiarPlantilla();
                                                }
                                            }}
                                            className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                        >
                                            <option value="">-- Seleccionar plantilla --</option>
                                            {plantillas.filter(p => p.esta_activa).map(plantilla => (
                                                <option key={plantilla.id} value={plantilla.id}>
                                                    {plantilla.nombre} ({plantilla.tipo})
                                                </option>
                                            ))}
                                        </select>
                                        {formData.id_plantilla && (
                                            <button
                                                type="button"
                                                onClick={limpiarPlantilla}
                                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Limpiar plantilla"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    {formData.id_plantilla && (
                                        <p className="text-xs text-blue-700 mt-2">
                                            Plantilla seleccionada: se ha prellenado el título y mensaje
                                        </p>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título de la Notificación
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.titulo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Nueva convocatoria disponible"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mensaje
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.mensaje}
                                    onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    placeholder="Escribe el mensaje completo de la notificación..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Canales de Envío
                                </label>
                                <div className="space-y-2">
                                    {canalesDisponibles.map(canal => {
                                        const Icon = canal.icon;
                                        return (
                                            <label key={canal.id} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.canales.includes(canal.id)}
                                                    onChange={() => toggleCanal(canal.id)}
                                                    className="mr-3"
                                                />
                                                <Icon className="w-5 h-5 mr-3 text-gray-600" />
                                                <span className="flex-1 font-medium">{canal.label}</span>
                                                {canal.id === 'INTERNA' && (
                                                    <span className="text-xs text-gray-500">Notificación dentro del sistema</span>
                                                )}
                                                {canal.id === 'CORREO' && (
                                                    <span className="text-xs text-gray-500">Requiere correo válido</span>
                                                )}
                                                {canal.id === 'WHATSAPP' && (
                                                    <span className="text-xs text-gray-500">Requiere número telefónico</span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    disabled={!formData.titulo || !formData.mensaje || formData.canales.length === 0}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente: Destinatarios
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-base font-bold text-gray-800 mb-6">
                                    Tipo de Envío
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[
                                        { id: 'todos', title: 'Todos los Usuarios', desc: 'Envío global a todos', icon: Users },
                                        { id: 'individual', title: 'Usuarios Específicos', desc: 'Selección uno a uno', icon: User },
                                        { id: 'filtro', title: 'Por Filtros', desc: 'Segmentar por rol/programa', icon: Search }
                                    ].map((opt) => {
                                        const Icon = opt.icon;
                                        const isSelected = formData.tipo_envio === opt.id;
                                        return (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, tipo_envio: opt.id as any }))}
                                                className={`group relative p-4 border-2 rounded-xl text-left transition-all duration-300 hover:shadow-md ${
                                                    isSelected
                                                        ? 'border-[#8B1E1E] bg-[#8B1E1E]/5 shadow-sm ring-1 ring-[#8B1E1E]/20'
                                                        : 'border-gray-100 bg-white hover:border-gray-200'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                                        isSelected ? 'bg-[#8B1E1E] text-white shadow-inner' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'
                                                    }`}>
                                                        <Icon className="w-5 h-5" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <h3 className={`text-sm font-bold transition-colors ${isSelected ? 'text-[#8B1E1E]' : 'text-gray-900 group-hover:text-[#8B1E1E]'}`}>
                                                            {opt.title}
                                                        </h3>
                                                        <p className="text-[11px] text-gray-400 line-clamp-1">
                                                            {opt.desc}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -top-1.5 -right-1.5 bg-[#8B1E1E] text-white rounded-full p-0.5 shadow-sm border-2 border-white animate-in zoom-in-50 duration-200">
                                                        <Check className="w-3 h-3" />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Usuarios Específicos */}
                            {formData.tipo_envio === 'individual' && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="text-sm font-medium text-gray-700">
                                            Seleccionar Usuarios ({formData.usuariosSeleccionados.length} seleccionados)
                                        </label>
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Buscar usuarios..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="border rounded-lg max-h-60 overflow-y-auto">
                                        {usuariosFiltrados.map(usuario => (
                                            <label key={usuario.id} className="flex items-center p-3 hover:bg-gray-50 border-b last:border-b-0">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.usuariosSeleccionados.includes(usuario.id)}
                                                    onChange={() => toggleUsuario(usuario.id)}
                                                    className="mr-3"
                                                />
                                                <div className="flex-1">
                                                    <div className="font-medium">
                                                        {usuario.primer_nombre} {usuario.primer_apellido}
                                                    </div>
                                                    <div className="text-sm text-gray-600">
                                                        {usuario.correo} • {usuario.rol}
                                                        {usuario.programa && ` • ${usuario.programa.nombre}`}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Por Filtros */}
                            {formData.tipo_envio === 'filtro' && (
                                <div className="space-y-4">
                                    {/* Programas */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Programas ({formData.filtros.programas.length} seleccionados)
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDropdowns(prev => ({ ...prev, programas: !prev.programas }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400"
                                            >
                                                <span>
                                                    {formData.filtros.programas.length > 0
                                                        ? `${formData.filtros.programas.length} programas seleccionados`
                                                        : 'Seleccionar programas...'}
                                                </span>
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            {showDropdowns.programas && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                    {programas.map(programa => (
                                                        <label key={programa.id} className="flex items-center p-2 hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.filtros.programas.includes(programa.id)}
                                                                onChange={() => toggleFiltro('programas', programa.id)}
                                                                className="mr-2"
                                                            />
                                                            {programa.nombre}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Facultades */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Facultades ({formData.filtros.facultades.length} seleccionados)
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDropdowns(prev => ({ ...prev, facultades: !prev.facultades }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400"
                                            >
                                                <span>
                                                    {formData.filtros.facultades.length > 0
                                                        ? `${formData.filtros.facultades.length} facultades seleccionadas`
                                                        : 'Seleccionar facultades...'}
                                                </span>
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            {showDropdowns.facultades && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                    {facultades.map(facultad => (
                                                        <label key={facultad.id} className="flex items-center p-2 hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.filtros.facultades.includes(facultad.id)}
                                                                onChange={() => toggleFiltro('facultades', facultad.id)}
                                                                className="mr-2"
                                                            />
                                                            {facultad.nombre}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Roles */}
                                    <div>
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Roles ({formData.filtros.roles.length} seleccionados)
                                        </label>
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={() => setShowDropdowns(prev => ({ ...prev, roles: !prev.roles }))}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-gray-400"
                                            >
                                                <span>
                                                    {formData.filtros.roles.length > 0
                                                        ? `${formData.filtros.roles.length} roles seleccionados`
                                                        : 'Seleccionar roles...'}
                                                </span>
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            {showDropdowns.roles && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                                                    {roles.map(rol => (
                                                        <label key={rol} className="flex items-center p-2 hover:bg-gray-50">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.filtros.roles.includes(rol)}
                                                                onChange={() => toggleFiltro('roles', rol)}
                                                                className="mr-2"
                                                            />
                                                            {rol}
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(3)}
                                    disabled={
                                        (formData.tipo_envio === 'individual' && formData.usuariosSeleccionados.length === 0) ||
                                        (formData.tipo_envio === 'filtro' && 
                                         formData.filtros.programas.length === 0 && 
                                         formData.filtros.facultades.length === 0 && 
                                         formData.filtros.roles.length === 0)
                                    }
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                                >
                                    Siguiente: Configuración
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            {/* Tabs de Envío */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Programación del Envío
                                </label>
                                <div className="flex space-x-4 border-b">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('inmediato')}
                                        className={`pb-2 px-1 font-medium text-sm transition-colors ${
                                            activeTab === 'inmediato'
                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        Envío Inmediato
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('programado')}
                                        className={`pb-2 px-1 font-medium text-sm transition-colors ${
                                            activeTab === 'programado'
                                                ? 'border-b-2 border-blue-600 text-blue-600'
                                                : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                    >
                                        Programar Envío
                                    </button>
                                </div>
                            </div>

                            {/* Programación */}
                            {activeTab === 'programado' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha de Envío
                                        </label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.programacion.fecha}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                programacion: { ...prev.programacion, fecha: e.target.value }
                                            }))}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Hora de Envío
                                        </label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.programacion.hora}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                programacion: { ...prev.programacion, hora: e.target.value }
                                            }))}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Resumen */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">Resumen de la Notificación</h3>
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">Título:</span> {formData.titulo}
                                    </div>
                                    <div>
                                        <span className="font-medium">Canales:</span> {formData.canales.join(', ')}
                                    </div>
                                    <div>
                                        <span className="font-medium">Destinatarios:</span> {getPreviewUsuarios()}
                                    </div>
                                    <div>
                                        <span className="font-medium">Programación:</span> {
                                            activeTab === 'inmediato' ? 'Envío inmediato' :
                                            `${formData.programacion.fecha} a las ${formData.programacion.hora}`
                                        }
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Anterior
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || (activeTab === 'programado' && !formData.programacion.fecha)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Creando...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            {activeTab === 'inmediato' ? 'Enviar Ahora' : 'Programar Envío'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}
