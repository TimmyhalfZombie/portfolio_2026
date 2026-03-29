export interface StickerData {
    /** Unique identifier */
    id: string;
    /** Path relative to public/ */
    src: string;
    /** Accessibility alt text */
    alt: string;
    /** Display width in pixels */
    width: number;
    /** CSS top position (use %) */
    top: string;
    /** CSS left position (use % or calc()) */
    left: string;
    /** Rotation in degrees */
    rotate: number;
    /** Entry animation delay in seconds (stagger 0.1-0.4s) */
    delay: number;
    /** Z-index for layering within sticker layer */
    zIndex: number;
    /** Next.js Image priority loading (only for main-me) */
    priority?: boolean;
    /** If true, render behind the card stack (lower z-layer) */
    behindCards?: boolean;
}

export const STICKER_CONFIG: StickerData[] = [
    // ── HERO — Center Top ──
    {
        id: 'main-me',
        src: '/stickers/main-me.png',
        alt: 'Shem — Main Portrait',
        width: 300,
        top: '0%',
        left: 'calc(53% - 140px)',   // centered (50% minus half of width)
        rotate: 0,
        delay: 0,
        zIndex: 5,
        priority: true,
        behindCards: true,
    },

    // ── TOP-LEFT ZONE ──
    {
        id: 'me',
        src: '/stickers/me.png',
        alt: 'Shem — Secondary',
        width: 220,
        top: '58%',
        left: '1%',
        rotate: -8,
        delay: 0.1,
        zIndex: 12,
    },
    {
        id: 'fb',
        src: '/stickers/fb.png',
        alt: 'Facebook',
        width: 55,
        top: '14%',
        left: '6%',
        rotate: 12,
        delay: 0.15,
        zIndex: 14,
    },

    // ── LEFT SIDE ──
    {
        id: 'cat',
        src: '/stickers/cat.png',
        alt: 'Cat Sticker',
        width: 140,
        top: '14%',
        left: '35%',
        rotate: 0,
        delay: 0.2,
        zIndex: 40,
    },
    {
        id: 'linkedin',
        src: '/stickers/linkedin.png',
        alt: 'LinkedIn',
        width: 65,
        top: '48%',
        left: '27%',
        rotate: -15,
        delay: 0.18,
        zIndex: 16,
    },

    // ── BOTTOM-LEFT ──
    {
        id: 'fazzio',
        src: '/stickers/fazzio.png',
        alt: 'Fazzio Project',
        width: 120,
        top: '6%',
        left: '86%',
        rotate: 0,
        delay: 0.25,
        zIndex: 11,
    },
    {
        id: 'assumption',
        src: '/stickers/assumption.png',
        alt: 'Assumption Iloilo',
        width: 110,
        top: '30%',
        left: '13%',
        rotate: -8,
        delay: 0.3,
        zIndex: 10,
    },

    // ── BOTTOM CENTER ──
    {
        id: 'punk',
        src: '/stickers/punk.png',
        alt: 'Punk Sticker',
        width: 100,
        top: '72%',
        left: '82%',
        rotate: 3,
        delay: 0.35,
        zIndex: 14,
    },
    {
        id: 'patchup',
        src: '/stickers/patchup.png',
        alt: 'Patch Up Project',
        width: 80,
        top: '53%',
        left: '75%',
        rotate: -5,
        delay: 0.38,
        zIndex: 13,
    },
    {
        id: 'hive',
        src: '/stickers/hive.png',
        alt: 'Hive',
        width: 65,
        top: '77%',
        left: '34%',
        rotate: 8,
        delay: 0.4,
        zIndex: 12,
    },

    // ── TOP-RIGHT ZONE ──
    {
        id: 'coursera',
        src: '/stickers/coursera.png',
        alt: 'Coursera Certificate',
        width: 80,
        top: '8%',
        left: '65%',
        rotate: -5,
        delay: 0.12,
        zIndex: 14,
    },
    {
        id: 'flag',
        src: '/stickers/flag.png',
        alt: 'Philippine Flag',
        width: 120,
        top: '27%',
        left: '82%',
        rotate: 10,
        delay: 0.16,
        zIndex: 12,
    },

    // ── RIGHT SIDE ──
    {
        id: 'email',
        src: '/stickers/email.png',
        alt: 'Email Contact',
        width: 100,
        top: '37%',
        left: '67%',
        rotate: 8,
        delay: 0.22,
        zIndex: 14,
    },
    {
        id: 'vipscale',
        src: '/stickers/vipscale.png',
        alt: 'VIPScale Project',
        width: 90,
        top: '8%',
        left: '20%',
        rotate: -10,
        delay: 0.14,
        zIndex: 12,
    },
    {
        id: 'tool',
        src: '/stickers/tool.png',
        alt: 'Dev Tools',
        width: 130,
        top: '78%',
        left: '57%',
        rotate: -5,
        delay: 0.28,
        zIndex: 11,
    },
    {
        id: 'palawan',
        src: '/stickers/palawan.png',
        alt: 'Palawan Travel',
        width: 135,
        top: '80%',
        left: '16%',
        rotate: 6,
        delay: 0.32,
        zIndex: 13,
    },
];
