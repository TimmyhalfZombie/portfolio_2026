'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useComments, Comment } from '@/hooks/useComments';
import { getAssignedAnonymousName, getAvatarInitial } from '@/lib/anonymous-names';
import { toast } from 'sonner';

interface CommentsModalProps {
    onClose: () => void;
}

export const CommentsModal: React.FC<CommentsModalProps> = ({ onClose }) => {
    const { comments, isLoading, postComment, deleteComment } = useComments();
    const [text, setText] = useState('');
    const [isPosting, setIsPosting] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom on new comments
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments.length]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const assignedName = getAssignedAnonymousName();
            await postComment(assignedName, text.trim());
            setText('');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to post comment');
        } finally {
            setIsPosting(false);
        }
    };

    const handleDelete = async (id: string) => {
        const ok = await deleteComment(id);
        if (!ok) toast.error('Failed to delete comment');
    };

    const getInitial = (n: string) => getAvatarInitial(n);

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md pointer-events-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="relative w-full max-w-[30rem] bg-black border border-white/70 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                    style={{ maxHeight: '80vh' }}
                    initial={{ scale: 0.95, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 10 }}
                    transition={{ type: 'spring', duration: 0.4, bounce: 0.1 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* ── Header ── */}
                    <div className="px-6 pt-6 pb-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h2 className="font-mono font-bold text-[1.375rem] text-white tracking-tight">
                                    Comments
                                </h2>
                                <p className="font-mono text-[0.875rem] text-neutral-400 mt-1">
                                    Leave a message for everyone to see.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-neutral-400 hover:text-white transition-colors mt-0.5"
                                aria-label="Close"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* ── Divider ── */}
                    <div className="border-t border-white/10" />

                    {/* ── Comments List ── */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto px-6 py-4 min-h-[200px]"
                        style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 transparent' }}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center py-16">
                                <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-neutral-400">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                <p className="text-sm mt-3 font-mono">No comments yet</p>
                                <p className="text-xs text-neutral-600 mt-1 font-mono">Be the first to leave a message</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                {comments.map((comment) => (
                                    <CommentBubble
                                        key={comment.id}
                                        comment={comment}
                                        onDelete={handleDelete}
                                        getInitial={getInitial}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* ── Divider ── */}
                    <div className="border-t border-white/10" />

                    {/* ── Input Form ── */}
                    <form onSubmit={handleSubmit} className="px-6 py-4 flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Add a comment..."
                            maxLength={500}
                            className="flex-1 h-10 bg-white/[0.04] border border-white/10 rounded-xl px-4 text-white font-mono text-[0.8125rem] placeholder:text-neutral-500 focus:outline-none focus:border-white/30 transition-colors"
                            disabled={isPosting}
                        />
                        <button
                            type="submit"
                            disabled={!text.trim() || isPosting}
                            className="h-10 px-5 bg-white text-black font-mono font-bold text-[0.8125rem] rounded-xl hover:bg-neutral-200 active:scale-[0.98] transition-all disabled:opacity-30 disabled:active:scale-100"
                        >
                            {isPosting ? '...' : 'Post'}
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

// ── Individual Comment Bubble ──

const CommentBubble = ({
    comment,
    onDelete,
    getInitial,
}: {
    comment: Comment;
    onDelete: (id: string) => void;
    getInitial: (name: string) => string;
}) => {
    const [showDelete, setShowDelete] = useState(false);

    return (
        <div
            className="flex items-start gap-3 group"
            onMouseEnter={() => setShowDelete(true)}
            onMouseLeave={() => setShowDelete(false)}
        >
            {/* Avatar */}
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: comment.avatarColor }}
            >
                {getInitial(comment.name)}
            </div>

            {/* Bubble */}
            <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                    <span className="font-mono font-bold text-[0.8125rem] text-white">{comment.name}</span>
                    <span className="font-mono text-[0.6875rem] text-neutral-500">
                        {formatTimestamp(comment.timestamp)}
                    </span>
                </div>
                <p className="font-mono text-[0.875rem] text-neutral-200 mt-0.5 leading-relaxed break-words">
                    {comment.text}
                </p>
            </div>

            {/* Delete button (hover) */}
            <button
                onClick={() => onDelete(comment.id)}
                className={`w-7 h-7 flex items-center justify-center flex-shrink-0 rounded-full hover:bg-white/10 transition-all ${showDelete ? 'opacity-100' : 'opacity-0'}`}
                aria-label="Delete comment"
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </button>
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
