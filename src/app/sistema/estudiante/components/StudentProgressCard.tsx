'use client';

import React from 'react';

interface StudentProgressCardProps {
    currentHours: number;
    requiredHours: number;
}

export default function StudentProgressCard({ currentHours, requiredHours }: StudentProgressCardProps) {
    const percentage = Math.min((currentHours / requiredHours) * 100, 100);
    const remainingHours = Math.max(requiredHours - currentHours, 0);

    // Determinar color según porcentaje
    const getProgressColor = (percent: number) => {
        if (percent >= 70) return '#10b981'; // Verde
        if (percent >= 30) return '#f59e0b'; // Amarillo
        return '#ef4444'; // Rojo
    };

    const progressColor = getProgressColor(percentage);
    const strokeWidth = 8;
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col items-center">
                {/* SVG Circular */}
                <div className="relative">
                    <svg
                        width="120"
                        height="120"
                        className="transform -rotate-90"
                    >
                        {/* Círculo de fondo */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke="#e5e7eb"
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        {/* Círculo de progreso */}
                        <circle
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke={progressColor}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            className="transition-all duration-500 ease-out"
                        />
                    </svg>
                    {/* Texto central */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span 
                            className="text-3xl font-bold"
                            style={{ color: progressColor }}
                        >
                            {Math.round(percentage)}%
                        </span>
                        <span className="text-xs text-gray-500">
                            {currentHours}h / {requiredHours}h
                        </span>
                    </div>
                </div>

                {/* Barra de progreso secundaria */}
                <div className="w-full mt-6">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progreso de horas</span>
                        <span className="font-medium">{currentHours} horas</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="h-2 rounded-full transition-all duration-500 ease-out"
                            style={{
                                width: `${percentage}%`,
                                backgroundColor: progressColor
                            }}
                        />
                    </div>
                </div>

                {/* Texto informativo */}
                <div className="mt-4 text-center">
                    <p className="text-sm font-medium text-gray-700">
                        {remainingHours > 0 
                            ? `Faltan ${remainingHours} horas para cumplir el requisito`
                            : '¡Has completado el requisito de horas!'
                        }
                    </p>
                    {percentage >= 100 && (
                        <p className="text-xs text-green-600 mt-1">
                            🎉 ¡Felicidades! Ya puedes solicitar tu certificado
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
