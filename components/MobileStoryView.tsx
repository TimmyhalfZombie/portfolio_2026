'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { CARDS, CardData, CardContent } from './StickyCardStack';
import { Sticker } from './stickers';
import { STICKER_CONFIG } from './stickers/StickerConfig';
import { useComments, Comment } from '@/hooks/useComments';
import { getAssignedAnonymousName, getAvatarInitial } from '@/lib/anonymous-names';
import { useRevealed } from './RevealContext';
import { toast } from 'sonner';

interface MobileStickerConfig {
    id: string;
    top: string;
    left: string;
    width: string;
    rotate: number;
}

// Maps stickers to their thematic slides for mobile story view (with enlarged sizes).
// top/left are % of the card, which is the same height on every slide; sizes are rem, so the
// whole story scales together on every screen (see the root font-size in globals.css)
const MOBILE_STORY_STICKERS: Record<number, MobileStickerConfig[]> = {
    0: [ // Slide 1: Welcome
        { id: 'main-me', top: '-37.2%', left: '27%', width: '13.5rem', rotate: 0 },
        { id: 'cat', top: '-19%', left: '2%', width: '6.5rem', rotate: 0 },
        { id: 'me', top: '96%', left: '-4%', width: '10.5rem', rotate: -12 },
        { id: 'flag', top: '-38%', left: '69%', width: '7.8rem', rotate: 10 },
        { id: 'resume', top: '89.7%', left: '72%', width: '5.2rem', rotate: -8 },
        { id: 'palawan', top: '100.5%', left: '30%', width: '9.8rem', rotate: 6 }
    ],
    1: [ // Slide 2: Skills & Featured Projects (VIPScale, Kajabi, Squarespace, Wix, GHL, Assumption, PatchUp, Hive, LTBL)
        { id: 'vipscale', top: '117.7%', left: '48%', width: '5.6rem', rotate: 5 },
        { id: 'kajabi', top: '-14%', left: '5%', width: '4.5rem', rotate: -8 },
        { id: 'squarespace', top: '118.7%', left: '2%', width: '4.8rem', rotate: -6 },
        { id: 'wix', top: '-49.5%', left: '13%', width: '5.8rem', rotate: -10 },
        { id: 'ghl', top: '-32.7%', left: '62%', width: '6.8rem', rotate: 10 },
        { id: 'assumption', top: '-46.7%', left: '50%', width: '5.2rem', rotate: 8 },
        { id: 'patchup', top: '92.5%', left: '66%', width: '5.0rem', rotate: 6 },
        { id: 'hive', top: '96.3%', left: '20%', width: '4.5rem', rotate: -8 },
        { id: 'ltbl', top: '-23.4%', left: '32%', width: '6.8rem', rotate: -5 },
        { id: 'code', top: '-48%', left: '80%', width: '4.4rem', rotate: 10 }
    ],
    2: [ // Slide 3: Background & Interests
        { id: 'coursera', top: '-15.7%', left: '8%', width: '4.5rem', rotate: -5 },
        { id: 'crayfish', top: '-31.4%', left: '58%', width: '7.5rem', rotate: -8 },
        { id: 'fishing', top: '98.3%', left: '50%', width: '5.6rem', rotate: -15 },
        { id: 'coconut', top: '101.7%', left: '12%', width: '5.2rem', rotate: -10 }
    ],
    3: [ // Slide 4: Projects & Crafts
        { id: 'fazzio', top: '103%', left: '60%', width: '9.0rem', rotate: 0 },
        { id: 'tool', top: '-23%', left: '7%', width: '7.0rem', rotate: -5 },
        { id: 'github', top: '-15%', left: '70%', width: '5.0rem', rotate: 6 },
        { id: 'punk', top: '93%', left: '2%', width: '6.5rem', rotate: 1 }
    ],
    4: [ // Slide 5: Connect & Contact — every way to reach him, big enough to tap, résumé included
        { id: 'email', top: '-26%', left: '3%', width: '8rem', rotate: 8 },
        { id: 'telegram', top: '-20%', left: '62%', width: '5.4rem', rotate: 12 },
        { id: 'linkedin', top: '86%', left: '4%', width: '6rem', rotate: -12 },
        { id: 'resume', top: '83%', left: '38%', width: '7rem', rotate: -6 },
        { id: 'fb', top: '88%', left: '72%', width: '6rem', rotate: 10 }
    ]
};

/** The story is a phone-shaped column: the full width on phones, centred on tablets (100vw at rem = 3.1vw) */
const STORY_WIDTH = 'min(100%, 32.26rem)';
/** Story chrome (rem): the progress bars and header above the content, the reaction bar below it */
const TOP_INSET = 5.8;
const BOTTOM_INSET = 5.2;
/** Farthest any slide's stickers visibly reach past the card's top and bottom edges (rem). With the
 * insets and the card (~26.4rem) this is the story's full height: the 61rem cap in globals.css */
const REACH_ABOVE = 12.5;
const REACH_BELOW = 10.4;

const LIKED_KEY = 'story-liked';

const STORY_DURATION = 10000; // 10 seconds per card

export const MobileStoryView = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [progressKey, setProgressKey] = useState(0); // Forces CSS animation restart
    // Only rendered after mount, so localStorage is safe to read here
    const [isLiked, setIsLiked] = useState(() => {
        try { return localStorage.getItem(LIKED_KEY) === '1'; } catch { return false; }
    });
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [isInputActive, setIsInputActive] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const revealed = useRevealed();
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Shared comments via GitHub Discussions API
    const { comments, isLoading, postComment, deleteComment } = useComments();

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

    // Start/restart timer whenever activeIndex changes (and not before the opening screen hands off)
    useEffect(() => {
        if (!revealed) return;
        elapsedRef.current = 0;
        setProgressKey((k) => k + 1); // Restart CSS animation
        startTimer(STORY_DURATION);
        return () => clearTimer();
    }, [activeIndex, revealed, startTimer, clearTimer]);

    // Number of stickers with an open popup/modal — keeps the story from advancing mid-read
    const [openStickerCount, setOpenStickerCount] = useState(0);
    const handleStickerOpenChange = useCallback((_id: string, open: boolean) => {
        setOpenStickerCount((c) => c + (open ? 1 : -1));
    }, []);

    // Pause story timer when comments bottom sheet or a sticker popup/modal is open
    const isHeld = showComments || openStickerCount > 0;
    useEffect(() => {
        if (isHeld) {
            if (timerRef.current) elapsedRef.current += Date.now() - startTimeRef.current;
            clearTimer();
            setIsPaused(true);
        } else if (!isLongPressRef.current && revealed) {
            setIsPaused(false);
            const remaining = Math.max(200, STORY_DURATION - elapsedRef.current);
            startTimer(remaining);
        }
    }, [isHeld, revealed, clearTimer, startTimer]);

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

    const activeStickers = MOBILE_STORY_STICKERS[activeIndex] || [];

    const mainMe = STICKER_CONFIG.find((s) => s.id === 'main-me');

    return (
        <div
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`story-nav-area fixed inset-0 w-full bg-transparent select-none overflow-x-hidden z-10 ${revealed ? 'reveal-fade' : ''}`}
            style={{ touchAction: 'none', height: '100dvh' }}
        >
            {/* The card sits centred between the chrome, leaving room for its stickers on both sides */}
            <div
                className="relative h-full mx-auto flex flex-col items-center"
                style={{
                    width: STORY_WIDTH,
                    paddingTop: `calc(env(safe-area-inset-top, 0px) + ${TOP_INSET + REACH_ABOVE}rem)`,
                    paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${BOTTOM_INSET + REACH_BELOW}rem)`,
                }}
            >
            {/* Top Progress Bars (Instagram style) */}
            <div className="absolute left-4 right-4 flex gap-1.5 z-[210] pointer-events-none" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1.25rem)' }}>
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
                                    animationPlayState: isPaused || !revealed ? 'paused' : 'running',
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

            {/* Whose story this is, like an Instagram story header */}
            <div
                className="absolute left-4 right-4 z-[210] flex items-center gap-[0.7rem] pointer-events-none font-sans"
                style={{ top: 'calc(env(safe-area-inset-top, 0px) + 2.3rem)' }}
            >
                {mainMe && (
                    <div className="relative size-[2.6rem] shrink-0 overflow-hidden rounded-full border border-white/80 bg-neutral-800">
                        {/* Same size as the preloaded sticker, so it's already cached; zoomed in on the face */}
                        <Image
                            src={mainMe.src}
                            alt=""
                            width={mainMe.widthPx}
                            height={mainMe.widthPx}
                            className="absolute inset-0 size-full object-cover"
                            style={{ transform: 'scale(2.2)', transformOrigin: '46% 15%' }}
                        />
                    </div>
                )}
                <span className="text-white font-semibold text-[1.15rem] leading-none">rei</span>
                <span className="text-neutral-400 text-[1rem] leading-none truncate">Full-stack developer</span>
            </div>

            {/* Card Stack Content wrapper */}
            <div className="relative w-[88%] my-auto">
                {/* Active Card Body — no animation, instant switch */}
                <div
                    ref={cardRef}
                    className="story-nav-area w-full bg-black rounded-3xl border-2 border-white p-8 shadow-2xl grid font-mono relative z-10 pointer-events-auto cursor-pointer"
                >
                    {/* Every slide's text shares one grid cell, so the card always has the tallest slide's
                        height and nothing around it moves between slides */}
                    {CARDS.map((card, i) => i === activeIndex ? (
                        <div key={`active-${card.id}`} className="col-start-1 row-start-1">
                            <CardContent card={card} isActive story />
                        </div>
                    ) : (
                        <div key={card.id} aria-hidden="true" className="col-start-1 row-start-1 invisible">
                            <CardContent card={card} isActive={false} story />
                        </div>
                    ))}
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
                        <Sticker key={stConfig.id} data={mobData} noAnimation cardAreaRef={cardRef} onOpenChange={handleStickerOpenChange} />
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
                            style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 5.2rem)' }}
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
                                        // 16px: anything smaller makes iOS zoom the page in when the field is focused
                                        className="flex-1 h-10 rounded-full border border-white/15 bg-white/10 px-4 text-white text-[16px] placeholder-neutral-400 outline-none focus:border-white/30 transition-colors"
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
                {/* Comment Field — opens the comments sheet */}
                <div
                    className="flex-1 h-[3.4rem] rounded-full border border-neutral-600 bg-transparent px-[1.2rem] flex items-center cursor-text"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowComments(true);
                        // Focus the input after the sheet animates in
                        setTimeout(() => inputRef.current?.focus(), 400);
                    }}
                >
                    <span className="text-neutral-500 text-[1.15rem] font-light select-none">Add a comment...</span>
                </div>

                {/* Heart Button — remembered on this device */}
                <button
                    className="size-[3.4rem] flex items-center justify-center rounded-full"
                    onClick={(e) => {
                        e.stopPropagation();
                        const liked = !isLiked;
                        setIsLiked(liked);
                        try {
                            if (liked) localStorage.setItem(LIKED_KEY, '1');
                            else localStorage.removeItem(LIKED_KEY);
                        } catch { }
                        const btn = e.currentTarget;
                        btn.style.transform = 'scale(1.4)';
                        btn.style.transition = 'transform 0.15s ease';
                        setTimeout(() => { btn.style.transform = 'scale(1)'; }, 150);
                    }}
                    aria-label="Like"
                    aria-pressed={isLiked}
                >
                    <svg className="size-[1.9rem]" viewBox="0 0 24 24" fill={isLiked ? '#ef4444' : 'none'} stroke={isLiked ? '#ef4444' : 'white'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                </button>

                {/* Share / Send Button */}
                <div className="relative">
                    <button
                        className="size-[3.4rem] flex items-center justify-center rounded-full"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowShareMenu(!showShareMenu);
                        }}
                        aria-label="Share"
                    >
                        <svg className="size-[1.75rem]" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
                                    { label: 'Twitter / X', icon: '\ud835\udd4f', action: () => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Check out Rei's portfolio!")}`, '_blank') },
                                    { label: 'Facebook', icon: 'f', action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank') },
                                    { label: 'LinkedIn', icon: 'in', action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank') },
                                    { label: 'WhatsApp', icon: '\ud83d\udcac', action: () => window.open(`https://wa.me/?text=${encodeURIComponent("Check out Rei's portfolio! " + window.location.href)}`, '_blank') },
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
