'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { StickerData } from './StickerConfig';

interface StickerProps {
    data: StickerData;
}

export const Sticker: React.FC<StickerProps> = ({ data }) => {
    const { src, alt, width, top, left, rotate, delay, zIndex, priority } = data;
    const [hasEntered, setHasEntered] = useState(false);

    return (
        <motion.div
            className="absolute pointer-events-auto"
            style={{
                top,
                left,
                zIndex,
                width,
                cursor: 'grab',
            }}
            initial={{ opacity: 0, scale: 0.7, rotate: rotate - 10 }}
            animate={{
                opacity: 1,
                scale: 1,
                rotate: rotate,
            }}
            transition={
                hasEntered
                    ? { scale: { duration: 0.1 }, opacity: { duration: 0.1 } }
                    : {
                          opacity: { duration: 0.5, delay },
                          scale: { duration: 0.5, delay, ease: 'backOut' },
                          rotate: { duration: 0.5, delay },
                      }
            }
            onAnimationComplete={() => setHasEntered(true)}
            whileTap={{ scale: 1.03 }}
            whileDrag={{ zIndex: 70, cursor: 'grabbing' }}
            drag
            dragMomentum={false}
            dragElastic={0.15}
        >
            <div className="relative w-full h-full">
                <Image
                    src={src}
                    alt={alt}
                    width={width}
                    height={width}
                    className="object-contain select-none"
                    style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                    draggable={false}
                    priority={priority}
                />
            </div>
        </motion.div>
    );
};
