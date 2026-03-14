import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    colorHex?: string;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    colorHex = '#8B1E1E', // Default Institutional Red
}: MetricCardProps) {
    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f1f5f9] hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="flex items-center justify-between mb-4 relative z-10">
                <div
                    className="p-3 rounded-xl transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${colorHex}15` }}
                >
                    <Icon className="w-6 h-6" style={{ color: colorHex }} />
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${trend.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {trend.isPositive ? '+' : '-'}{Math.abs(trend.value)}%
                    </span>
                )}
            </div>

            <div className="relative z-10">
                <h3 className="text-3xl font-extrabold text-[#111827] mb-1">{value}</h3>
                <p className="text-xs font-bold text-[#64748b] uppercase tracking-wider">{title}</p>
                {description && (
                    <p className="text-[11px] text-[#94a3b8] mt-2 font-medium">{description}</p>
                )}
            </div>

            {/* Decorative Background Blob */}
            <div
                className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-5 pointer-events-none transition-transform group-hover:scale-150"
                style={{ backgroundColor: colorHex }}
            />
        </div>
    );
}
