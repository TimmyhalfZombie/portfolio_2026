'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { StickerData } from './StickerConfig';

interface StickerProps {
    data: StickerData;
}

const LOCAL_PLAYLIST = [
  { src: '/mp3/Hot Mulligan - I Dont Think Its the Right Time for Emojis.mp3', name: "Hot Mulligan - I Don't Think It's the Right Time for Emojis" },
  { src: '/mp3/The Story So Far Big Blind.mp3', name: 'The Story So Far - Big Blind' },
];

let globalAudio: HTMLAudioElement | null = null;
let currentAudioIndex = 0;

function getAudioController() {
    if (typeof window === 'undefined') return null;
    if (!globalAudio) {
        globalAudio = new Audio();
        globalAudio.addEventListener('ended', () => {
            currentAudioIndex = (currentAudioIndex + 1) % LOCAL_PLAYLIST.length;
            if (globalAudio) {
                globalAudio.src = LOCAL_PLAYLIST[currentAudioIndex].src;
                globalAudio.play().catch(console.error);
            }
        });
    }

    return {
        play: () => {
            if (!globalAudio) return;
            if (!globalAudio.src || globalAudio.src === window.location.href) {
                globalAudio.src = LOCAL_PLAYLIST[currentAudioIndex].src;
            }
            globalAudio.play().catch(console.error);
        },
        pause: () => {
            globalAudio?.pause();
        },
        next: () => {
            currentAudioIndex = (currentAudioIndex + 1) % LOCAL_PLAYLIST.length;
            if (globalAudio) {
                globalAudio.src = LOCAL_PLAYLIST[currentAudioIndex].src;
            }
        },
        getSongName: () => LOCAL_PLAYLIST[currentAudioIndex].name
    };
}

export const Sticker: React.FC<StickerProps> = ({ data }) => {
    const { src, alt, width, top, left, rotate, delay, zIndex, priority, popup, tapEffect } = data;
    const [hasEntered, setHasEntered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [isFlying, setIsFlying] = useState(false);
    const [ghostRect, setGhostRect] = useState<DOMRect | null>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const flyRef = useRef<HTMLDivElement>(null);
    const ghostFlyRef = useRef<HTMLDivElement>(null);
    const isFlyingGuard = useRef(false);
    const wasDragged = useRef(false);

    // Close popup when clicking outside the sticker or after 3 seconds
    useEffect(() => {
        if (!showPopup) return;

        // Auto-close after 3 seconds
        const timerId = setTimeout(() => {
            setShowPopup(false);
        }, 3000);

        const handleClickOutside = (e: PointerEvent) => {
            if (stickerRef.current && !stickerRef.current.contains(e.target as Node)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
            clearTimeout(timerId); // Cleanup the timer if it closes before 3 seconds
        };
    }, [showPopup]);

    // ── Fly-Around: Trigger ──
    // Captures the sticker's current position, then portals a "ghost" copy at z-3
    // so it passes behind the cards (z-10) without affecting other stickers (z-30 layer).
    const flyAround = () => {
        const el = flyRef.current;
        if (!el || isFlyingGuard.current) return;
        isFlyingGuard.current = true;

        // Snapshot the sticker's current rendered position (includes drag offset)
        const rect = el.getBoundingClientRect();
        setGhostRect(rect);
        setIsFlying(true);
    };

    // ── Fly-Around: Animation (runs after ghost portal mounts) ──
    useEffect(() => {
        if (!isFlying || !ghostFlyRef.current || !ghostRect) return;

        const el = ghostFlyRef.current;
        const vw = window.innerWidth;

        const exitLeft = ghostRect.right + 50;
        const enterRight = vw - ghostRect.left + 50;

        const anim = el.animate(
            [
                { transform: 'translateX(0)', easing: 'ease-in' },
                { transform: `translateX(${-exitLeft}px)`, offset: 0.4, easing: 'steps(1)' },
                { transform: `translateX(${enterRight}px)`, offset: 0.401, easing: 'ease-out' },
                { transform: 'translateX(0)' },
            ],
            {
                duration: 3000,
                fill: 'none',
            }
        );

        anim.onfinish = () => {
            isFlyingGuard.current = false;
            setIsFlying(false);
            setGhostRect(null);
        };

        return () => { anim.cancel(); };
    }, [isFlying, ghostRect]);

    const spotifyClickCount = useRef(0);

    // ── Click handler that works alongside drag ──
    const handleClick = () => {
        if (wasDragged.current) return;
        if (popup) setShowPopup((prev) => !prev);
        else if (tapEffect === 'flyAround') flyAround();
        else if (tapEffect === 'spotify') {
            const controller = getAudioController();
            if (controller) {
                spotifyClickCount.current++;
                const count = spotifyClickCount.current;
                
                if (count % 2 === 1) {
                    if (count > 1) {
                        controller.next();
                    }
                    
                    controller.play();
                    toast.success(`Playing ${controller.getSongName()} 🎵`, { id: 'spotify-toast', duration: 3000 });
                } else {
                    controller.pause();
                    toast('Radio paused', { 
                        id: 'spotify-toast',
                        icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" /></svg>
                    });
                }
            } else {
                toast.error('Audio player not ready yet.');
            }
        }
    };

    return (
        <>
            <motion.div
                ref={stickerRef}
                className="absolute pointer-events-auto"
                style={{
                    top,
                    left,
                    zIndex: isFlying ? 1 : showPopup ? 100 : zIndex,
                    width,
                    cursor: popup || tapEffect ? 'pointer' : 'grab',
                }}
                initial={{ opacity: 0, scale: 0.3, rotate }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    rotate,
                }}
                transition={
                    hasEntered
                        ? { scale: { duration: 0.1 }, opacity: { duration: 0.1 } }
                        : {
                            opacity: { duration: 0.3, delay },
                            scale: { type: 'spring', stiffness: 260, damping: 15, delay },
                        }
                }
                onAnimationComplete={() => setHasEntered(true)}
                onClick={handleClick}
                onDragStart={() => {
                    wasDragged.current = true;
                }}
                onDragEnd={() => {
                    setTimeout(() => {
                        wasDragged.current = false;
                    }, 100);
                }}
                whileTap={{ scale: 1.03 }}
                whileDrag={{ zIndex: 70, cursor: 'grabbing' }}
                drag
                dragMomentum={false}
                dragElastic={0.15}
            >
                {/* ── Popup Tooltip ── */}
                <AnimatePresence>
                    {showPopup && popup && (
                        <motion.div
                            key="sticker-popup"
                            className="absolute bottom-full left-1/2 mb-3 pointer-events-auto"
                            style={{ x: '-50%', rotate: -rotate }}
                            initial={{ opacity: 0, y: 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 6, scale: 0.92 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="relative bg-black border-[1.5px] border-white rounded-xl px-4 py-3 w-[300px] text-center font-mono text-sm font-semibold text-white select-none leading-relaxed">
                                {popup.text}{' '}
                                {popup.linkUrl && popup.linkText && (
                                    <a
                                        href={popup.linkUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="underline underline-offset-2 decoration-white/70 hover:decoration-white transition-colors"
                                    >
                                        {popup.linkText}
                                    </a>
                                )}

                                {/* Downward caret/triangle */}
                                <div
                                    className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 bg-black rotate-45"
                                    style={{
                                        borderRight: '1.5px solid white',
                                        borderBottom: '1.5px solid white',
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Sticker Image ── */}
                <div ref={flyRef} className="relative w-full h-full" style={{ opacity: isFlying ? 0 : 1 }}>
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

            {/* ── Fly-Around Ghost (portaled to body at z-3, behind cards at z-10) ── */}
            {isFlying && ghostRect && typeof window !== 'undefined' && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: ghostRect.top,
                        left: ghostRect.left,
                        width: ghostRect.width,
                        height: ghostRect.height,
                        zIndex: 3,
                        pointerEvents: 'none',
                    }}
                >
                    <div ref={ghostFlyRef}>
                        <Image
                            src={src}
                            alt={alt}
                            width={width}
                            height={width}
                            className="object-contain select-none"
                            style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                            draggable={false}
                        />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};
