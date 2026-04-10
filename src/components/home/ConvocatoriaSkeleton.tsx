'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function ConvocatoriaCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="h-2 bg-slate-100" />
            <div className="p-6 flex flex-col h-full space-y-4">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-lg" />
                </div>

                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-4 w-2/3" />

                <div className="space-y-2 mt-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>

                <div className="flex gap-4 mt-4">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-3 w-24" />
                </div>

                <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-50">
                    <Skeleton className="h-10 w-full rounded-xl" />
                    <Skeleton className="h-10 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function ConvocatoriasSkeleton() {
    return (
        <section className="relative w-full py-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
            <div className="relative z-10 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-end mb-12 gap-4">
                    <div className="max-w-2xl w-full">
                        <Skeleton className="h-10 w-3/4 mb-4" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-11 w-11 rounded-full" />
                        <Skeleton className="h-11 w-11 rounded-full" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                        <ConvocatoriaCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
