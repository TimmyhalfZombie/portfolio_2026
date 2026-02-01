'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface StickerProps {
    src: string;
    alt: string;
    className?: string;
    initialX: number | string;
    initialY: number | string;
    rotate?: number;
    width?: number;
    delay?: number;
}

export const FloatingSticker: React.FC<StickerProps> = ({
    src,
    alt,
    className,
    initialX,
    initialY,
    rotate = 0,
    width = 100,
    delay = 0,
}) => {
    return (
        <motion.div
            className={`absolute ${className}`}
            style={{ left: initialX, top: initialY, zIndex: 10 }}
            initial={{ opacity: 0, scale: 0.8, rotate: rotate - 10 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: rotate,
                y: [0, -10, 0], // Floating effect
            }}
            transition={{
                opacity: { duration: 0.5, delay },
                scale: { duration: 0.5, delay },
                rotate: { duration: 0.5, delay },
                y: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 2 // Randomize float start
                }
            }}
            drag
            dragConstraints={{ left: -50, right: 50, top: -50, bottom: 50 }}
        >
            <div className="relative group cursor-grab active:cursor-grabbing">
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={width} // Aspect ratio might vary but keeping it simple
                    className="object-contain drop-shadow-2xl pointer-events-none select-none"
                    draggable={false}
                />
            </div>
        </motion.div>
    );
};
