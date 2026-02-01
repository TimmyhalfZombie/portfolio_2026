'use client';

import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { useRef } from 'react';

interface ScrollableCardProps {
    children: React.ReactNode;
    i: number;
}

export default function ScrollableCard({ children, i }: ScrollableCardProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    // 1. Track scroll progress of the specific container
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'] // Animation runs while element is in view
    });

    // 2. Map scroll to animation values (The "Setting")
    const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85]);
    const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]); // Slight upward drift

    // Random rotation for the "tossed" look
    const rotateValue = (i % 2 === 0 ? 1 : -1) * (Math.random() * 2 + 1);

    return (
        <div ref={containerRef} className="h-[150vh] relative mb-10 md:mb-20 last:mb-0 last:h-auto">
            {/* Reduced height from 300vh to 150vh for better UX, but sufficient for effect */}
            <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
                <motion.div
                    style={{ scale, opacity, y, rotate: rotateValue }}
                    className="w-full max-w-md md:max-w-xl bg-black border border-neutral-800 shadow-2xl rounded-2xl relative z-10"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
