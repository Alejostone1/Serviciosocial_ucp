import React from 'react';
import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

interface ProgressBarProps {
    value: number;
    max?: number;
    showLabel?: boolean;
    size?: 'sm' | 'md' | 'lg';
    colorClass?: string;
    bgClass?: string;
    className?: string;
}

export function ProgressBar({
    value,
    max = 100,
    showLabel = true,
    size = 'md',
    colorClass = 'bg-indigo-600',
    bgClass = 'bg-slate-100',
    className
}: ProgressBarProps) {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4'
    };

    return (
        <div className={twMerge(clsx("w-full flex flex-col gap-2", className))}>
            {showLabel && (
                <div className="flex justify-between text-sm font-semibold tracking-tight text-slate-700">
                    <span>{percentage.toFixed(0)}%</span>
                    <span className="text-slate-500 font-medium">{value} / {max}</span>
                </div>
            )}
            <div className={twMerge(clsx("w-full rounded-full overflow-hidden flex", bgClass, sizeClasses[size]))}>
                <div
                    className={twMerge(clsx("rounded-full transition-all duration-1000 ease-in-out relative", colorClass))}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse rounded-full"></div>
                </div>
            </div>
        </div>
    );
}
