'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Image from 'next/image';
import { StickerData } from './StickerConfig';
import { ContactModal } from '../ContactModal';
import { CertificatesModal } from '../CertificatesModal';
import { StickerPeel } from './StickerPeel';
import { useRevealed } from '../RevealContext';

interface StickerProps {
    data: StickerData;
    isShrunk?: boolean;
    isExpanded?: boolean;
    onDragStateChange?: (isDragging: boolean) => void;
    /** Ref to the card area element — used by main-me to detect overlap for z-index logic and to anchor its popup */
    cardAreaRef?: React.RefObject<HTMLDivElement | null>;
    /** When true, disables ALL Framer Motion opacity/scale animations on the sticker (used in mobile story view) */
    noAnimation?: boolean;
    /** Reports when this sticker's popup or modal opens/closes (used to pause the mobile story timer) */
    onOpenChange?: (id: string, open: boolean) => void;
}

const LOCAL_PLAYLIST = [
    { src: '/mp3/Hot Mulligan - I Dont Think Its the Right Time for Emojis.mp3', name: "Hot Mulligan - I Don't Think It's the Right Time for Emojis" },
    { src: '/mp3/The Story So Far Big Blind.mp3', name: 'The Story So Far - Big Blind' },
    { src: '/mp3/408 - Remember Her Like That.mp3', name: '408 - Remember Her Like That' },
    { src: '/mp3/Knox - Go For Broke (Lyric Video).mp3', name: 'Knox - Go For Broke' },
    { src: '/mp3/Mayday Parade - Under My Sweater (Official Music Video).mp3', name: 'Mayday Parade - Under My Sweater' },
    { src: '/mp3/Pierce The Veil - So Far So Fake.mp3', name: 'Pierce The Veil - So Far So Fake' },
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

        const playNodes = (ctx: AudioContext) => {
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
            }, 10000);
        };

        if (sharedAudioCtx.state === 'suspended') {
            sharedAudioCtx.resume()
                .then(() => {
                    if (sharedAudioCtx) playNodes(sharedAudioCtx);
                })
                .catch(() => { });
        } else {
            playNodes(sharedAudioCtx);
        }
    } catch (e) {
        // Ignore audio API errors silently
    }
}

/** Dispatch a custom event so the toast UI can re-render when audio state changes */
function dispatchAudioStateChange() {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('audio-state-change'));
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
            dispatchAudioStateChange();
        });
        globalAudio.addEventListener('play', dispatchAudioStateChange);
        globalAudio.addEventListener('pause', dispatchAudioStateChange);
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
                globalAudio.play().catch(console.error);
            }
            dispatchAudioStateChange();
        },
        prev: () => {
            currentAudioIndex = (currentAudioIndex - 1 + LOCAL_PLAYLIST.length) % LOCAL_PLAYLIST.length;
            if (globalAudio) {
                globalAudio.src = LOCAL_PLAYLIST[currentAudioIndex].src;
                globalAudio.play().catch(console.error);
            }
            dispatchAudioStateChange();
        },
        isPlaying: () => !!(globalAudio && !globalAudio.paused),
        getSongName: () => LOCAL_PLAYLIST[currentAudioIndex].name,
        getCurrentIndex: () => currentAudioIndex,
        getPlaylistLength: () => LOCAL_PLAYLIST.length,
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

let musicToastActive = false;

// Keep toast in sync when songs auto-advance (ended event)
if (typeof window !== 'undefined') {
    let listenerSet = false;
    const setupListener = () => {
        if (listenerSet) return;
        listenerSet = true;
        window.addEventListener('audio-state-change', () => {
            if (musicToastActive) showMusicToast();
        });
    };
    // Defer to avoid referencing showMusicToast before it's defined
    setTimeout(setupListener, 0);
}

/** Show (or update) the persistent music player toast, styled like the sticker popups */
function showMusicToast() {
    const controller = getAudioController();
    if (!controller) return;

    musicToastActive = true;
    const playing = controller.isPlaying();
    const songName = controller.getSongName();
    const trackLabel = `${String(controller.getCurrentIndex() + 1).padStart(2, '0')}/${String(controller.getPlaylistLength()).padStart(2, '0')}`;

    const handleDismiss = () => {
        musicToastActive = false;
        controller.pause();
        toast.dismiss('spotify-toast');
    };

    const iconBtn = 'inline-flex items-center justify-center rounded-md border border-white/20 text-white transition-colors hover:bg-white/15 active:scale-95 cursor-pointer';

    toast.custom(() => (
        <div className="w-[356px] max-w-[calc(100vw-2rem)] bg-black border-2 border-white rounded-xl font-mono text-white select-none px-4 py-3">
            <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 uppercase tracking-wider font-semibold text-[0.75rem]">
                    <span className={`inline-block size-2 rounded-full ${playing ? 'bg-white animate-pulse' : 'bg-white/30'}`} />
                    {playing ? 'Now Playing' : 'Paused'}
                </span>
                <span className="flex items-center gap-3">
                    <span className="text-neutral-400 tracking-wider text-[0.7rem]">{trackLabel}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
                        className="text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        title="Close"
                        aria-label="Close player"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="size-4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                    </button>
                </span>
            </div>

            <p className="font-semibold leading-snug mt-2 mb-0 text-[0.875rem]">{songName}</p>

            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-zinc-700/50">
                <button
                    className={`${iconBtn} h-8 w-10`}
                    onClick={(e) => { e.stopPropagation(); controller.prev(); }}
                    title="Previous"
                    aria-label="Previous track"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M6 5h2v14H6zM20 5v14L9 12z" /></svg>
                </button>
                <button
                    className={`${iconBtn} h-8 w-12 bg-white !text-black border-white hover:!bg-neutral-200`}
                    onClick={(e) => { e.stopPropagation(); playing ? controller.pause() : controller.play(); }}
                    title={playing ? 'Pause' : 'Play'}
                    aria-label={playing ? 'Pause' : 'Play'}
                >
                    {playing
                        ? <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
                        : <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M7 4.5v15L19.5 12z" /></svg>}
                </button>
                <button
                    className={`${iconBtn} h-8 w-10`}
                    onClick={(e) => { e.stopPropagation(); controller.next(); }}
                    title="Next"
                    aria-label="Next track"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4"><path d="M16 5h2v14h-2zM4 5v14l11-7z" /></svg>
                </button>
            </div>
        </div>
    ), {
        id: 'spotify-toast',
        duration: Infinity,
        dismissible: false,
    });
}

let globalMaxZIndex = 100;

const INTRO_SEEN_KEY = 'sticker-intro-seen';

export const Sticker: React.FC<StickerProps> = ({ data, isShrunk = false, isExpanded = false, onDragStateChange, cardAreaRef, noAnimation = false, onOpenChange }) => {
    const { src, alt, width, widthPx, top, left, rotate, delay, zIndex, priority, popup, tapEffect } = data;
    const [localZIndex, setLocalZIndex] = useState(zIndex);
    const [isMobile, setIsMobile] = useState(false);
    const revealed = useRevealed();

    useEffect(() => {
        const mql = window.matchMedia('(orientation: portrait) and (max-width: 1024px)');
        const update = () => setIsMobile(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const effectiveShrunk = isMobile ? false : isShrunk;
    const targetScale = effectiveShrunk 
        ? 0.9 
        : isExpanded 
            ? (data.id === 'vipscale' ? 1.026 : 1.18) 
            : 1;

    const bringToFront = () => {
        // Stickers behind the cards keep their z-index so they stay tucked under the card on tap
        if (data.behindCards) return;
        globalMaxZIndex += 1;
        setLocalZIndex(globalMaxZIndex);
    };

    const [hasEntered, setHasEntered] = useState(false);
    const [showPopup, setShowPopup] = useState(false);
    const [showContactModal, setShowContactModal] = useState(false);
    const [showCertificatesModal, setShowCertificatesModal] = useState(false);
    const [popupIndex, setPopupIndex] = useState(0);
    const [isFlying, setIsFlying] = useState(false);
    const [isBouncing, setIsBouncing] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [isRotating3d, setIsRotating3d] = useState(false);
    const [isDashing, setIsDashing] = useState(false);
    const [isFishing, setIsFishing] = useState(false);
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

    // Stickers behind the cards portal their popup to <body> so it isn't hidden under the card stack
    const portalPopup = !!data.behindCards;
    const [popupAnchor, setPopupAnchor] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

    const openPopup = () => {
        if (portalPopup && stickerRef.current) {
            // Anchor to the part of the sticker that peeks out above the cards
            const r = stickerRef.current.getBoundingClientRect();
            const cardTop = cardAreaRef?.current?.getBoundingClientRect().top;
            const bottom = cardTop !== undefined && cardTop > r.top && cardTop < r.bottom ? cardTop : r.bottom;
            setPopupAnchor({ top: r.top, left: r.left, width: r.width, height: bottom - r.top });
        }
        setShowPopup(true);
    };

    // Keyed Fragment wrapper: AnimatePresence ignores bare portals, which would skip the popup entirely
    const wrapPopup = (node: React.ReactElement) =>
        portalPopup && popupAnchor
            ? (
                <React.Fragment key="sticker-popup">
                    {createPortal(
                        <div style={{ position: 'fixed', ...popupAnchor, zIndex: 260, pointerEvents: 'none' }}>{node}</div>,
                        document.body
                    )}
                </React.Fragment>
            )
            : node;

    // First visit only: open the popup by itself once, so visitors see a sticker talk without being told to click
    const isShrunkRef = useRef(isShrunk);
    useEffect(() => { isShrunkRef.current = isShrunk; }, [isShrunk]);
    useEffect(() => {
        if (!popup?.autoOpenOnce || !revealed) return;
        try {
            if (localStorage.getItem(INTRO_SEEN_KEY)) return;
        } catch { }
        const timerId = setTimeout(() => {
            if (isShrunkRef.current) return;
            setShowPopup(true);
            try { localStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { }
        }, 2400); // after every sticker has landed
        return () => clearTimeout(timerId);
    }, [popup?.autoOpenOnce, revealed]);

    const isOpen = showPopup || showContactModal || showCertificatesModal;
    useEffect(() => {
        if (!isOpen || !onOpenChange) return;
        onOpenChange(data.id, true);
        return () => onOpenChange(data.id, false);
    }, [isOpen, onOpenChange, data.id]);

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
        bringToFront();

        if (popup) {
            if (Array.isArray(popup.text) && popup.text.length > 1) {
                if (showPopup) {
                    setPopupIndex(prev => (prev + 1) % popup.text.length);
                } else {
                    openPopup();
                    setPopupIndex(prev => (prev + 1) % popup.text.length);
                }
            } else if (showPopup) {
                setShowPopup(false);
            } else {
                openPopup();
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
        else if (tapEffect === 'crayfish') {
            if (!isDashing) {
                setIsDashing(true);
                setTimeout(() => setIsDashing(false), 1200); // 1.2s duration
            }
        }
        else if (tapEffect === 'fishing') {
            if (!isFishing) {
                setIsFishing(true);
                setTimeout(() => setIsFishing(false), 2000); // 2s cast + reel
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
                // If audio is already playing, just show the toast (don't toggle)
                if (!controller.isPlaying()) {
                    controller.play();
                }
                showMusicToast();
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

    // Parse effective screen position from calc(50% ± Xrem) format.
    // ~27rem from center ≈ edge of viewport, so offset/27 maps to 0-50% from center.
    let rawTop = 50;
    if (typeof top === 'string') {
        const calcMatch = top.match(/calc\(50%\s*([+-])\s*([\d.]+)rem\)/);
        if (calcMatch) {
            const sign = calcMatch[1] === '+' ? 1 : -1;
            const remOffset = parseFloat(calcMatch[2]);
            // Convert rem offset from center to approximate viewport %
            // 27rem ≈ 50% of viewport height at 16:9
            rawTop = 50 + sign * (remOffset / 27) * 50;
        } else {
            const match = top.match(/(-?[\d.]+)%/);
            if (match) rawTop = parseFloat(match[1]);
        }
    }
    // If the sticker is in the upper 30% of the screen, show the popup below it to avoid cutoff (unless overridden).
    const isPopupBelow = (isMobile || noAnimation)
        ? (popup?.mobileForceBottom ? true : (popup?.mobileForceTop ? false : (popup?.forceBottom ? true : (popup?.forceTop ? false : rawTop < 30))))
        : (popup?.forceBottom ? true : (popup?.forceTop ? false : rawTop < 30));

    const effectiveOffsetX = popup ? ((isMobile || noAnimation)
        ? (popup.mobileOffsetX !== undefined ? popup.mobileOffsetX : 0)
        : (popup.offsetX || 0)) : 0;



    return (
        <>
            <motion.div
                ref={stickerRef}
                className="absolute pointer-events-auto"
                style={{
                    top,
                    left,
                    zIndex: showPopup && !portalPopup ? 9999 : (noAnimation ? localZIndex : (isFlying ? 1 : localZIndex)),
                    width,
                    cursor: noAnimation ? ((popup || tapEffect) ? 'pointer' : 'default') : ((popup || tapEffect) ? 'pointer' : 'grab'),
                    willChange: noAnimation ? 'auto' : 'transform, opacity',
                    opacity: noAnimation ? 1 : undefined,
                    transform: noAnimation ? `rotate(${rotate}deg)` : undefined,
                }}
                {...(noAnimation ? {} : {
                    initial: {
                        opacity: 0,
                        scale: initialScale,
                        y: 0,
                        rotate
                    },
                    // Hold the pre-entrance pose until the opening screen hands off
                    animate: {
                        opacity: hasEntered ? 1 : revealed ? [0, 1, 1] : 0,
                        scale: hasEntered
                            ? 1
                            : revealed ? [initialScale, 0.94, 1] : initialScale,
                        y: 0,
                        x: 0,
                        rotate,
                    },
                    transition: hasEntered
                        ? { 
                            opacity: { duration: 0.1 }, 
                            x: { duration: 0.2 }, 
                            y: { duration: 0.2 } 
                          }
                        : {
                            duration: 0.7,
                            delay: delay,
                            times: [0, 0.6, 1],
                            ease: [
                                [0.25, 1, 0.5, 1],
                                [0.25, 1, 0.5, 1]
                            ]
                        },
                    onAnimationComplete: () => { if (revealed) setHasEntered(true); },
                    onPointerDown: () => {
                        bringToFront();
                        onDragStateChange?.(true);
                    },
                    onPointerUp: () => {
                        if (!wasDragged.current) {
                            if (cardAreaRef?.current && stickerRef.current) {
                                const stickerRect = stickerRef.current.getBoundingClientRect();
                                const cardRect = cardAreaRef.current.getBoundingClientRect();
                                const overlaps = !(
                                    stickerRect.right < cardRect.left ||
                                    stickerRect.left > cardRect.right ||
                                    stickerRect.bottom < cardRect.top ||
                                    stickerRect.top > cardRect.bottom
                                );
                                onDragStateChange?.(overlaps ? false : true);
                            } else {
                                onDragStateChange?.(false);
                            }
                        }
                    },
                    onDragStart: () => {
                        wasDragged.current = true;
                        // A portaled popup can't follow the sticker, so close it
                        if (portalPopup) setShowPopup(false);
                        bringToFront();
                        onDragStateChange?.(true);
                    },
                    onDragEnd: () => {
                        setTimeout(() => {
                            wasDragged.current = false;
                        }, 100);
                        if (cardAreaRef?.current && stickerRef.current) {
                            const stickerRect = stickerRef.current.getBoundingClientRect();
                            const cardRect = cardAreaRef.current.getBoundingClientRect();
                            const overlaps = !(
                                stickerRect.right < cardRect.left ||
                                stickerRect.left > cardRect.right ||
                                stickerRect.bottom < cardRect.top ||
                                stickerRect.top > cardRect.bottom
                            );
                            onDragStateChange?.(overlaps ? false : true);
                        } else {
                            onDragStateChange?.(false);
                        }
                    },
                    whileDrag: isMobile ? undefined : { cursor: 'grabbing' },
                })}
                onClick={handleClick}
                drag={noAnimation ? false : !isMobile}
                dragMomentum={false}
                dragElastic={0.15}
            >
                {/* ── Popup Tooltip ── */}
                <AnimatePresence>
                    {showPopup && popup && wrapPopup(
                        <motion.div
                            key="sticker-popup"
                            className={`absolute left-1/2 pointer-events-auto ${isPopupBelow ? 'top-full mt-5' : 'bottom-full mb-5'
                                }`}
                            style={{
                                x: effectiveOffsetX ? `calc(${popupTranslateX} + ${effectiveOffsetX / 16}rem)` : popupTranslateX,
                                rotate: portalPopup ? 0 : -rotate,
                                transformOrigin: `${caretLeftPos} ${isPopupBelow ? '0%' : '100%'}`
                            }}
                            initial={{
                                opacity: 0,
                                y: isPopupBelow ? ((popup.offsetY || 0) + 6) : -((popup.offsetY || 0) + 6),
                                scale: 0.92
                            }}
                            animate={{
                                opacity: 1,
                                y: isPopupBelow ? (popup.offsetY || 0) : -(popup.offsetY || 0),
                                scale: 1
                            }}
                            exit={{
                                opacity: 0,
                                y: isPopupBelow ? ((popup.offsetY || 0) + 6) : -((popup.offsetY || 0) + 6),
                                scale: 0.92
                            }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            ref={popupRef}
                            onPointerDown={(e) => e.stopPropagation()}
                            onPointerUp={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div
                                className="relative bg-black border-2 border-white rounded-xl text-center font-mono font-semibold text-white select-none leading-relaxed"
                                style={{
                                    padding: 'clamp(0.5rem, 0.8vw, 0.75rem) clamp(0.625rem, 1.1vw, 1rem)',
                                    fontSize: 'clamp(0.72rem, 1.2vw, 0.95rem)',
                                    width: 'max-content',
                                    maxWidth: popup.maxWidth ? `min(${popup.maxWidth / 16}rem, calc(100vw - 2rem))` : 'min(20rem, calc(100vw - 2rem))',
                                    minWidth: 'clamp(5rem, 8vw, 7.5rem)',
                                }}
                            >
                                {(() => {
                                    const displayText = Array.isArray(popup.text) ? popup.text[popupIndex] : popup.text;

                                    // Card-style layout for project popups (has title)
                                    if (popup.title) {
                                        return (
                                            <div className="flex flex-col w-full text-left" style={{ gap: 'clamp(0.5rem, 0.8vw, 0.75rem)' }}>
                                                <p className="font-bold text-white tracking-wide m-0" style={{ fontSize: 'clamp(0.72rem, 1.2vw, 0.95rem)' }}>{popup.title}</p>
                                                <p className="text-white leading-relaxed m-0 whitespace-pre-wrap" style={{ fontSize: 'clamp(0.65rem, 1.05vw, 0.85rem)' }}>{displayText}</p>

                                                {/* Stack pills container */}
                                                {popup.stack && (
                                                    <div
                                                        ref={popup.stackAlwaysOpen ? undefined : stackRef}
                                                        className={popup.stackAlwaysOpen ? "mt-4 opacity-100" : "stack-wrap"}
                                                    >
                                                        <div className="flex flex-wrap pt-1 pb-1" style={{ gap: 'clamp(0.25rem, 0.4vw, 0.375rem)' }}>
                                                            {popup.stack.map((item, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="pill rounded-md bg-white/10 text-neutral-300 font-mono tracking-wider transition-colors hover:bg-white/20 uppercase"
                                                                    style={{
                                                                        padding: 'clamp(0.125rem, 0.2vw, 0.25rem) clamp(0.375rem, 0.6vw, 0.5rem)',
                                                                        fontSize: 'clamp(0.55rem, 0.85vw, 0.7rem)'
                                                                    }}
                                                                >
                                                                    {item}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {(popup.linkUrl || (popup.stack && !popup.stackAlwaysOpen)) && (
                                                <div className="flex items-center justify-between mt-1 pt-2 border-t border-zinc-700/50">
                                                    {popup.linkUrl && popup.linkText ? (
                                                        <a
                                                            href={popup.linkUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="underline underline-offset-2 text-white decoration-zinc-500 uppercase tracking-wider font-semibold"
                                                            style={{ fontSize: 'clamp(0.55rem, 0.9vw, 0.75rem)' }}
                                                        >
                                                            {popup.linkText}
                                                        </a>
                                                    ) : <span />}
                                                    {popup.stack && !popup.stackAlwaysOpen && (
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
                                                            className="text-white uppercase tracking-wider font-semibold cursor-pointer"
                                                            style={{ fontSize: 'clamp(0.55rem, 0.9vw, 0.75rem)' }}
                                                        >
                                                            stack +
                                                        </button>
                                                    )}
                                                </div>
                                                )}
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
                                                    className="underline underline-offset-2 text-zinc-300 decoration-white/50 uppercase tracking-wider font-bold mt-1"
                                                    style={{ fontSize: 'clamp(0.6rem, 1vw, 0.8rem)' }}
                                                >
                                                    {popup.linkText}
                                                </a>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* Caret/triangle */}
                                <div
                                    className="absolute bg-black"
                                    style={{
                                        width: 'clamp(0.625rem, 1vw, 0.875rem)',
                                        height: 'clamp(0.625rem, 1vw, 0.875rem)',
                                        left: effectiveOffsetX ? `calc(${caretLeftPos} - ${effectiveOffsetX / 16}rem)` : caretLeftPos,
                                        [isPopupBelow ? 'top' : 'bottom']: '-0.406rem',
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
                    whileDrag={{ scale: targetScale * 0.95 }}
                    whileTap={{ scale: targetScale * 0.95 }}
                    animate={
                        isBouncing
                            ? {
                                y: [0, -15, 0, -15, 0],
                            }
                            : isShaking
                                ? {
                                    x: [-5, 5],
                                }
                                : isDashing
                                    ? {
                                        x: [0, -100, 0],
                                        y: [0, 40, 0],
                                        scale: [1, 0.82, 1],
                                        rotate: [0, -15, 0],
                                    }
                                    : isFishing
                                        ? {
                                            y: [0, -30, 0, -6, 0, -6, 0, -4, 0, -4, 0],
                                            rotate: [0, 20, 0, -3, 3, -3, 3, -2, 2, 0, 0],
                                        }
                                        : {
                                            x: 0,
                                            y: 0,
                                            scale: targetScale,
                                            rotate: 0,
                                        }
                    }
                    transition={
                        isBouncing
                            ? { y: { duration: 1.0, ease: 'easeOut' } }
                            : isShaking
                                ? { x: { duration: 0.12, repeat: Infinity, repeatType: 'reverse', ease: 'linear' } }
                                : isDashing
                                    ? {
                                        x: { duration: 1.2, times: [0, 0.15, 1], ease: ["easeOut", "easeInOut"] },
                                        y: { duration: 1.2, times: [0, 0.15, 1], ease: ["easeOut", "easeInOut"] },
                                        scale: { duration: 1.2, times: [0, 0.15, 1], ease: ["easeOut", "easeInOut"] },
                                        rotate: { duration: 1.2, times: [0, 0.15, 1], ease: ["easeOut", "easeInOut"] }
                                      }
                                    : isFishing
                                        ? {
                                            y: { duration: 2.0, times: [0, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.93, 1], ease: "easeInOut" },
                                            rotate: { duration: 2.0, times: [0, 0.12, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.93, 1], ease: "easeInOut" },
                                          }
                                        : {
                                            scale: {
                                                duration: 0.5,
                                                ease: [0.34, 1.56, 0.64, 1],
                                                delay: isExpanded ? (delay * 0.8) : 0
                                            },
                                            x: { duration: 0.2 },
                                            y: { duration: 0.2 }
                                          }
                    }
                >
                    {/* Hover peel: the corner nearest the cursor lifts off the page (desktop only) */}
                    <StickerPeel enabled={!isMobile && !noAnimation} dimmed={effectiveShrunk}>
                        <Image
                            src={src}
                            alt={alt}
                            width={widthPx}
                            height={widthPx}
                            className="w-full h-auto object-contain select-none opacity-100"
                            style={{
                                opacity: 1,
                                filter: effectiveShrunk
                                    ? 'grayscale(1) opacity(0.6) drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                                    : 'drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                            }}
                            draggable={false}
                            priority={priority}
                        />
                    </StickerPeel>
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
                            width={widthPx}
                            height={widthPx}
                            className="w-full h-auto object-contain select-none transition-all duration-150"
                            style={{
                                filter: isShrunk
                                    ? 'grayscale(1) opacity(0.6) drop-shadow(0 4px 12px rgba(0,0,0,0.3))'
                                    : 'grayscale(0) opacity(1) drop-shadow(0 4px 12px rgba(0,0,0,0.5))',
                            }}
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
