'use client';

import React, { useEffect, useRef, useState } from 'react';

/** "Rei" in a 5-row pixel font — every '#' becomes a tile that lands in a cell of the background grid */
const GLYPHS = [
    ['###.', '#..#', '###.', '#.#.', '#..#'], // R
    ['.#.', '#.#', '###', '#..', '.##'], //      e
    ['#', '.', '#', '#', '#'], //                i
];
const ROWS = 5;
const LETTER_GAP = 1;

/** Columns land left to right, so the name assembles like it's being written */
const SLAP_COL_STEP = 85;
/** Beat before the dot of the i lands, as the finishing touch */
const DOT_PAUSE = 260;
const FALL_COL_STEP = 35;
/** Fall-away duration (ms) — matches .is-leaving .intro-tile in globals.css */
const FALL_MS = 550;
/** Hold on the finished name once loading is done, so it clearly reads before leaving */
const SETTLE_MS = 700;

/** Integer hash → 0..1, so the server and every browser render identical delays */
const jitter = (n: number) => ((n * 7919) % 97) / 97;

interface Tile {
    col: number;
    row: number;
    slapDelay: number;
    fallDelay: number;
}

const TILES: Tile[] = (() => {
    const tiles: Tile[] = [];
    let x = 0;
    GLYPHS.forEach((glyph, g) => {
        glyph.forEach((line, row) => {
            [...line].forEach((cell, c) => {
                if (cell !== '#') return;
                const col = x + c;
                const i = tiles.length;
                tiles.push({
                    col,
                    row,
                    slapDelay: Math.round(col * SLAP_COL_STEP + jitter(i) * 60),
                    fallDelay: Math.round(col * FALL_COL_STEP + jitter(i + 7) * 80),
                });
            });
        });
        // Dot the i last
        if (g === GLYPHS.length - 1) {
            const dot = tiles.find((t) => t.col === x && t.row === 0);
            if (dot) dot.slapDelay = Math.max(...tiles.map((t) => t.slapDelay)) + DOT_PAUSE;
        }
        x += glyph[0].length + LETTER_GAP;
    });
    return tiles;
})();
const COLS = Math.max(...TILES.map((t) => t.col)) + 1;
const EXIT_MS = FALL_MS + Math.max(...TILES.map((t) => t.fallDelay));

interface IntroScreenProps {
    /** True once everything underneath is loaded and decoded */
    ready: boolean;
    /** Called after the tiles have fallen away */
    onDone: () => void;
}

/**
 * Opening screen: "Rei" is built tile by tile in the page's own background grid.
 * Rendered in the server HTML and animated with CSS only, so it shows immediately and
 * stays smooth while the JavaScript loads and the portfolio is built underneath.
 */
export const IntroScreen: React.FC<IntroScreenProps> = ({ ready, onDone }) => {
    const nameRef = useRef<HTMLDivElement>(null);
    const [landed, setLanded] = useState(false);
    const [leaving, setLeaving] = useState(false);

    // Tiles may have landed before JS hydrated; finished resolves right away then.
    // The looping shimmer never finishes, so only the one-off landings are awaited.
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
                style={{ '--cols': COLS, '--rows': ROWS } as React.CSSProperties}
            >
                {TILES.map((t, i) => (
                    <span
                        key={i}
                        className={`intro-tile ${i % 2 ? 'tilt-r' : ''}`}
                        style={{
                            '--col': t.col,
                            '--row': t.row,
                            '--slap-delay': `${t.slapDelay}ms`,
                            '--fall-delay': `${t.fallDelay}ms`,
                        } as React.CSSProperties}
                    >
                        <span className="intro-tile-face" />
                    </span>
                ))}
            </div>
        </div>
    );
};
