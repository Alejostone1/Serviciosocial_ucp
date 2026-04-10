/**
 * btn-variants.ts
 * Sistema centralizado de variantes de botones para el panel administrativo UCP.
 * 
 * Color institucional primario: #8B1E1E (guinda institucional UCP)
 * Paleta secundaria: slate-700/slate-50 (neutros profesionales)
 * 
 * Uso:
 *   import { btn } from '@/lib/btn-variants';
 *   <button className={btn.primary}>Guardar</button>
 *   <button className={btn.secondary}>Cancelar</button>
 *   <button className={btn.danger}>Eliminar</button>
 *   <button className={btn.ghost}>Ver</button>
 *   <button className={btn.iconAction}>  <Pencil/>  </button>
 *   <button className={btn.iconDanger}>  <Trash/>  </button>
 *   <button className={btn.iconView}>    <Eye/>     </button>
 */

export const btn = {
    /**
     * Primario — Acción principal (guardar, crear, confirmar)
     * Guinda institucional UCP
     */
    primary:
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white '
        + 'bg-[#8B1E1E] hover:bg-[#731919] active:bg-[#5f1515] '
        + 'border border-[#8B1E1E] '
        + 'shadow-sm hover:shadow '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/30 focus:ring-offset-1 '
        + 'disabled:opacity-50 disabled:cursor-not-allowed',

    /**
     * Secundario — Acción de soporte (cancelar, exportar, volver)
     * Fondo blanco, borde slate
     */
    secondary:
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold '
        + 'text-[#475569] bg-white '
        + 'border border-[#e2e8f0] hover:border-[#cbd5e1] '
        + 'hover:bg-[#f8fafc] active:bg-[#f1f5f9] '
        + 'shadow-sm '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:ring-offset-1 '
        + 'disabled:opacity-50 disabled:cursor-not-allowed',

    /**
     * Peligro — Acciones destructivas (eliminar, bloquear)
     * Guinda más oscuro con semántica de advertencia
     */
    danger:
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white '
        + 'bg-[#7f1d1d] hover:bg-[#6b1717] active:bg-[#581212] '
        + 'border border-[#7f1d1d] '
        + 'shadow-sm hover:shadow '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#7f1d1d]/30 focus:ring-offset-1 '
        + 'disabled:opacity-50 disabled:cursor-not-allowed',

    /**
     * Fantasma (ghost) — Acciones de bajo peso visual (enlace-botón)
     */
    ghost:
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold '
        + 'text-[#8B1E1E] bg-transparent '
        + 'hover:bg-[#8B1E1E]/8 active:bg-[#8B1E1E]/15 '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/25 focus:ring-offset-1 '
        + 'disabled:opacity-50 disabled:cursor-not-allowed',

    /**
     * Outline — Variante con borde guinda, sin relleno
     */
    outline:
        'inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold '
        + 'text-[#8B1E1E] bg-transparent '
        + 'border border-[#8B1E1E]/40 hover:border-[#8B1E1E] hover:bg-[#8B1E1E]/5 '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/25 focus:ring-offset-1 '
        + 'disabled:opacity-50 disabled:cursor-not-allowed',

    /**
     * Ícono de acción — Editar, ver (neutro → guinda al hover)
     */
    iconAction:
        'p-1.5 rounded-lg text-[#94a3b8] '
        + 'hover:text-[#8B1E1E] hover:bg-[#8B1E1E]/8 '
        + 'border border-transparent hover:border-[#8B1E1E]/20 '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20',

    /**
     * Ícono de peligro — Eliminar, bloquear (neutro → rojo oscuro al hover)
     */
    iconDanger:
        'p-1.5 rounded-lg text-[#94a3b8] '
        + 'hover:text-[#7f1d1d] hover:bg-[#7f1d1d]/8 '
        + 'border border-transparent hover:border-[#7f1d1d]/20 '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#7f1d1d]/20',

    /**
     * Ícono de ver/navegar (neutro → slate-700 al hover)
     */
    iconView:
        'p-1.5 rounded-lg text-[#94a3b8] '
        + 'hover:text-[#334155] hover:bg-[#f1f5f9] '
        + 'border border-transparent hover:border-[#e2e8f0] '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-slate-300/50',

    /**
     * Ícono desbloquear/restaurar (neutro → verde-oscuro al hover)
     */
    iconSuccess:
        'p-1.5 rounded-lg text-[#94a3b8] '
        + 'hover:text-[#166534] hover:bg-[#166534]/8 '
        + 'border border-transparent hover:border-[#166534]/20 '
        + 'transition-all duration-150 '
        + 'focus:outline-none focus:ring-2 focus:ring-[#166534]/20',
} as const;

/**
 * Clases reutilizables para inputs de formularios del panel admin.
 */
export const input = {
    base:
        'w-full px-3.5 py-2.5 rounded-lg text-sm text-[#1e293b] '
        + 'bg-[#f8fafc] border border-[#e2e8f0] '
        + 'placeholder:text-[#94a3b8] '
        + 'focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#8B1E1E]/20 focus:border-[#8B1E1E] '
        + 'transition-colors',

    error:
        'w-full px-3.5 py-2.5 rounded-lg text-sm text-[#1e293b] '
        + 'bg-[#fff8f8] border border-[#fca5a5] '
        + 'placeholder:text-[#94a3b8] '
        + 'focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-900/20 focus:border-red-900 '
        + 'transition-colors',
} as const;
