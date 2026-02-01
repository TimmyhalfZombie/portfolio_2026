'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

export const CardDeck = () => {
    return (
        <div className="relative w-[400px] h-[300px] md:w-[500px] md:h-[350px]">
            {/* Background Cards (giving the stack effect) */}
            <div className="absolute inset-0 bg-neutral-800 rounded-2xl transform translate-y-4 scale-[0.95] opacity-50 border border-neutral-700 shadow-2xl z-0"></div>
            <div className="absolute inset-0 bg-neutral-900 rounded-2xl transform translate-y-2 scale-[0.98] opacity-80 border border-neutral-800 shadow-2xl z-10"></div>

            {/* Main Card */}
            <motion.div
                className="absolute inset-0 bg-black rounded-2xl border border-neutral-800 shadow-[0_0_50px_-12px_rgba(255,255,255,0.2)] z-20 flex flex-col p-8 justify-between"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                {/* Header: Link and Counter */}
                <div className="flex justify-between items-start">
                    {/* LinkedIn Icon placeholder or social icon */}
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        in
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 bg-neutral-900 rounded-full px-3 py-1 border border-neutral-800">
                            <button className="text-neutral-500 hover:text-white transition-colors"><ChevronLeft size={14} /></button>
                            <span className="text-neutral-300 text-xs font-mono">1 / 9</span>
                            <button className="text-neutral-500 hover:text-white transition-colors"><ChevronRight size={14} /></button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-white leading-relaxed font-mono">
                        Yo, I'm Milo. I help founders (actually) use AI for growth.
                    </h1>
                </div>

                {/* Footer: Button */}
                <div className="mt-4">
                    <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm flex items-center space-x-2 hover:bg-neutral-200 transition-colors group">
                        <span>Join 15k+</span>
                        <ArrowUpRight size={16} className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
