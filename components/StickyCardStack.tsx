'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useSpring, useTransform, MotionValue, useAnimate, stagger } from 'framer-motion';
import { ChevronUp, ChevronDown, Home } from 'lucide-react';

// Sample data
interface CardData {
    id: number;
    title: string;
    titleClass?: string;
    description: string;
    bullets: string[];
}

const CARDS: CardData[] = [
    {
        id: 1,
        title: "Hi, I'm Shem.",
        titleClass: "text-2xl",
        description: "BSIT student. Full-stack developer. Building things that actually work.",
        bullets: [
            "Full-stack, backend-strong",
            "Into APIs, databases, trading and markets",
            "Ready to ship on day one"
        ]
    },
    {
        id: 2,
        title: "What I work with.",
        titleClass: "text-xl",
        description: "I've built with a mix of modern tools, enough to be useful on day one and grow from there.",
        bullets: [
            "TypeScript, Next.js & React Native",
            "Supabase, Firebase & MongoDB",
            "REST, WebSockets & IoT Integration"
        ]
    },
    {
        id: 3,
        title: "How I got here.",
        titleClass: "text-xl",
        description: "I took BSIT because it made sense. Somewhere along the way I actually started to love it.",
        bullets: [
            "School gave me the foundation",
            "Side projects kept me going",
            "Curiosity did the rest",
        ]
    },
    {
        id: 4,
        title: "Where I thrive.",
        titleClass: "text-xl",
        description: "I want a team I can learn from, one that moves fast but still cares about doing things right.",
        bullets: [
            "I like getting real feedback",
            "Mentorship I can actually learn from",
            "Collaborative by default"
        ]
    },
    {
        id: 5,
        title: "Let's build something.",
        titleClass: "text-xl",
        description: "I'm just getting started but, I show up, I learn fast, and I don't leave things half-done.",
        bullets: [
            "Open for junior roles",
            "Local or remote works for me",
            "Still learning, but I take it seriously",
        ]
    }
];

export const StickyCardStack = () => {
    // Current active card index (0 to CARDS.length - 1)
    const [activeIndex, setActiveIndex] = useState(0);

    // Updated Spring: High stiffness, high damping to prevent overshoot/bounce
    const currentProgress = useSpring(0, {
        stiffness: 1000,
        damping: 50,
        mass: 1,
        restDelta: 0.001
    });

    const scrollAccumulator = useRef(0);

    useEffect(() => {
        // Sync spring with state
        currentProgress.set(activeIndex);
    }, [activeIndex, currentProgress]);

    const handleWheel = useCallback((e: WheelEvent) => {
        e.preventDefault();

        // Add delta to our "virtual scroll" bucket
        scrollAccumulator.current += e.deltaY;

        const threshold = 40; // Reduced threshold for FASTER triggering

        // ONE SCROLL = ONE CARD Logic
        // If we cross the threshold, we move exactly ONE step, then reset the accumulator.
        // This prevents fast scrolling from skipping multiple cards at once.
        if (Math.abs(scrollAccumulator.current) >= threshold) {
            const direction = scrollAccumulator.current > 0 ? 1 : -1;

            setActiveIndex((prev) => {
                const next = prev + direction;
                return Math.max(0, Math.min(next, CARDS.length - 1));
            });

            // Critical: Reset accumulator to 0 to discard momentum
            scrollAccumulator.current = 0;
        }
    }, []);

    useEffect(() => {
        // Use non-passive listener to be able to preventDefault
        window.addEventListener('wheel', handleWheel, { passive: false });
        return () => window.removeEventListener('wheel', handleWheel);
    }, [handleWheel]);

    return (
        <div className="h-screen w-full relative overflow-hidden bg-transparent pointer-events-none">
            {/* Center the stack */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-[400px] md:w-[460px] h-[300px] md:h-[320px]">
                    {/* Static Floating Header (Outside 3D context to guarantee pointer events) */}
                    <div className="absolute top-6 right-6 md:top-8 md:right-8 z-[200] flex justify-end items-center space-x-3 pointer-events-auto">
                        <button
                            onClick={() => {
                                if (activeIndex === CARDS.length - 1) {
                                    // If on the last card, this acts as the "UP/back" button
                                    setActiveIndex(Math.max(0, activeIndex - 1));
                                } else {
                                    // Otherwise, act as the "DOWN/next" button
                                    setActiveIndex(Math.min(CARDS.length - 1, activeIndex + 1));
                                }
                            }}
                            className="w-6 h-6 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 bg-black hover:bg-neutral-900 transition-colors cursor-pointer"
                        >
                            {activeIndex === CARDS.length - 1 ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                        </button>
                        <span className="font-mono text-white text-sm font-bold">{activeIndex + 1} / {CARDS.length}</span>
                        <button
                            onClick={() => {
                                if (activeIndex === CARDS.length - 1) {
                                    // Rewind sequentially back to the first card
                                    let current = activeIndex;
                                    const interval = setInterval(() => {
                                        current -= 1;
                                        setActiveIndex(current);
                                        if (current <= 0) {
                                            clearInterval(interval);
                                        }
                                    }, 180); // Speed of the rewind hop
                                } else {
                                    setActiveIndex(Math.max(0, activeIndex - 1));
                                }
                            }}
                            className="w-6 h-6 rounded-full border border-neutral-800 flex items-center justify-center text-neutral-400 bg-black hover:bg-neutral-900 transition-colors cursor-pointer whitespace-nowrap"
                        >
                            {activeIndex === CARDS.length - 1 ? (
                                <Home size={10} />
                            ) : (
                                <ChevronUp size={10} />
                            )}
                        </button>
                    </div>

                    <div className="absolute inset-0 pointer-events-none" style={{ perspective: 1000, transformStyle: 'preserve-3d' }}>
                        {CARDS.map((card, index) => (
                            <Card
                                key={card.id}
                                card={card}
                                index={index}
                                cardProgress={currentProgress}
                                total={CARDS.length}
                                activeIndex={activeIndex}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface CardProps {
    card: CardData;
    index: number;
    cardProgress: MotionValue<number>;
    total: number;
    activeIndex: number;
}

const CardContent = ({ card, isActive }: { card: CardData; isActive: boolean }) => {
    const [scope, animate] = useAnimate();
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (isActive) {
            if (!hasAnimated.current) {
                // First time: play the word pop stagger
                animate(
                    ".word-reveal",
                    { opacity: 1, scale: 1 },
                    {
                        duration: 0.25,
                        delay: stagger(0.05),
                        ease: [0.34, 1.56, 0.64, 1] // Matches popup word cubic-bezier
                    }
                );
                hasAnimated.current = true;
            } else {
                // Already animated before: show fast
                animate(".word-reveal", { opacity: 1, scale: 1 }, { duration: 0.05 });
            }
        } else {
            animate(".word-reveal", { opacity: 0, scale: 0.6 }, { duration: 0.01, delay: 0.4 });
        }
    }, [isActive, animate]);

    const splitText = (text: string) => {
        return text.split(/(\s+)/).map((word, wordIndex) => {
            if (word.match(/\s+/)) {
                return (
                    <span key={wordIndex}>
                        {word}
                    </span>
                );
            }
            return (
                <span
                    key={wordIndex}
                    className="word-reveal inline-block opacity-0"
                    style={{ transform: 'scale(0.6)', transformOrigin: 'center bottom' }}
                >
                    {word}
                </span>
            );
        });
    };

    return (
        <div ref={scope} className="space-y-4">
            <h3 className={`font-bold text-white ${card.titleClass || 'text-xl'}`}>
                {splitText(card.title)}
            </h3>
            <p className="text-[15px] text-white font-medium">
                {splitText(card.description)}
            </p>
            <div className="space-y-2 text-[15px] text-white">
                {card.bullets.map((bullet, i) => (
                    <div key={i} className="flex items-start gap-2">
                        <span className="word-reveal opacity-0 text-white mt-[2px]" style={{ transform: 'scale(0.6)', transformOrigin: 'center bottom' }}>-</span>
                        <div className="flex-1">
                            {splitText(bullet)}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Card = ({ card, index, cardProgress, total, activeIndex }: CardProps) => {
    // Same Logic as before, but driven by the Spring Value 'cardProgress'

    // Position: "distance" from the current active card
    const position = useTransform(cardProgress, (val) => index - val);

    // Scale:
    // Leaving (< 0): Very subtle shrink (0.02) to match stack feel ("Like scroll down")
    // Waiting (> 0): Stack effect (scales down 0.02 per card)
    const scale = useTransform(position, (pos) => {
        if (pos < 0) {
            // Leaving: Keep scale at 1 to cover the card behind it
            return 1;
        }
        // Deeper visual stack, capped at 5
        return 1 - Math.min(pos, 5) * 0.01;
    });

    // Y-Offset:
    // Leaving (< 0): Float up slightly (-5px) - Almost instant appearance for max speed
    // Waiting (> 0): Funnel effect (Gap increases with depth)
    const y = useTransform(position, (pos) => {
        if (pos < 0) {
            return pos * 5;
        }
        // Quadratic increase for "Funnel" look: 
        const p = Math.min(pos, 5);
        return p * 10 + (p * p * 5);
    });

    // Z-Offset (True 3D depth): Push deeper cards back in 3D space
    const z = useTransform(position, (pos) => -pos * 10);

    // Z-Index: Static stack order (0 is top, 1 is below, etc.) to prevent glitches
    const zIndex = total - index;

    // Blur: Progressive blur for depth effect
    const filter = useTransform(position, (pos) => {
        // Active (0) and Next (1): Sharp
        if (pos <= 1) return "blur(0px)";

        // Second Waiting (2): Subtle blur (2px)
        // Deeper cards increase
        const b = (Math.min(pos, 5) - 1) * 2;
        return `blur(${b}px)`;
    });

    // Opacity: Fade out leaving cards to prevent "stacking" visibility
    // Updated: Added buffer (-0.05) to prevent accidental fade on spring overshoot
    const opacity = useTransform(position, (pos) => {
        if (pos < -0.05) {
            return 1 + ((pos + 0.05) * 20);
        }
        return 1;
    });


    const contentOpacity = useTransform(position, (pos) => {
        // If card is active (0) or leaving (<0), it's fully visible.
        if (pos <= 0) return 1;

        // As it moves back (pos > 0), fade it out smoothly.
        // Fully hidden by 0.5 distance to prevent bleed-through but allow smooth transition.
        if (pos >= 0.5) return 0;

        // Linear fade: 1 at 0, 0 at 0.5
        return 1 - (pos / 0.5);
    });

    return (
        <motion.div
            style={{
                scale,
                y,
                z,
                zIndex,
                borderColor: '#ffffff',
                borderWidth: 2,
                filter,
                opacity
            }}
            className="absolute inset-0 bg-black rounded-2xl border-transparent shadow-2xl flex flex-col p-6 md:p-8 pointer-events-auto"
        >
            {/* Header removed from here */}

            {/* Content - Static and Fixed - Added margin top to account for absolute header */}
            <motion.div
                style={{ opacity: contentOpacity }}
                className="flex-1 font-mono text-white text-base md:text-lg leading-relaxed select-none mt-6"
            >
                <CardContent card={card} isActive={activeIndex === index} />
            </motion.div>
        </motion.div>
    );
};
