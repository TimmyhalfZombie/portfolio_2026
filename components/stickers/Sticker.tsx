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

let sharedAudioCtx: AudioContext | null = null;
let clickSoundCounter = 0;

let suspendTimeoutId: number | null = null;

function playTickSound() {
    if (typeof window === 'undefined') return;
    try {
        if (!sharedAudioCtx) {
            const AudioContextFn = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextFn) {
                sharedAudioCtx = new AudioContextFn();
            }
        }
        if (!sharedAudioCtx) return;

        if (sharedAudioCtx.state === 'suspended') {
            sharedAudioCtx.resume().catch(() => { });
        }

        const ctx = sharedAudioCtx;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Cycle through Tick -> Tack -> Tock
        const seq = clickSoundCounter % 3;
        clickSoundCounter++;

        let startFreq = 1800;
        let endFreq = 900;

        if (seq === 1) { // Tack
            startFreq = 1400;
            endFreq = 700;
        } else if (seq === 2) { // Tock
            startFreq = 1000;
            endFreq = 900;
        }

        osc.type = 'sine';
        osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.02);

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.03);

        if (suspendTimeoutId) {
            window.clearTimeout(suspendTimeoutId);
        }
        suspendTimeoutId = window.setTimeout(() => {
            if (sharedAudioCtx && sharedAudioCtx.state === 'running') {
                sharedAudioCtx.suspend().catch(() => { });
            }
        }, 100);
    } catch (e) {
        // Ignore audio API errors silently
    }
}

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

function animatePopupText(popupElement: HTMLElement) {
    const textNodes = popupElement.querySelectorAll('p, span, li');
    
    textNodes.forEach(node => {
        // Skip anything we don't want to animate
        if (node.classList.contains('pill') || node.classList.contains('popup-word')) return;
        const text = node.textContent;
        if (!text) return;
        
        const words = text.split(' ');
        node.innerHTML = words
            .map(word => `<span class="popup-word">${word}</span>`)
            .join(' ');
    });

    const allWords = popupElement.querySelectorAll('.popup-word');
    
    allWords.forEach((wordElement, i) => {
        const word = wordElement as HTMLElement;
        word.style.transition = `
            opacity 0.25s ease ${i * 50}ms, 
            transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 50}ms
        `;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            word.style.opacity = '1';
            word.style.transform = 'scale(1)';
        }));
    });
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
    const [isShaking, setIsShaking] = useState(false);
    const [isRotating3d, setIsRotating3d] = useState(false);
    const stackRef = useRef<HTMLDivElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);
    const stackOpen = useRef(false);
    const stackAnimating = useRef(false);
    const [ghostRect, setGhostRect] = useState<DOMRect | null>(null);
    const stickerRef = useRef<HTMLDivElement>(null);
    const flyRef = useRef<HTMLDivElement>(null);
    const ghostFlyRef = useRef<HTMLDivElement>(null);
    const isFlyingGuard = useRef(false);
    const wasDragged = useRef(false);
    const popupRef = useRef<HTMLDivElement>(null);

    // Block framer-motion drag from triggering when interacting with the popup
    // React's stopPropagation doesn't block framer-motion's native DOM listeners
    useEffect(() => {
        const el = popupRef.current;
        if (!el) return;
        const block = (e: PointerEvent) => e.stopPropagation();
        el.addEventListener('pointerdown', block);
        return () => el.removeEventListener('pointerdown', block);
    });

    // Apply word pop animation when popup opens
    useEffect(() => {
        if (showPopup && popupRef.current) {
            animatePopupText(popupRef.current);
        }
    }, [showPopup, popupIndex]);

    // Close popup when clicking outside the sticker or after timeout
    useEffect(() => {
        if (!showPopup) {
            // Reset stack to collapsed when popup closes
            stackOpen.current = false;
            stackAnimating.current = false;
            if (stackRef.current) {
                stackRef.current.style.opacity = '0';
                stackRef.current.style.maxHeight = '0';
                stackRef.current.style.marginTop = '0';
            }
            if (toggleRef.current) {
                toggleRef.current.textContent = 'stack +';
            }
            return;
        }

        // Popups with a link (e.g. "Visit Site") or noAutoHide flag stay open until manually dismissed
        let timerId: ReturnType<typeof setTimeout> | undefined;
        if (!popup?.linkUrl && !popup?.noAutoHide) {
            timerId = setTimeout(() => {
                setShowPopup(false);
            }, popup?.duration || 5000);
        }

        const handleClickOutside = (e: PointerEvent) => {
            if (stickerRef.current && !stickerRef.current.contains(e.target as Node)) {
                setShowPopup(false);
            }
        };

        document.addEventListener('pointerdown', handleClickOutside);
        return () => {
            document.removeEventListener('pointerdown', handleClickOutside);
            if (timerId) clearTimeout(timerId);
        };
    }, [showPopup, popup?.duration, popup?.linkUrl, popupIndex]);

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
        playTickSound();

        if (popup) {
            if (Array.isArray(popup.text) && popup.text.length > 1) {
                if (showPopup) {
                    setPopupIndex(prev => (prev + 1) % popup.text.length);
                } else {
                    setShowPopup(true);
                    setPopupIndex(prev => (prev + 1) % popup.text.length);
                }
            } else {
                setShowPopup((prev) => !prev);
            }
        }
        else if (tapEffect === 'flyAround') flyAround();
        else if (tapEffect === 'bounce') {
            if (!isBouncing) {
                setIsBouncing(true);
                setTimeout(() => setIsBouncing(false), 1000); // 2 bounces total ~1.0s
            }
        }
        else if (tapEffect === 'shake') {
            if (!isShaking) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 2000); // 5 secs
            }
        }
        else if (tapEffect === 'rotate3d') {
            if (!isRotating3d) {
                setIsRotating3d(true);
                setTimeout(() => setIsRotating3d(false), 10000); // 10 secs
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

    let rawTop = 50;
    if (typeof top === 'string') {
        const match = top.match(/(-?[\d.]+)%/);
        if (match) rawTop = parseFloat(match[1]);
    }
    // If the sticker is in the upper 30% of the screen, show the popup below it to avoid cutoff (unless overridden).
    const isPopupBelow = popup?.forceTop ? false : rawTop < 30;



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
                            y: [0, -15, 0, -15, 0], // 2 lighter bounces
                            scale: 1,
                            opacity: 1,
                            rotate,
                        }
                        : isShaking
                            ? {
                                x: [-2, 2], // extremely narrow shake
                                scale: 1,
                                opacity: 1,
                                rotate,
                            }
                            : {
                                opacity: hasEntered ? 1 : [0, 1, 1],
                                scale: hasEntered ? 1 : [initialScale, 0.94, 1], // Very subtle, gentle soft shrink
                                y: 0,
                                x: 0,
                                rotate,
                            }
                }
                transition={
                    isBouncing
                        ? { y: { duration: 1.0, ease: 'easeOut' } }
                        : isShaking
                            ? { x: { duration: 0.12, repeat: Infinity, repeatType: 'reverse', ease: 'linear' } }
                            : hasEntered
                                ? { scale: { duration: 0.1 }, opacity: { duration: 0.1 }, x: { duration: 0.2 }, y: { duration: 0.2 } }
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
                            className={`absolute left-1/2 pointer-events-auto ${isPopupBelow ? 'top-full mt-3' : 'bottom-full mb-3'
                                }`}
                            style={{
                                x: popup.offsetX ? `calc(${popupTranslateX} + ${popup.offsetX}px)` : popupTranslateX,
                                rotate: -rotate,
                                transformOrigin: `${caretLeftPos} ${isPopupBelow ? '0%' : '100%'}`
                            }}
                            initial={{
                                opacity: 0,
                                y: isPopupBelow ? -((popup.offsetY || 0) + 6) : ((popup.offsetY || 0) + 6),
                                scale: 0.92
                            }}
                            animate={{
                                opacity: 1,
                                y: isPopupBelow ? -(popup.offsetY || 0) : (popup.offsetY || 0),
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: isPopupBelow ? -((popup.offsetY || 0) + 6) : ((popup.offsetY || 0) + 6),
                                scale: 0.92
                            }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            ref={popupRef}
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
                                {(() => {
                                    const displayText = Array.isArray(popup.text) ? popup.text[popupIndex] : popup.text;

                                    // Card-style layout for project popups (has title)
                                    if (popup.title) {
                                        return (
                                            <div className="flex flex-col gap-3 w-full text-left">
                                                <p className="font-bold text-white text-base tracking-wide m-0">{popup.title}</p>
                                                <p className="text-white text-sm leading-relaxed m-0">{displayText}</p>

                                                {/* Stack pills container */}
                                                {popup.stack && (
                                                    <div
                                                        ref={stackRef}
                                                        className="stack-wrap"
                                                    >
                                                        <div className="flex flex-wrap gap-2 pt-1 pb-1">
                                                            {popup.stack.map((item, i) => (
                                                                <div
                                                                    key={i}
                                                                    className="pill whitespace-nowrap text-xs text-emerald-100/90 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-3 py-1 inline-block"
                                                                >
                                                                    {item}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-700/50">
                                                    {popup.linkUrl && popup.linkText ? (
                                                        <a
                                                            href={popup.linkUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline underline-offset-2 text-[12px] text-white decoration-zinc-500 uppercase tracking-wider font-semibold"
                                                        >
                                                            {popup.linkText}
                                                        </a>
                                                    ) : <span />}
                                                    {popup.stack && (
                                                        <button
                                                            ref={toggleRef}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                const stack = stackRef.current;
                                                                const toggle = toggleRef.current;
                                                                if (!stack || !toggle || stackAnimating.current) return;
                                                                stackAnimating.current = true;
                                                                stackOpen.current = !stackOpen.current;
                                                                const open = stackOpen.current;
                                                                const pills = stack.querySelectorAll<HTMLElement>('.pill');

                                                                if (open) {
                                                                    stack.style.opacity = '0';
                                                                    stack.style.maxHeight = stack.scrollHeight + 'px';
                                                                    stack.style.marginTop = '1rem';
                                                                    pills.forEach((pill) => {
                                                                        pill.style.opacity = '0';
                                                                        pill.style.transform = 'translateY(6px)';
                                                                        pill.style.transition = 'none';
                                                                    });
                                                                    requestAnimationFrame(() => {
                                                                        requestAnimationFrame(() => {
                                                                            stack.style.opacity = '1';
                                                                            pills.forEach((pill, i) => {
                                                                                pill.style.transition = `opacity 0.2s ease ${i * 30 + 60}ms, transform 0.2s ease ${i * 30 + 60}ms`;
                                                                                pill.style.opacity = '1';
                                                                                pill.style.transform = 'translateY(0)';
                                                                            });
                                                                            setTimeout(() => { stackAnimating.current = false; }, 400);
                                                                        });
                                                                    });
                                                                } else {
                                                                    const total = pills.length;
                                                                    pills.forEach((pill, i) => {
                                                                        const delay = (total - 1 - i) * 30;
                                                                        pill.style.transition = `opacity 0.15s ease ${delay}ms, transform 0.15s ease ${delay}ms`;
                                                                        pill.style.opacity = '0';
                                                                        pill.style.transform = 'translateY(6px)';
                                                                    });
                                                                    setTimeout(() => {
                                                                        stack.style.opacity = '0';
                                                                        stack.style.maxHeight = '0';
                                                                        stack.style.marginTop = '0';
                                                                        setTimeout(() => { stackAnimating.current = false; }, 350);
                                                                    }, total * 30 + 80);
                                                                }

                                                                toggle.textContent = open ? 'stack -' : 'stack +';
                                                            }}
                                                            className="text-[12px] text-white uppercase tracking-wider font-semibold cursor-pointer"
                                                        >
                                                            stack +
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    // Inline layout for social popups (short text, no newlines)
                                    const isInline = popup.linkUrl && popup.linkText && !displayText.includes('\n');
                                    if (isInline) {
                                        return (
                                            <div className="whitespace-nowrap flex items-center justify-center gap-1">
                                                <p className="m-0">{displayText}</p>
                                                <a
                                                    href={popup.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline underline-offset-2 decoration-white/50"
                                                >
                                                    {popup.linkText}
                                                </a>
                                            </div>
                                        );
                                    }

                                    // Default stacked layout
                                    return (
                                        <div className="flex flex-col gap-1 items-center w-full">
                                            <p className="whitespace-pre-wrap text-center inline-block w-full m-0">{displayText}</p>
                                            {popup.linkUrl && popup.linkText && (
                                                <a
                                                    href={popup.linkUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="underline underline-offset-2 text-[13px] text-zinc-300 decoration-white/50 uppercase tracking-wider font-bold mt-1"
                                                >
                                                    {popup.linkText}
                                                </a>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Caret/triangle */}
                                <div
                                    className="absolute w-[14px] h-[14px] bg-black"
                                    style={{
                                        left: popup.offsetX ? `calc(${caretLeftPos} - ${popup.offsetX}px)` : caretLeftPos,
                                        [isPopupBelow ? 'top' : 'bottom']: '-6.5px',
                                        transform: 'translateX(-50%) rotate(45deg)',
                                        borderRight: isPopupBelow ? 'none' : '2px solid white',
                                        borderBottom: isPopupBelow ? 'none' : '2px solid white',
                                        borderLeft: isPopupBelow ? '2px solid white' : 'none',
                                        borderTop: isPopupBelow ? '2px solid white' : 'none',
                                        borderBottomRightRadius: isPopupBelow ? '0' : '2px',
                                        borderTopLeftRadius: isPopupBelow ? '2px' : '0',
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Sticker Image ── */}
                <motion.div 
                    ref={flyRef} 
                    className="relative w-full h-full flex justify-center items-center" 
                    style={{ opacity: isFlying ? 0 : 1 }}
                    whileTap={{ scale: 0.92 }}
                >
                    <Image
                        src={src}
                        alt={alt}
                        width={width}
                        height={width}
                        className="object-contain select-none"
                        style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))' }}
                        draggable={false}
                        priority={priority}
                        unoptimized={data.id === 'main-me'}
                    />
                </motion.div>
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
