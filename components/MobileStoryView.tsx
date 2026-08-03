'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CARDS, CardData, CardContent } from './StickyCardStack';
import { Sticker } from './stickers';
import { STICKER_CONFIG } from './stickers/StickerConfig';
import { useComments, Comment } from '@/hooks/useComments';
import { getAssignedAnonymousName, getAvatarInitial } from '@/lib/anonymous-names';
import { toast } from 'sonner';

interface MobileStickerConfig {
    id: string;
    top: string;
    left: string;
    width: string;
    rotate: number;
}

// Maps stickers to their thematic slides for mobile story view (with enlarged sizes)
const MOBILE_STORY_STICKERS: Record<number, MobileStickerConfig[]> = {
    0: [ // Slide 1: Welcome
        { id: 'main-me', top: '-47%', left: '27%', width: '13.5rem', rotate: 0 },
        { id: 'cat', top: '-24%', left: '2%', width: '6.5rem', rotate: 0 },
        { id: 'me', top: '95%', left: '-4%', width: '10.5rem', rotate: -12 },
        { id: 'flag', top: '-48%', left: '69%', width: '7.8rem', rotate: 10 },
        { id: 'resume', top: '87%', left: '72%', width: '5.2rem', rotate: -8 },
        { id: 'palawan', top: '105%', left: '30%', width: '9.8rem', rotate: 6 }
    ],
    1: [ // Slide 2: Skills & Featured Projects (VIPScale, Kajabi, Squarespace, Wix, GHL, Assumption, PatchUp, Hive, LTBL)
        { id: 'vipscale', top: '119%', left: '48%', width: '5.6rem', rotate: 5 },
        { id: 'kajabi', top: '-15%', left: '5%', width: '4.5rem', rotate: -8 },
        { id: 'squarespace', top: '120%', left: '2%', width: '4.8rem', rotate: -6 },
        { id: 'wix', top: '-53%', left: '13%', width: '5.8rem', rotate: -10 },
        { id: 'ghl', top: '-35%', left: '62%', width: '6.8rem', rotate: 10 },
        { id: 'assumption', top: '-50%', left: '50%', width: '5.2rem', rotate: 8 },
        { id: 'patchup', top: '92%', left: '66%', width: '5.0rem', rotate: 6 },
        { id: 'hive', top: '96%', left: '20%', width: '4.5rem', rotate: -8 },
        { id: 'ltbl', top: '-25%', left: '32%', width: '6.8rem', rotate: -5 }
    ],
    2: [ // Slide 3: Background & Interests
        { id: 'coursera', top: '-18%', left: '8%', width: '4.5rem', rotate: -5 },
        { id: 'crayfish', top: '-36%', left: '58%', width: '7.5rem', rotate: -8 },
        { id: 'fishing', top: '98%', left: '50%', width: '5.6rem', rotate: -15 }
    ],
    3: [ // Slide 4: Projects & Crafts
        { id: 'fazzio', top: '103%', left: '60%', width: '9.0rem', rotate: 0 },
        { id: 'tool', top: '-23%', left: '7%', width: '7.0rem', rotate: -5 },
        { id: 'github', top: '-15%', left: '70%', width: '5.0rem', rotate: 6 },
        { id: 'punk', top: '93%', left: '2%', width: '6.5rem', rotate: 1 }
    ],
    4: [ // Slide 5: Connect & Contact
        { id: 'email', top: '-27%', left: '4%', width: '6.8rem', rotate: 8 },
        { id: 'telegram', top: '-19%', left: '60%', width: '4.2rem', rotate: 12 },
        { id: 'fb', top: '108%', left: '70%', width: '4.8rem', rotate: 12 },
        { id: 'linkedin', top: '98%', left: '5%', width: '4.8rem', rotate: -15 }
    ]
};

// ─── TABLET PORTRAIT OVERRIDES ───
// Only list stickers that need different positioning/sizing on tablet portrait.
// Any sticker NOT listed here will fall back to its MOBILE_STORY_STICKERS values.
// Adjust these values independently without touching mobile or desktop.
const TABLET_STORY_STICKERS: Record<number, Partial<Record<string, Partial<MobileStickerConfig>>>> = {
    0: { // Slide 1: Welcome
        'main-me': { top: 'calc(-65% - 3vh)', width: '13rem' },
        'cat': { top: 'calc(-38% - 2vh)', width: '7.5rem' },
        'me': { top: 'calc(100% + 3vh)', left: '-2%', width: '9rem' },
        'flag': { top: 'calc(-68% - 3vh)', left: '75%', width: '6rem' },
        'resume': { top: 'calc(105% + 2vh)', left: '72%', width: '6rem' },
        'palawan': { top: 'calc(115% + 4vh)', left: '25%', width: '9rem' },
    },
    1: { // Slide 2: Skills & Featured Projects
        'vipscale': { top: 'calc(135% + 4vh)', left: '44%', width: '4.5rem' },
        'kajabi': { top: 'calc(-25% - 2vh)', left: '5%', width: '3.5rem' },
        'squarespace': { top: 'calc(135% + 4vh)', left: '2%', width: '3.5rem' },
        'wix': { top: 'calc(-60% - 3vh)', left: '13%', width: '4.8rem' },
        'ghl': { top: 'calc(-50% - 3vh)', left: '78%', width: '5.8rem' },
        'assumption': { top: 'calc(-58% - 4vh)', left: '50%', width: '4rem' },
        'patchup': { top: 'calc(105% + 3vh)', left: '66%', width: '3.8rem' },
        'hive': { top: 'calc(110% + 3vh)', left: '20%', width: '3.2rem' },
        'ltbl': { top: 'calc(-38% - 2vh)', left: '38%', width: '5.8rem' },
    },
    2: { // Slide 3: Background & Interests
        'coursera': { top: 'calc(-20% - 2vh)', left: '8%', width: '3.5rem' },
        'crayfish': { top: 'calc(-45% - 3vh)', left: '58%', width: '5.5rem' },
        'fishing': { top: 'calc(110% + 4vh)', left: '50%', width: '4.5rem' },
    },
    3: { // Slide 4: Projects & Crafts
        'fazzio': { top: 'calc(105% + 4vh)', left: '60%', width: '8rem' },
        'tool': { top: 'calc(-38% - 3vh)', left: '10%', width: '6rem' },
        'github': { top: 'calc(-18% - 2vh)', left: '75%', width: '3.8rem' },
        'punk': { top: 'calc(95% + 3vh)', left: '2%', width: '5.5rem' },
    },
    4: { // Slide 5: Connect & Contact
        'email': { top: 'calc(-22% - 3vh)', left: '6%', width: '5.8rem' },
        'telegram': { top: 'calc(-32% - 2vh)', left: '62%', width: '3rem' },
        'fb': { top: 'calc(100% + 4vh)', left: '72%', width: '3.5rem' },
        'linkedin': { top: 'calc(110% + 4vh)', left: '7%', width: '3.5rem' },
    },
};

const STORY_DURATION = 10000; // 10 seconds per card

export const MobileStoryView = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0); // Forces CSS animation restart
    const [isLiked, setIsLiked] = useState(false);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isInputActive, setIsInputActive] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Shared comments via GitHub Discussions API
    const { comments, isLoading, postComment, deleteComment } = useComments();

    // Detect tablet portrait for sticker config overrides
    const [isTablet, setIsTablet] = useState(false);
    useEffect(() => {
        const mql = window.matchMedia('(min-width: 700px) and (orientation: portrait)');
        const update = () => setIsTablet(mql.matches);
        update();
        mql.addEventListener('change', update);
        return () => mql.removeEventListener('change', update);
    }, []);

    const handleSendComment = useCallback(async () => {
        if (!commentText.trim()) return;

        setIsPosting(true);
        try {
            const assignedName = getAssignedAnonymousName();
            await postComment(assignedName, commentText.trim());
            setCommentText('');
            setIsInputActive(false);
            inputRef.current?.blur();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to post comment');
        } finally {
            setIsPosting(false);
        }
    }, [commentText, postComment]);

    const handleDeleteComment = useCallback(async (id: string) => {
        const ok = await deleteComment(id);
        if (!ok) toast.error('Failed to delete comment');
    }, [deleteComment]);

    const [isPaused, setIsPaused] = useState(false);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isLongPressRef = useRef(false);
    const startTimeRef = useRef<number>(Date.now());
    const elapsedRef = useRef<number>(0);

    const clearTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }, []);

    const startTimer = useCallback((duration: number = STORY_DURATION) => {
        clearTimer();
        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(() => {
            setActiveIndex((prev) => {
                if (prev < CARDS.length - 1) {
                    return prev + 1;
                }
                return prev; // Stay on last card
            });
        }, duration);
    }, [clearTimer]);

    // Start/restart timer whenever activeIndex changes
    useEffect(() => {
        elapsedRef.current = 0;
        setProgressKey((k) => k + 1); // Restart CSS animation
        startTimer(STORY_DURATION);
        return () => clearTimer();
    }, [activeIndex, startTimer, clearTimer]);

    // Pause story timer when comments bottom sheet is open
    useEffect(() => {
        if (showComments) {
            clearTimer();
            setIsPaused(true);
        } else if (!isLongPressRef.current) {
            setIsPaused(false);
            const remaining = Math.max(200, STORY_DURATION - elapsedRef.current);
            startTimer(remaining);
        }
    }, [showComments, clearTimer, startTimer]);

    const goTo = useCallback((index: number) => {
        setActiveIndex(Math.max(0, Math.min(CARDS.length - 1, index)));
    }, []);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.pointer-events-auto:not(.story-nav-area)')) {
            return;
        }

        isLongPressRef.current = false;
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);

        longPressTimerRef.current = setTimeout(() => {
            isLongPressRef.current = true;
            setIsPaused(true);
            clearTimer();
            elapsedRef.current += Date.now() - startTimeRef.current;
        }, 220);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        if (target.closest('.pointer-events-auto:not(.story-nav-area)')) {
            if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
            return;
        }

        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        if (isLongPressRef.current) {
            isLongPressRef.current = false;
            setIsPaused(false);
            const remaining = Math.max(200, STORY_DURATION - elapsedRef.current);
            startTimer(remaining);
        } else {
            const x = e.clientX;
            const width = window.innerWidth;
            if (x < width * 0.3) {
                goTo(activeIndex - 1);
            } else {
                goTo(activeIndex + 1);
            }
        }
    };

    // Merge tablet overrides when on tablet portrait, otherwise use mobile config as-is
    const activeStickers = (MOBILE_STORY_STICKERS[activeIndex] || []).map((stConfig) => {
        if (!isTablet) return stConfig;
        const tabletOverrides = TABLET_STORY_STICKERS[activeIndex]?.[stConfig.id];
        if (!tabletOverrides) return stConfig;
        return { ...stConfig, ...tabletOverrides };
    });

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="story-nav-area fixed inset-0 w-full bg-transparent flex flex-col items-center justify-center select-none overflow-x-hidden z-10"
            style={{ touchAction: 'none', height: '100dvh', paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Top Progress Bars (Instagram style) */}
            <div className="absolute left-4 right-4 flex gap-1.5 z-[210] pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1.5rem)' }}>
                {CARDS.map((_, i) => (
                    <div
                        key={i}
                        className="h-1 flex-1 bg-neutral-800 rounded-full overflow-hidden"
                    >
                        <div
                            key={`${i}-${progressKey}`}
                            className="h-full bg-white rounded-full"
                            style={{
                                width: i < activeIndex ? '100%' : i === activeIndex ? '0%' : '0%',
                                ...(i === activeIndex ? {
                                    animation: `storyProgress ${STORY_DURATION}ms linear forwards`,
                                    animationPlayState: isPaused ? 'paused' : 'running',
                                } : {}),
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Inline keyframes for progress bar animation */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes storyProgress {
                    from { width: 0%; }
                    to { width: 100%; }
                }
            `}} />

            {/* Card Stack Content wrapper */}
            <div className="relative w-[88vw] mx-4 my-auto">
                {/* Active Card Body — no animation, instant switch */}
                <div
                    className="story-nav-area w-full bg-black rounded-3xl border-2 border-white p-8 shadow-2xl flex flex-col font-mono relative z-10 pointer-events-auto cursor-pointer"
                >
                    <CardContent key={CARDS[activeIndex].id} card={CARDS[activeIndex]} isActive={true} />
                </div>

                {/* Overlapping active stickers for the current slide */}
                {activeStickers.map((stConfig) => {
                    const stickerData = STICKER_CONFIG.find((s) => s.id === stConfig.id);
                    if (!stickerData) return null;

                    const mobData = {
                        ...stickerData,
                        top: stConfig.top,
                        left: stConfig.left,
                        width: stConfig.width,
                        rotate: stConfig.rotate,
                        delay: 0,
                        zIndex: stConfig.id === 'main-me' ? 5 : 20,
                    };

                    return (
                        <Sticker key={stConfig.id} data={mobData} noAnimation />
                    );
                })}
            </div>

            {/* ── Floating Recent Comment Bubble (IG Story style) ── */}
            <AnimatePresence>
                {!showComments && comments.length > 0 && (() => {
                    const latestComment = comments[comments.length - 1];
                    return (
                        <motion.div
                            className="absolute left-3 right-16 z-[200] pointer-events-none flex flex-col gap-2"
                            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 4.5rem)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                key={latestComment.id}
                                className="flex items-center gap-2.5 pointer-events-auto"
                                initial={{ opacity: 0, y: 10, x: -10 }}
                                animate={{ opacity: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Avatar circle */}
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-lg"
                                    style={{ backgroundColor: latestComment.avatarColor }}
                                >
                                    {getAvatarInitial(latestComment.name)}
                                </div>
                                {/* Chat bubble - text only */}
                                <div className="bg-neutral-800/90 backdrop-blur-md rounded-2xl px-4 py-2 max-w-[80%] shadow-lg border border-white/10">
                                    <span className="text-white text-[13px] leading-tight font-sans">{latestComment.text}</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    );
                })()}
            </AnimatePresence>

            {/* IG-style Comments Bottom Sheet */}
            <AnimatePresence>
                {showComments && (
                    <>
                        {/* Backdrop overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-[300]"
                            onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
                        />
                        {/* Bottom Sheet */}
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-[310] rounded-t-3xl flex flex-col pointer-events-auto border-t border-white/10"
                            style={{ height: '90vh', background: 'rgba(20, 20, 20, 0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Handle bar */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 rounded-full bg-white/20" />
                            </div>

                            {/* Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                                <span className="text-white font-semibold text-base">Comments</span>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setShowComments(false); }}
                                    className="w-8 h-8 flex items-center justify-center"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            </div>

                            {/* Comments List */}
                            <div className="flex-1 overflow-y-auto px-4 py-3" style={{ scrollbarWidth: 'none' }}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                        <p className="text-sm mt-3">No comments yet</p>
                                        <p className="text-xs text-neutral-600 mt-1">Be the first to comment</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div
                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                                    style={{ backgroundColor: comment.avatarColor }}
                                                >
                                                    {getAvatarInitial(comment.name)}
                                                </div>
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline gap-2">
                                                        <span className="text-white text-[13px] font-bold">{comment.name}</span>
                                                        <span className="text-neutral-500 text-[11px]">
                                                            {formatTimestamp(comment.timestamp)}
                                                        </span>
                                                    </div>
                                                    <p className="text-white text-sm leading-relaxed break-words mt-0.5">{comment.text}</p>
                                                </div>
                                                {/* Delete */}
                                                <button
                                                    className="w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-full hover:bg-white/10 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteComment(comment.id);
                                                    }}
                                                    aria-label="Delete comment"
                                                >
                                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="3 6 5 6 21 6" />
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Bottom Input inside the sheet */}
                            <div className="border-t border-white/10 px-4 py-3 flex items-center gap-3" style={{ background: 'rgba(30, 30, 30, 0.6)' }}>
                                <form
                                    className="flex-1 flex items-center gap-2"
                                    onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); handleSendComment(); }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        placeholder="Add a comment..."
                                        maxLength={500}
                                        className="flex-1 h-10 rounded-full border border-white/15 bg-white/10 px-4 text-white text-sm placeholder-neutral-400 outline-none focus:border-white/30 transition-colors"
                                        disabled={isPosting}
                                    />
                                    <button
                                        type="submit"
                                        className={`text-sm font-semibold transition-colors ${commentText.trim() ? 'text-blue-400' : 'text-blue-400/30'}`}
                                        disabled={!commentText.trim() || isPosting}
                                    >
                                        {isPosting ? '...' : 'Post'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Instagram-style Reaction Bar */}
            <div className="absolute left-3 right-3 flex items-center gap-3 z-[210] pointer-events-auto" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)' }}>
                {/* Message Input Field — opens bottom sheet */}
                <div
                    className="flex-1 h-11 rounded-full border border-neutral-600 bg-transparent px-4 flex items-center cursor-text"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(true);
                        // Focus the input after the sheet animates in
                        setTimeout(() => inputRef.current?.focus(), 400);
                    }}
                >
                    <span className="text-neutral-500 text-sm font-light select-none">Send message...</span>
                </div>



                {/* Heart Button */}
                <button
                    className="w-11 h-11 flex items-center justify-center rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsLiked(!isLiked);
                        const btn = e.currentTarget;
                        btn.style.transform = 'scale(1.4)';
                        btn.style.transition = 'transform 0.15s ease';
                        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
                    }}
                    aria-label="Like"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Share / Send Button */}
                <div className="relative">
                    <button
                        className="w-11 h-11 flex items-center justify-center rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowShareMenu(!showShareMenu);
                        }}
                        aria-label="Share"
                    >
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="22" y1="2" x2="11" y2="13" />
                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                    </button>

                    {/* Share Menu Popup */}
                    <AnimatePresence>
                        {showShareMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute bottom-14 right-0 bg-neutral-900 border border-neutral-700 rounded-2xl p-2 min-w-[180px] shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {[
                                    { label: 'Twitter / X', icon: '\ud835\udd4f', action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Check out Shem's portfolio!")}`, '_blank') },
                                    { label: 'Facebook', icon: 'f', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank') },
                                    { label: 'LinkedIn', icon: 'in', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank') },
                                    { label: 'WhatsApp', icon: '\ud83d\udcac', action: () => window.open(`https://wa.me/?text=${encodeURIComponent("Check out Shem's portfolio! " + window.location.href)}`, '_blank') },
                                    { label: 'Copy Link', icon: '\ud83d\udd17', action: () => { navigator.clipboard.writeText(window.location.href); setShowShareMenu(false); } },
                                ].map((item) => (
                                    <button
                                        key={item.label}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-white hover:bg-neutral-800 transition-colors text-left"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            item.action();
                                            if (item.label !== 'Copy Link') setShowShareMenu(false);
                                        }}
                                    >
                                        <span className="w-6 text-center text-base">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

function formatTimestamp(ts: string): string {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
