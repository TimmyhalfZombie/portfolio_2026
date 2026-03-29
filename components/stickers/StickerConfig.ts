export interface StickerPopup {
    /** Text before the link */
    text: string;
    /** Linked/underlined text (Optional) */
    linkText?: string;
    /** URL the link navigates to (Optional) */
    linkUrl?: string;
}

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
    /** Optional popup tooltip shown on tap */
    popup?: StickerPopup;
    /** Optional tap animation effect */
    tapEffect?: 'flyAround' | 'spotify';
}

export const STICKER_CONFIG: StickerData[] = [
    // ── HERO — Center Top ──
    {
        id: 'main-me',
        src: '/stickers/main-me.png',
        alt: 'Shem — Main Portrait',
        width: 310,
        top: '0%',
        left: 'calc(52% - 140px)',   // centered (50% minus half of width)
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
        popup: {
            text: 'Contact me on',
            linkText: 'Facebook',
            linkUrl: 'https://www.facebook.com/sndieia',
        },
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
        top: '58%',
        left: '29%',
        rotate: -15,
        delay: 0.18,
        zIndex: 16,
        popup: {
            text: 'Find me on',
            linkText: 'LinkedIn',
            linkUrl: 'https://www.linkedin.com/in/shemuel-rei-lagrosa-141304322/',
        },
    },

    // ── BOTTOM-LEFT ──
    {
        id: 'fazzio',
        src: '/stickers/fazzio.png',
        alt: 'Fazzio Project',
        width: 150,
        top: '14%',
        left: '72%',
        rotate: 0,
        delay: 0.25,
        zIndex: 11,
        tapEffect: 'flyAround',
    },
    {
        id: 'assumption',
        src: '/stickers/assumption.png',
        alt: 'Assumption Iloilo',
        width: 110,
        top: '53%',
        left: '17%',
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
        top: '77%',
        left: '62%',
        rotate: 3,
        delay: 0.35,
        zIndex: 14,
        tapEffect: 'spotify',
    },
    {
        id: 'patchup',
        src: '/stickers/patchup.png',
        alt: 'Patch Up Project',
        width: 80,
        top: '8%',
        left: '65%',
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
        width: 50,
        top: '58%',
        left: '67%',
        rotate: -5,
        delay: 0.12,
        zIndex: 14,
    },
    {
        id: 'flag',
        src: '/stickers/flag.png',
        alt: 'Philippine Flag',
        width: 170,
        top: '3%',
        left: '85%',
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
        left: '63.7%',
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
        top: '82%',
        left: '47%',
        rotate: -5,
        delay: 0.28,
        zIndex: 11,
        popup: {
            text: "I'm a handyman. I like to build stuff. Both IRL and now with vibe coding."
        }
    },
    {
        id: 'palawan',
        src: '/stickers/palawan.png',
        alt: 'Palawan Travel',
        width: 135,
        top: '75%',
        left: '16%',
        rotate: 6,
        delay: 0.32,
        zIndex: 13,
    },

    {
        id: 'telegram',
        src: '/stickers/telegram.png',
        alt: 'Telegram',
        width: 60,
        top: '10%',
        left: '32%',
        rotate: 12,
        delay: 0.25,
        zIndex: 15,
        popup: {
            text: 'Message me on',
            linkText: 'Telegram',
            linkUrl: 'https://telegram.org',
        },
    },
    {
        id: 'fishing',
        src: '/stickers/fishing.png',
        alt: 'Fishing',
        width: 90,
        top: '45%',
        left: '90%',
        rotate: -5,
        delay: 0.36,
        zIndex: 14,
    },
];
