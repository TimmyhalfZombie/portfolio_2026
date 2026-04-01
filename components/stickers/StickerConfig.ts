export interface StickerPopup {
    /** Text before the link. If an array, a random string is picked on each click. */
    text: string | string[];
    /** Linked/underlined text (Optional) */
    linkText?: string;
    /** URL the link navigates to (Optional) */
    linkUrl?: string;
    /** Optional max width in pixels for the popup (defaults to auto-fit) */
    maxWidth?: number;
    /** Optional custom duration in ms before popup disappears */
    duration?: number;
    /** Optional Y offset in pixels to nudge the popup down (default 0) */
    offsetY?: number;
    /** Optional project title for card-style popup */
    title?: string;
    /** Optional tech stack items, toggled by "stack +" button */
    stack?: string[];
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
    tapEffect?: 'flyAround' | 'spotify' | 'bounce' | 'contact' | 'certificates';
}

export const STICKER_CONFIG: StickerData[] = ([
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
        popup: {
            text: [
                "Need to cut down on manual tasks? He can automate your business workflows.",
                "He builds fast, SEO-optimized web experiences.",
                "From complex logic to full APIs, he develops robust backend solutions.",
                "Want to reach mobile users? He can ship cross-platform mobile apps quickly.",
                "He treats every codebase like it's his own business."
            ],
            duration: 6000,
            maxWidth: 320,
            offsetY: 25,
        }
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
        popup: {
            title: 'Assumption',
            text: 'A school portal featuring a library system and institutional info pages.',
            linkText: "Visit Site",
            linkUrl: "https://assumptioniloilo.vercel.app/",
            maxWidth: 320,
            stack: ['React', 'TypeScript', 'Firebase', 'Custom REST API'],
        }
    },

    // ── BOTTOM CENTER ──
    {
        id: 'punk',
        src: '/stickers/punk.png',
        alt: 'Punk Sticker',
        width: 100,
        top: '72%',
        left: '65%',
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
        popup: {
            title: 'Patch Up',
            text: 'A two-app platform connecting stranded drivers with nearby tire repair technicians.',
            linkText: "Visit Site",
            linkUrl: "https://patchup-ph.vercel.app/",
            maxWidth: 320,
            stack: ['React Native', 'Expo', 'Websockets / REST', 'MongoDB', 'IoT pipeline'],
        }
    },
    {
        id: 'hive',
        src: '/stickers/hive.png',
        alt: 'Hive',
        width: 65,
        top: '79%',
        left: '32%',
        rotate: 8,
        delay: 0.4,
        zIndex: 12,
        popup: {
            title: 'Hive',
            text: 'Full-stack trading analysis app powered by n8n automation for backend workflow processing.',
            linkText: "Visit Site",
            linkUrl: "https://hivetrading.vercel.app/",
            maxWidth: 320,
            stack: ['Next.js', 'Supabase', 'Tailwind'],
        }
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
        tapEffect: 'certificates',
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
        tapEffect: 'contact',
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
        popup: {
            title: 'VIPScale',
            text: 'A productivity dashboard consolidating task management, time tracking, AI prompt generation, and video/copywriting tools.',
            linkText: "Visit Site",
            linkUrl: "https://tools.vipscaleph.com/",
            maxWidth: 360,
            stack: ['Next.js & React 19', 'TypeScript & Supabase', 'Tailwind CSS', 'Shadcn / Radix UI', 'Zod & React Hook Form', 'Recharts', 'FullCalendar & UploadThing'],
        }
    },
    {
        id: 'tool',
        src: '/stickers/tool.png',
        alt: 'Dev Tools',
        width: 130,
        top: '82%',
        left: '42%',
        rotate: -5,
        delay: 0.28,
        zIndex: 11,
        popup: {
            text: "Hands-on by habit. Full-stack by choice.",
            maxWidth: 340,
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
        popup: {
            text: [
                "I'm from Palawan! Home to the Subterranean River, a New7Wonder of Nature.",
                "I'm from Palawan! Known as the Philippines' Last Ecological Frontier.",
                "I'm from Palawan! Our province alone has roughly 1,780 beautiful islands.",
                "I'm from Palawan! Tubbataha Reefs here is a stunning UNESCO diver's paradise.",
                "I'm from Palawan! Free-roaming giraffes live here at Calauit Safari.",
                "I'm from Palawan! El Nido's marble cliffs formed 250 million years ago.",
                "I'm from Palawan! We have the crystal-clear twin lagoons of Coron.",
                "I'm from Palawan! Fireflies light up our Iwahig River mangroves at night.",
                "I'm from Palawan! We are home to the vulnerable dugong, or sea cow.",
                "I'm from Palawan! The Tabon Caves here are called the Philippines' Cradle of Civilization.",
                "I'm from Palawan! Our secluded beaches are world-renowned for their pristine white sand."
            ],
            maxWidth: 320,
            duration: 6000,
        }
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
        top: '80%',
        left: '56%',
        rotate: -5,
        delay: 0.36,
        zIndex: 14,
        tapEffect: 'bounce',
    },
] as StickerData[]).map((sticker, index) => ({
    ...sticker,
    delay: index * 0.12 // Balanced sequential delay override
}));
