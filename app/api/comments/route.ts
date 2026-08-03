import { NextResponse } from 'next/server';
import { fetchComments, createComment } from '@/lib/github-discussions';

// Rate limiting: simple in-memory tracker (per serverless instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 }); // 1 minute window
        return false;
    }

    entry.count++;
    if (entry.count > 5) return true; // Max 5 posts per minute
    return false;
}

export async function GET() {
    try {
        const comments = await fetchComments();
        return NextResponse.json({ comments });
    } catch (error: any) {
        console.error('Failed to fetch comments:', error);
        return NextResponse.json(
            { error: 'Failed to load comments' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // Basic rate limiting by IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        if (isRateLimited(ip)) {
            return NextResponse.json(
                { error: 'Too many comments. Please wait a moment.' },
                { status: 429 }
            );
        }

        const body = await request.json();
        const { name: rawName, text } = body;
        const name = (typeof rawName === 'string' && rawName.trim()) ? rawName.trim() : 'Anonymous';
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return NextResponse.json({ error: 'Comment text is required' }, { status: 400 });
        }
        if (name.trim().length > 50) {
            return NextResponse.json({ error: 'Name too long (max 50 chars)' }, { status: 400 });
        }
        if (text.trim().length > 500) {
            return NextResponse.json({ error: 'Comment too long (max 500 chars)' }, { status: 400 });
        }

        const comment = await createComment(name.trim(), text.trim());
        return NextResponse.json({ comment }, { status: 201 });
    } catch (error: any) {
        console.error('Failed to create comment:', error);
        return NextResponse.json(
            { error: 'Failed to post comment' },
            { status: 500 }
        );
    }
}
