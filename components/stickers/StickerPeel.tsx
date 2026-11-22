'use client';

import React, { useEffect, useRef } from 'react';
import { animate, AnimationPlaybackControls } from 'framer-motion';

export type Corner = 'tl' | 'tr' | 'bl' | 'br';

/** Outermost opaque pixel of the sticker along each corner's diagonal (x + y and x − y) */
export interface Extents {
    maxSum: number;
    minSum: number;
    maxDiff: number;
    minDiff: number;
}

interface StickerPeelProps {
    /** Off where there's no hover (touch layouts) */
    enabled: boolean;
    /** Dimmed stickers peel at the same reduced opacity */
    dimmed?: boolean;
    children: React.ReactNode;
}

/** How far the corner peels: a fraction of the sticker's shorter side, capped in px */
const PEEL_DEPTH = 0.22;
const MAX_PEEL_PX = 44;
/** Extra room around the front clip so the sticker's drop shadow isn't cut off */
const SHADOW_ROOM = 40;
/** The peel settles flat on its own this long after it starts, even while still hovered */
const SETTLE_AFTER_MS = 1000;

/** Scan the sticker's alpha so the peel starts at its die-cut edge, not at the transparent box corner */
function measureExtents(img: HTMLImageElement, w: number, h: number): Extents | null {
    const cw = Math.max(1, Math.round(w));
    const ch = Math.max(1, Math.round(h));
    const canvas = document.createElement('canvas');
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    let data: Uint8ClampedArray;
    try {
        ctx.drawImage(img, 0, 0, cw, ch);
        data = ctx.getImageData(0, 0, cw, ch).data;
    } catch {
        return null;
    }

    const ext: Extents = { maxSum: -Infinity, minSum: Infinity, maxDiff: -Infinity, minDiff: Infinity };
    for (let y = 0; y < ch; y++) {
        for (let x = 0; x < cw; x++) {
            if (data[(y * cw + x) * 4 + 3] < 128) continue;
            if (x + y > ext.maxSum) ext.maxSum = x + y;
            if (x + y < ext.minSum) ext.minSum = x + y;
            if (x - y > ext.maxDiff) ext.maxDiff = x - y;
            if (x - y < ext.minDiff) ext.minDiff = x - y;
        }
    }
    return ext.maxSum === -Infinity ? null : ext;
}

/**
 * Peel geometry for one corner, with the fold p px in from the corner's outermost point.
 * The fold is a 45° line across the corner: the front keeps everything on the near side
 * of it, and the flap is the corner mirrored across the fold, so it shows the back of
 * exactly the part that lifted.
 */
export function peelGeometry(corner: Corner, w: number, h: number, ext: Extents, p: number) {
    const m = SHADOW_ROOM;
    const poly = (pts: number[][]) => `polygon(${pts.map(([x, y]) => `${x}px ${y}px`).join(', ')})`;
    // Flap depth as a share of the gradient line, so the shading spans just the flap
    const depth = (p / (w + h)) * 100;

    if (corner === 'br' || corner === 'tl') {
        // Fold along x + y = s; mirroring across it maps (x, y) → (s − y, s − x)
        const s = corner === 'br' ? ext.maxSum - p : ext.minSum + p;
        const fold = (s / (w + h)) * 100;
        return {
            front: corner === 'br'
                ? poly([[-m, -m], [w + m, -m], [w + m, s - w - m], [s - h - m, h + m], [-m, h + m]])
                : poly([[s + m, -m], [w + m, -m], [w + m, h + m], [-m, h + m], [-m, s + m]]),
            flap: corner === 'br'
                ? poly([[w, s - w], [w, h], [s - h, h]])
                : poly([[0, 0], [s, 0], [0, s]]),
            transform: `translate(${s}px, ${s}px) matrix(0, -1, -1, 0, 0, 0)`,
            angle: corner === 'br' ? 135 : 315,
            fold: corner === 'br' ? fold : 100 - fold,
            depth,
        };
    }

    // Fold along x − y = k; mirroring across it maps (x, y) → (y + k, x − k)
    const k = corner === 'tr' ? ext.maxDiff - p : ext.minDiff + p;
    const fold = ((k + h) / (w + h)) * 100;
    return {
        front: corner === 'tr'
            ? poly([[-m, -m], [k - m, -m], [w + m, w + m - k], [w + m, h + m], [-m, h + m]])
            : poly([[-m, -m], [w + m, -m], [w + m, h + m], [k + h + m, h + m], [-m, -m - k]]),
        flap: corner === 'tr'
            ? poly([[k, 0], [w, 0], [w, w - k]])
            : poly([[0, -k], [k + h, h], [0, h]]),
        transform: `translate(${k}px, ${-k}px) matrix(0, 1, 1, 0, 0, 0)`,
        angle: corner === 'tr' ? 45 : 225,
        fold: corner === 'tr' ? fold : 100 - fold,
        depth,
    };
}

/** Backing paper for the flap: darker at the crease, brightening toward the lifted tip */
export const backingGradient = ({ angle, fold, depth }: { angle: number; fold: number; depth: number }) =>
    `linear-gradient(${angle}deg, #a8a8a8 ${fold}%, #e2e2e2 ${fold + depth * 0.45}%, #fbfbfb ${fold + depth}%)`;

/** Hover peel: the corner nearest the cursor lifts and folds back, showing the sticker's backing */
export const StickerPeel: React.FC<StickerPeelProps> = ({ enabled, dimmed = false, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const frontRef = useRef<HTMLDivElement>(null);
    const flapWrapRef = useRef<HTMLDivElement>(null);
    const flapRef = useRef<HTMLDivElement>(null);
    const progress = useRef(0);
    const corner = useRef<Corner>('br');
    const size = useRef({ w: 0, h: 0 });
    const extents = useRef<{ key: string; ext: Extents } | null>(null);
    const controls = useRef<AnimationPlaybackControls | null>(null);
    const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        controls.current?.stop();
        if (settleTimer.current) clearTimeout(settleTimer.current);
    }, []);

    const apply = (t: number) => {
        progress.current = t;
        const front = frontRef.current;
        const flapWrap = flapWrapRef.current;
        const flap = flapRef.current;
        if (!front || !flapWrap || !flap || !extents.current) return;

        if (t <= 0) {
            front.style.clipPath = 'none';
            flapWrap.style.visibility = 'hidden';
            return;
        }

        const { w, h } = size.current;
        const g = peelGeometry(corner.current, w, h, extents.current.ext, t * Math.min(PEEL_DEPTH * Math.min(w, h), MAX_PEEL_PX));
        front.style.clipPath = g.front;
        flap.style.clipPath = g.flap;
        flap.style.transform = g.transform;
        flap.style.background = backingGradient(g);
        flapWrap.style.visibility = 'visible';
    };

    const peelTo = (target: number) => {
        controls.current?.stop();
        controls.current = animate(progress.current, target, {
            duration: target ? 0.45 : 0.3,
            ease: target ? [0.22, 1, 0.36, 1] : [0.4, 0, 0.2, 1],
            onUpdate: apply,
        });
    };

    const handleEnter = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!enabled || e.pointerType === 'touch') return;
        const el = containerRef.current;
        const flap = flapRef.current;
        const img = el?.querySelector('img');
        if (!el || !flap || !img || !img.complete) return;

        // Only pick a corner while flat, so a half-peeled flap never jumps to another corner
        if (progress.current === 0) {
            const r = el.getBoundingClientRect();
            const right = e.clientX > r.left + r.width / 2;
            const bottom = e.clientY > r.top + r.height / 2;
            corner.current = bottom ? (right ? 'br' : 'bl') : (right ? 'tr' : 'tl');

            const w = el.offsetWidth;
            const h = el.offsetHeight;
            size.current = { w, h };
            const key = `${w}x${h}`;
            if (extents.current?.key !== key) {
                const ext = measureExtents(img, w, h) ?? { maxSum: w + h, minSum: 0, maxDiff: w, minDiff: -h };
                extents.current = { key, ext };
            }
        }

        // The flap's silhouette is the already-loaded sticker image, used as a mask
        const mask = `url("${img.currentSrc || img.src}")`;
        flap.style.setProperty('mask-image', mask);
        flap.style.setProperty('-webkit-mask-image', mask);
        peelTo(1);
        if (settleTimer.current) clearTimeout(settleTimer.current);
        settleTimer.current = setTimeout(() => peelTo(0), SETTLE_AFTER_MS);
    };

    const handleLeave = () => {
        if (!enabled) return;
        if (settleTimer.current) clearTimeout(settleTimer.current);
        peelTo(0);
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full"
            onPointerEnter={handleEnter}
            onPointerLeave={handleLeave}
        >
            <div ref={frontRef} className="flex w-full">
                {children}
            </div>
            {enabled && (
                <div
                    ref={flapWrapRef}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        visibility: 'hidden',
                        opacity: dimmed ? 0.6 : 1,
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))',
                    }}
                >
                    <div
                        ref={flapRef}
                        className="absolute inset-0"
                        style={{
                            transformOrigin: '0 0',
                            maskSize: '100% 100%',
                            WebkitMaskSize: '100% 100%',
                            maskRepeat: 'no-repeat',
                            WebkitMaskRepeat: 'no-repeat',
                        }}
                    />
                </div>
            )}
        </div>
    );
};
