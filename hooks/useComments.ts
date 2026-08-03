'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface Comment {
    id: string;
    name: string;
    text: string;
    timestamp: string;
    avatarColor: string;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export function useComments() {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchComments = useCallback(async () => {
        try {
            const res = await fetch('/api/comments');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setComments(data.comments || []);
        } catch (err) {
            console.error('Failed to fetch comments:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial fetch + polling
    useEffect(() => {
        fetchComments();
        pollRef.current = setInterval(fetchComments, POLL_INTERVAL);
        return () => {
            if (pollRef.current) clearInterval(pollRef.current);
        };
    }, [fetchComments]);

    const postComment = useCallback(async (name: string, text: string): Promise<Comment | null> => {
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, text }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to post');
            }

            const data = await res.json();
            const newComment = data.comment as Comment;

            // Optimistic update
            setComments((prev) => [...prev, newComment]);
            return newComment;
        } catch (err: any) {
            console.error('Failed to post comment:', err);
            throw err;
        }
    }, []);

    const deleteComment = useCallback(async (commentId: string): Promise<boolean> => {
        // Optimistic removal
        setComments((prev) => prev.filter((c) => c.id !== commentId));

        try {
            const res = await fetch(`/api/comments/${encodeURIComponent(commentId)}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                // Revert on failure — re-fetch to get accurate state
                await fetchComments();
                return false;
            }

            return true;
        } catch (err) {
            console.error('Failed to delete comment:', err);
            await fetchComments();
            return false;
        }
    }, [fetchComments]);

    return {
        comments,
        isLoading,
        postComment,
        deleteComment,
        refetch: fetchComments,
    };
}
