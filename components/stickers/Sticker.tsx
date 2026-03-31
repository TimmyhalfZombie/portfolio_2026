'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { StickerData } from './StickerConfig';
import { ContactModal } from '../ContactModal';
import { CertificatesModal } from '../CertificatesModal';

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
    const [showContactModal, setShowContactModal] = useState(false);
    const [showCertificatesModal, setShowCertificatesModal] = useState(false);
    const [popupIndex, setPopupIndex] = useState(0);
    const [isFlying, setIsFlying] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);
    const [ghostRect, setGhostRect] = useState<DOMRect | null>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const flyRef = useRef<HTMLDivElement>(null);
    const ghostFlyRef = useRef<HTMLDivElement>(null);
    const isFlyingGuard = useRef(false);
    const wasDragged = useRef(false);

    // Close popup when clicking outside the sticker or after timeout
    useEffect(() => {
        if (!showPopup) return;

        // Auto-close after custom duration or default 5 seconds
        const timerId = setTimeout(() => {
            setShowPopup(false);
        }, popup?.duration || 5000);

        const handleClickOutside = (e: PointerEvent) => {
            if (stickerRef.current && !stickerRef.current.contains(e.target as Node)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
            clearTimeout(timerId); // Cleanup the timer if it closes before duration
        };
    }, [showPopup, popup?.duration]);

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
        if (popup) {
            if (!showPopup && Array.isArray(popup.text)) {
                const len = popup.text.length;
                if (len > 1) {
                    setPopupIndex(prev => {
                        let next = Math.floor(Math.random() * len);
                        if (next === prev) next = (next + 1) % len;
                        return next;
                    });
                }
            }
            setShowPopup((prev) => !prev);
        }
        else if (tapEffect === 'flyAround') flyAround();
        else if (tapEffect === 'bounce') {
            if (!isBouncing) {
                setIsBouncing(true);
                setTimeout(() => setIsBouncing(false), 1500); // 3 bounces total ~1.5s
            }
        }
        else if (tapEffect === 'contact') {
            setShowContactModal(true);
        }
        else if (tapEffect === 'certificates') {
            setShowCertificatesModal(true);
        }
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

    // Deterministic pseudo-random based on sticker ID (avoids SSR hydration mismatch)
    const seededRandom = (seed: string, offset = 0) => {
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash) + offset;
            hash |= 0;
        }
        return (Math.abs(hash) % 1000) / 1000; // 0..1
    };
    const initialScale = 1.4 + seededRandom(data.id, 1) * 0.4; // 1.4x to 1.8x

    // ── Pre-calculate dynamic popup alignment to prevent bleeding off screen ──
    let rawLeft = 50;
    if (typeof left === 'string') {
        const match = left.match(/(-?[\d.]+)%/);
        if (match) rawLeft = parseFloat(match[1]);
    }
    // Smoothly constrain mapping between 12% and 88% so the caret doesn't intersect the tooltip's curved corners
    const safeLeft = Math.max(12, Math.min(88, rawLeft));
    const popupTranslateX = `-${safeLeft}%`;
    const caretLeftPos = `${safeLeft}%`;


    return (
        <>
            <motion.div
                ref={stickerRef}
                className="absolute pointer-events-auto"
                style={{
                    top,
                    left,
                    zIndex: isFlying ? 1 : showPopup ? 100 : zIndex,
                    width: `clamp(${Math.floor(width * 0.75)}px, ${(width / 14.4).toFixed(2)}vw, ${width}px)`,
                    cursor: popup || tapEffect ? 'pointer' : 'grab',
                    willChange: 'transform, opacity',
                }}
                initial={{
                    opacity: 0,
                    scale: initialScale,
                    y: 0,
                    rotate
                }}
                animate={
                    isBouncing
                        ? {
                            y: [0, -30, 0, -30, 0, -30, 0], // 3 bounces
                            scale: 1,
                            opacity: 1,
                            rotate,
                        }
                        : {
                            opacity: hasEntered ? 1 : [0, 1, 1],
                            scale: hasEntered ? 1 : [initialScale, 0.94, 1], // Very subtle, gentle soft shrink
                            y: 0,
                            rotate,
                        }
                }
                transition={
                    isBouncing
                        ? { y: { duration: 1.5, ease: 'easeOut' } }
                        : hasEntered
                            ? { scale: { duration: 0.1 }, opacity: { duration: 0.1 } }
                            : {
                                duration: 0.7, // Extracted duration to float gracefully over 700ms instead of slamming
                                delay: delay,
                                times: [0, 0.6, 1], // Extend the finishing phase proportionally
                                ease: [
                                    [0.25, 1, 0.5, 1],    // Smoother, less abrupt ease out
                                    [0.25, 1, 0.5, 1]     // Smooth organic expansion
                                ]
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
                            style={{
                                x: popupTranslateX,
                                rotate: -rotate,
                                transformOrigin: `${caretLeftPos} 100%`
                            }}
                            initial={{ opacity: 0, y: (popup.offsetY || 0) + 6, scale: 0.92 }}
                            animate={{ opacity: 1, y: (popup.offsetY || 0), scale: 1 }}
                            exit={{ opacity: 0, y: (popup.offsetY || 0) + 6, scale: 0.92 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="relative bg-black border-3 border-white rounded-xl px-4 py-3 text-center font-mono text-sm sm:text-base font-semibold text-white select-none leading-relaxed"
                                style={{
                                    width: 'max-content',
                                    maxWidth: popup.maxWidth ? `min(${popup.maxWidth}px, calc(100vw - 32px))` : 'min(320px, calc(100vw - 32px))',
                                    minWidth: '120px',
                                }}
                            >
                                {Array.isArray(popup.text) ? popup.text[popupIndex] : popup.text}{' '}
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
                                    className="absolute -bottom-[6.5px] w-[14px] h-[14px] bg-black"
                                    style={{
                                        left: caretLeftPos,
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        borderRight: '2px solid white',
                                        borderBottom: '2px solid white',
                                        borderBottomRightRadius: '2px', // Adds a sleek, premium rounded point
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

            {/* ── Contact Modal (portaled to body) ── */}
            {showContactModal && typeof window !== 'undefined' && createPortal(
                <ContactModal onClose={() => setShowContactModal(false)} />,
                document.body
            )}

            {/* ── Certificates Modal (portaled to body) ── */}
            {showCertificatesModal && typeof window !== 'undefined' && createPortal(
                <CertificatesModal onClose={() => setShowCertificatesModal(false)} />,
                document.body
            )}
        </>
    );
};
