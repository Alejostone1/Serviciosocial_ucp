'use client';

import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function NewsCardSkeleton() {
    return (
        <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-md h-full flex flex-col">
            <Skeleton className="h-48 w-full" />
            <div className="p-6 flex flex-col flex-grow space-y-4">
                <Skeleton className="h-4 w-24 rounded-full" />
                <Skeleton className="h-7 w-full" />
                <Skeleton className="h-7 w-2/3" />

                <div className="space-y-2 mt-2 flex-grow">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>

                <div className="mt-auto pt-4 flex items-center">
                    <Skeleton className="h-5 w-24 rounded-md" />
                </div>
            </div>
        </div>
    );
}

export function NewsSectionSkeleton() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
                    <div className="flex items-center gap-4 w-full max-w-lg">
                        <Skeleton className="w-12 h-1 rounded-full shrink-0" />
                        <Skeleton className="h-9 w-3/4 mb-0.5" />
                    </div>
                    <Skeleton className="h-6 w-20" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[0, 1, 2].map((i) => (
                        <NewsCardSkeleton key={i} />
                    ))}
                </div>
            </div>
        </section>
    );
}
