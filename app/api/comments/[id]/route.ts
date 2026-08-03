import { NextResponse } from 'next/server';
import { deleteComment } from '@/lib/github-discussions';

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ error: 'Comment ID is required' }, { status: 400 });
        }

        const success = await deleteComment(id);
        if (!success) {
            return NextResponse.json({ error: 'Failed to delete comment' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Failed to delete comment:', error);
        return NextResponse.json(
            { error: 'Failed to delete comment' },
            { status: 500 }
        );
    }
}
