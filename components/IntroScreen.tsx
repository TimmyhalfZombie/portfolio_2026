'use client';

import React, { useEffect, useRef, useState } from 'react';

const NAME = 'Rei';
/** The name's box in background-grid cells — it's cut into one square per cell */
const COLS = 8;
const ROWS = 5;

/** Squares land in a diagonal sweep, left to right, so the name assembles like it's being stamped */
const SLAP_COL_STEP = 75;
const SLAP_ROW_STEP = 35;
/** Slap-in duration (ms) — matches .intro-tile in globals.css */
const SLAP_MS = 500;
/** The name cracks along the grid first, then the squares tumble away */
const CRACK_MS = 140;
const FALL_COL_STEP = 35;
const FALL_ROW_STEP = 15;
/** Fall-away duration (ms) — matches .is-leaving .intro-tile in globals.css */
const FALL_MS = 550;
/** Hold on the finished name once loading is done, so it clearly reads before leaving */
const SETTLE_MS = 700;

/** Integer hash → 0..1, so the server and every browser render identical delays */
const jitter = (n: number) => ((n * 7919) % 97) / 97;

const TILES = Array.from({ length: COLS * ROWS }, (_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
        col,
        row,
        slapDelay: Math.round(col * SLAP_COL_STEP + row * SLAP_ROW_STEP + jitter(i) * 40),
        fallDelay: Math.round(CRACK_MS + col * FALL_COL_STEP + row * FALL_ROW_STEP + jitter(i + 7) * 70),
    };
});
/** When the last square has landed — the seamless solid name takes over from then */
const ASSEMBLED_AT = Math.max(...TILES.map((t) => t.slapDelay)) + SLAP_MS;
const EXIT_MS = Math.max(...TILES.map((t) => t.fallDelay)) + FALL_MS;

interface IntroScreenProps {
    /** True once everything underneath is loaded and decoded */
    ready: boolean;
    /** Called after the squares have fallen away */
    onDone: () => void;
}

/**
 * Opening screen: "Rei" in solid type, assembled from squares that slap into the page's
 * background grid, and broken back into those squares when the portfolio is ready.
 * Rendered in the server HTML and animated with CSS only, so it shows immediately and
 * stays smooth while the JavaScript loads and the portfolio is built underneath.
 */
export const IntroScreen: React.FC<IntroScreenProps> = ({ ready, onDone }) => {
    const nameRef = useRef<HTMLDivElement>(null);
    const [landed, setLanded] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // Squares may have landed before JS hydrated; finished resolves right away then.
    // The looping glow never finishes, so only the one-off animations are awaited.
    useEffect(() => {
        const landings = (nameRef.current?.getAnimations({ subtree: true }) ?? [])
            .filter((a) => a.effect?.getTiming().iterations !== Infinity);
        Promise.all(landings.map((a) => a.finished.catch(() => { }))).then(() => setLanded(true));
    }, []);

    useEffect(() => {
        if (!ready || !landed) return;
        const settle = setTimeout(() => setLeaving(true), SETTLE_MS);
        return () => clearTimeout(settle);
    }, [ready, landed]);

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
                {/* One seamless solid layer, shown while the name is whole */}
                <div className="intro-text intro-solid">
                    {[...NAME].map((char, i) => (
                        <span key={i} className="intro-letter" data-char={char} style={{ '--i': i } as React.CSSProperties}>
                            {char}
                        </span>
                    ))}
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
