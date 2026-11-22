'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { peelGeometry, backingGradient } from './stickers/StickerPeel';

const NAME = 'Rei';
/** The name's box in background-grid cells — it's cut into one square per cell */
const COLS = 8;
const ROWS = 5;

/** The corner marks snap into place first, then the squares start landing */
const FRAME_LEAD_MS = 250;
/** Squares land in a diagonal sweep, left to right, so the name assembles like it's being stamped */
const SLAP_COL_STEP = 100;
const SLAP_ROW_STEP = 45;
/** Slap-in duration (ms) — matches .intro-tile in globals.css */
const SLAP_MS = 600;
/** The name cracks along the grid first, then the squares tumble away */
const CRACK_MS = 140;
const FALL_COL_STEP = 35;
const FALL_ROW_STEP = 15;
/** Fall-away duration (ms) — matches .is-leaving .intro-tile in globals.css */
const FALL_MS = 550;
/** Even on a fast load the counter takes this long (ms, from first paint) — about when the name finishes assembling */
const COUNT_MIN_MS = 2000;
/** After 100%, the name holds this long while the hidden portfolio settles before it's revealed */
const HOLD_MS = 3000;
/** Longest the break waits for the main thread to go quiet after the hold */
const IDLE_TIMEOUT_MS = 1000;
/** During the hold the letters peel like a sticker: the fold travels this share of the way across them */
const PEEL_SHARE = 0.3;
/** Peel timing (ms) — it's flat again before the hold ends, so the break starts from the whole name */
const PEEL_DELAY_MS = 250;
const PEEL_MS = 2400;

/** Integer hash → 0..1, so the server and every browser render identical delays */
const jitter = (n: number) => ((n * 7919) % 97) / 97;

const TILES = Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
        col,
        row,
        slapDelay: Math.round(FRAME_LEAD_MS + col * SLAP_COL_STEP + row * SLAP_ROW_STEP + jitter(i) * 40),
        fallDelay: Math.round(CRACK_MS + col * FALL_COL_STEP + row * FALL_ROW_STEP + jitter(i + 7) * 70),
    };
});
/** When the last square has landed — the seamless solid name takes over from then */
const ASSEMBLED_AT = Math.max(...TILES.map((t) => t.slapDelay)) + SLAP_MS;
const EXIT_MS = Math.max(...TILES.map((t) => t.fallDelay)) + FALL_MS;

const formatPercent = (fraction: number) => `${String(Math.round(fraction * 100)).padStart(3, '0')}%`;

/** When the name first showed — it's in the server HTML, so that's the page's first paint */
const shownAt = () => performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? performance.now();

/** Runs the callback once the main thread is free (Safari has no requestIdleCallback) */
const whenIdle = (callback: () => void) => {
    if (typeof requestIdleCallback === 'function') {
        const id = requestIdleCallback(callback, { timeout: IDLE_TIMEOUT_MS });
        return () => cancelIdleCallback(id);
    }
    const id = setTimeout(callback, 0);
    return () => clearTimeout(id);
};

/**
 * The letters' ink box inside the name's layer, from the font's real glyph bounds —
 * the layer is the whole grid box, so the peel has to start at the letters, not the box corner
 */
function measureInk(layer: HTMLElement) {
    const letters = Array.from(layer.querySelectorAll<HTMLElement>('.intro-letter'));
    const ctx = document.createElement('canvas').getContext('2d');
    if (!letters.length || !ctx) return null;
    const cs = getComputedStyle(layer);
    ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const box = layer.getBoundingClientRect();
    const metrics = letters.map((l) => ctx.measureText((l.textContent ?? '').toUpperCase()));
    const firstRect = letters[0].getBoundingClientRect();
    const lastRect = letters[letters.length - 1].getBoundingClientRect();
    const baseline = firstRect.top - box.top + metrics[0].fontBoundingBoxAscent;
    return {
        left: firstRect.left - box.left - metrics[0].actualBoundingBoxLeft,
        right: lastRect.left - box.left + metrics[metrics.length - 1].actualBoundingBoxRight,
        top: baseline - Math.max(...metrics.map((m) => m.actualBoundingBoxAscent)),
        bottom: baseline + Math.max(...metrics.map((m) => m.actualBoundingBoxDescent)),
    };
}

interface IntroScreenProps {
    /** Share of the portfolio loaded and decoded so far (0–1), written by the page without re-rendering it */
    progressRef: React.RefObject<number>;
    /** Called after the squares have fallen away */
    onDone: () => void;
}

/**
 * Opening screen: "REI" in solid type, framed like a sticker on a printed sheet. It's
 * assembled from squares that slap into the page's background grid, peels like a sticker
 * once everything has loaded, and breaks back into those squares when the portfolio is ready.
 * Rendered in the server HTML and animated with CSS while loading, so it shows immediately
 * and stays smooth while the portfolio is built underneath.
 */
export const IntroScreen: React.FC<IntroScreenProps> = ({ progressRef, onDone }) => {
    const nameRef = useRef<HTMLDivElement>(null);
    const percentRef = useRef<HTMLSpanElement>(null);
    const solidRef = useRef<HTMLDivElement>(null);
    const flapWrapRef = useRef<HTMLDivElement>(null);
    const flapRef = useRef<HTMLDivElement>(null);
    const [landed, setLanded] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // Squares may have landed before JS hydrated; finished resolves right away then
    useEffect(() => {
        const landings = nameRef.current?.getAnimations({ subtree: true }) ?? [];
        Promise.all(landings.map((a) => a.finished.catch(() => { }))).then(() => setLanded(true));
    }, []);

    // The percentage follows real loading progress, so 100% means everything is downloaded and decoded
    useEffect(() => {
        let shown = 0;
        let frame = 0;
        const tick = () => {
            const paced = (performance.now() - shownAt()) / COUNT_MIN_MS;
            const target = Math.min(progressRef.current, paced, 1);
            shown = target - shown < 0.005 ? target : shown + (target - shown) * 0.12;
            if (percentRef.current) percentRef.current.textContent = formatPercent(shown);
            if (shown < 1) frame = requestAnimationFrame(tick);
            else setLoaded(true);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [progressRef]);

    // Hold on 100% while the portfolio underneath settles, then break only once the main thread
    // is free, so nothing competes with the break or the portfolio's entrance
    useEffect(() => {
        if (!loaded || !landed) return;
        let cancelIdle = () => { };
        const hold = setTimeout(() => {
            cancelIdle = whenIdle(() => setLeaving(true));
        }, HOLD_MS);
        return () => {
            clearTimeout(hold);
            cancelIdle();
        };
    }, [loaded, landed]);

    // Meanwhile the letters peel like the stickers do on hover: their bottom-right corner lifts about
    // halfway across and folds back to show the letters' backing, then presses flat again
    useEffect(() => {
        const solid = solidRef.current;
        const flapWrap = flapWrapRef.current;
        const flap = flapRef.current;
        if (!loaded || !landed || !solid || !flapWrap || !flap) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        const ink = measureInk(solid);
        if (!ink) return;

        const w = solid.offsetWidth;
        const h = solid.offsetHeight;
        const ext = {
            maxSum: ink.right + ink.bottom,
            minSum: ink.left + ink.top,
            maxDiff: ink.right - ink.top,
            minDiff: ink.left - ink.bottom,
        };
        // The flap's top edge rises by the reach, so it's capped to stay inside the corner marks
        const reach = Math.min(PEEL_SHARE * (ext.maxSum - ext.minSum), ink.bottom);
        const apply = (t: number) => {
            if (t <= 0) {
                solid.style.clipPath = '';
                flapWrap.style.visibility = 'hidden';
                return;
            }
            const g = peelGeometry('br', w, h, ext, t * reach);
            solid.style.clipPath = g.front;
            flap.style.clipPath = g.flap;
            flap.style.transform = g.transform;
            flap.style.backgroundImage = backingGradient(g);
            flapWrap.style.visibility = 'visible';
        };
        const controls = animate(0, [0, 1, 1, 0], {
            delay: PEEL_DELAY_MS / 1000,
            duration: PEEL_MS / 1000,
            times: [0, 0.45, 0.72, 1],
            ease: [[0.22, 1, 0.36, 1], 'linear', [0.4, 0, 0.2, 1]],
            onUpdate: apply,
        });
        return () => {
            controls.stop();
            apply(0);
        };
    }, [loaded, landed]);

    useEffect(() => {
        if (!leaving) return;
        const done = setTimeout(onDone, EXIT_MS);
        return () => clearTimeout(done);
    }, [leaving, onDone]);

    return (
        <div
            role="status"
            aria-label="Loading Rei's portfolio"
            className="fixed inset-0 z-[400] pointer-events-none select-none"
        >
            <div
                ref={nameRef}
                aria-hidden="true"
                className={`intro-name ${leaving ? 'is-leaving' : ''}`}
                style={{ '--cols': COLS, '--rows': ROWS, '--assembled-at': `${ASSEMBLED_AT}ms` } as React.CSSProperties}
            >
                {/* Die-cut corner marks and print captions, sitting on the grid around the name */}
                <span className="intro-mark tl" />
                <span className="intro-mark tr" />
                <span className="intro-mark bl" />
                <span className="intro-mark br" />
                <span className="intro-caption top left">Portfolio</span>
                <span className="intro-caption top right">
                    {loaded ? 'Loaded' : 'Loading'} <span ref={percentRef} className="intro-percent">{formatPercent(0)}</span>
                </span>
                <span className="intro-caption bottom left">Full-stack developer</span>
                <span className="intro-caption bottom right">©2026</span>

                {/* One seamless solid layer, shown while the name is whole */}
                <div ref={solidRef} className="intro-text intro-solid">
                    {[...NAME].map((char, i) => (
                        <span key={i} className="intro-letter">{char}</span>
                    ))}
                </div>

                {/* The peeled corner: the back of the letters, mirrored across the fold */}
                <div ref={flapWrapRef} className="intro-flap-wrap">
                    <div ref={flapRef} className="intro-text intro-flap">{NAME}</div>
                </div>

                {/* The same name cut into grid squares — each square is a window onto its slice */}
                <div className="intro-tiles">
                    {TILES.map((t, i) => (
                        <span
                            key={i}
                            className={`intro-tile ${(t.col + t.row) % 2 ? 'tilt-r' : ''}`}
                            style={{
                                '--col': t.col,
                                '--row': t.row,
                                '--slap-delay': `${t.slapDelay}ms`,
                                '--fall-delay': `${t.fallDelay}ms`,
                            } as React.CSSProperties}
                        >
                            <span className="intro-tile-piece">
                                <span className="intro-text">{NAME}</span>
                            </span>
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};
