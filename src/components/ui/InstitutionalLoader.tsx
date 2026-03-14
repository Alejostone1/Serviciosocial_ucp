'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { UCPLogo } from '@/components/ui/UCPLogo';

export function InstitutionalLoader({ priority = false }: { priority?: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 space-y-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                    opacity: [0.4, 1, 0.4],
                    scale: [0.95, 1, 0.95]
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative"
            >
                <UCPLogo variant="round" size={60} priority={priority} />
                <div className="absolute -inset-2 rounded-full border-2 border-[#8B1E1E]/20 animate-ping" />
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex flex-col items-center"
            >
                <div className="flex gap-1.5 mt-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-[#8B1E1E]"
                            animate={{
                                opacity: [0.3, 1, 0.3],
                                scale: [0.8, 1.1, 0.8],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                delay: i * 0.2,
                                ease: "easeInOut"
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export function PulseLoader() {
    return (
        <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-[#8B1E1E] animate-pulse" />
            <div className="w-4 h-4 rounded-full bg-[#8B1E1E] animate-pulse delay-75" />
            <div className="w-4 h-4 rounded-full bg-[#8B1E1E] animate-pulse delay-150" />
        </div>
    );
}
