'use server';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';
const REPO_OWNER = 'TimmyhalfZombie';
const REPO_NAME = 'portfolio_2026';
const CATEGORY_ID = 'DIC_kwDORGMtx84DClSS';
const DISCUSSION_TITLE = 'Portfolio Comments';

// ── Types ──

export interface PortfolioComment {
    id: string;
    name: string;
    text: string;
    timestamp: string;
    avatarColor: string;
}

// ── Helpers ──

function getToken(): string {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN is not set');
    return token;
}

async function graphql<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(GITHUB_GRAPHQL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`GitHub API error: ${res.status} — ${errorBody}`);
    }

    const json = await res.json();
    if (json.errors) {
        throw new Error(`GitHub GraphQL error: ${JSON.stringify(json.errors)}`);
    }
    return json.data as T;
}

// Generate a consistent pastel avatar color from a name
function nameToColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 55%, 55%)`;
}

// Encode visitor name into the comment body (hidden metadata)
function encodeComment(name: string, text: string): string {
    return `<!-- visitor:${name.replace(/-->/g, '')} -->\n${text}`;
}

// Parse visitor name and text from a GitHub Discussion comment body
function parseComment(body: string): { name: string; text: string } | null {
    const match = body.match(/^<!-- visitor:(.+?) -->\n([\s\S]*)$/);
    if (!match) return null;
    return { name: match[1].trim(), text: match[2].trim() };
}

// ── Discussion Lookup ──

let cachedDiscussionId: string | null = null;

async function getDiscussionId(): Promise<string> {
    if (cachedDiscussionId) return cachedDiscussionId;

    const data = await graphql<{
        repository: {
            discussions: {
                nodes: Array<{ id: string; number: number; title: string }>;
            };
        };
    }>(`
        query($owner: String!, $name: String!, $categoryId: ID!) {
            repository(owner: $owner, name: $name) {
                discussions(first: 10, categoryId: $categoryId, orderBy: { field: CREATED_AT, direction: DESC }) {
                    nodes { id, number, title }
                }
            }
        }
    `, { owner: REPO_OWNER, name: REPO_NAME, categoryId: CATEGORY_ID });

    const match = data.repository.discussions.nodes.find(
        (d) => d.title === DISCUSSION_TITLE
    );

    if (!match) {
        throw new Error(
            `No "${DISCUSSION_TITLE}" discussion found. Create one at:\n` +
            `https://github.com/${REPO_OWNER}/${REPO_NAME}/discussions/new?category=General&title=${encodeURIComponent(DISCUSSION_TITLE)}`
        );
    }

    cachedDiscussionId = match.id;
    return match.id;
}

// ── Public API ──

export async function fetchComments(): Promise<PortfolioComment[]> {
    const discussionId = await getDiscussionId();

    const data = await graphql<{
        node: {
            comments: {
                nodes: Array<{
                    id: string;
                    body: string;
                    createdAt: string;
                }>;
            };
        };
    }>(`
        query($id: ID!) {
            node(id: $id) {
                ... on Discussion {
                    comments(last: 50) {
                        nodes {
                            id
                            body
                            createdAt
                        }
                    }
                }
            }
        }
    `, { id: discussionId });

    const comments: PortfolioComment[] = [];

    for (const node of data.node.comments.nodes) {
        const parsed = parseComment(node.body);
        if (!parsed) continue;

        comments.push({
            id: node.id,
            name: parsed.name,
            text: parsed.text,
            timestamp: node.createdAt,
            avatarColor: nameToColor(parsed.name),
        });
    }

    return comments;
}

export async function createComment(name: string, text: string): Promise<PortfolioComment> {
    const discussionId = await getDiscussionId();
    const body = encodeComment(name, text);

    const data = await graphql<{
        addDiscussionComment: {
            comment: {
                id: string;
                body: string;
                createdAt: string;
            };
        };
    }>(`
        mutation($discussionId: ID!, $body: String!) {
            addDiscussionComment(input: {
                discussionId: $discussionId
                body: $body
            }) {
                comment {
                    id
                    body
                    createdAt
                }
            }
        }
    `, { discussionId, body });

    const comment = data.addDiscussionComment.comment;
    return {
        id: comment.id,
        name,
        text,
        timestamp: comment.createdAt,
        avatarColor: nameToColor(name),
    };
}

export async function deleteComment(commentId: string): Promise<boolean> {
    try {
        await graphql(`
            mutation($id: ID!) {
                deleteDiscussionComment(input: { id: $id }) {
                    comment { id }
                }
            }
        `, { id: commentId });
        return true;
    } catch {
        return false;
    }
}
