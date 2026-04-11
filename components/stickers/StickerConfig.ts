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
    /** Optional X offset in pixels to nudge the popup left/right (default 0) */
    offsetX?: number;
    /** Optional Y offset in pixels to nudge the popup down (default 0) */
    offsetY?: number;
    /** Optional project title for card-style popup */
    title?: string;
    /** Optional tech stack items, toggled by "stack +" button */
    stack?: string[];
    /** If true, the popup will ALWAYS render above the sticker, ignoring upper-screen collision logic */
    forceTop?: boolean;
    /** If true, the popup will NEVER automatically hide. */
    noAutoHide?: boolean;
}

export interface StickerData {
    /** Unique identifier */
    id: string;
    /** Path relative to public/ */
    src: string;
    /** Accessibility alt text */
    alt: string;
    /** Responsive CSS width using clamp() — used as the container's CSS width */
    width: string;
    /** Original width in pixels — used as intrinsic size hint for Next.js Image */
    widthPx: number;
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
    tapEffect?: 'flyAround' | 'spotify' | 'bounce' | 'contact' | 'certificates' | 'shake' | 'rotate3d';
}

export const STICKER_CONFIG: StickerData[] = ([
    // ── HERO — Center Top ──
    {
        id: 'main-me',
        src: '/stickers/main-me.png',
        alt: 'Shem — Main Portrait',
        // 320px desktop → min ~144px, scales with 22vw
        width: 'clamp(9rem, 22vw, 20rem)',
        widthPx: 320,
        top: '0%',
        left: 'clamp(19%, 43vw, 50%)',
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
        // 220px desktop → min ~99px, scales with 15vw
        width: 'clamp(6.2rem, 15vw, 13.75rem)',
        widthPx: 220,
        top: '58%',
        left: 'clamp(0.5%, 1vw, 1%)',
        rotate: -8,
        delay: 0.1,
        zIndex: 12,
    },
    {
        id: 'fb',
        src: '/stickers/fb.png',
        alt: 'Facebook',
        // 55px desktop → min ~25px, scales with 3.8vw
        width: 'clamp(1.55rem, 3.8vw, 3.44rem)',
        widthPx: 55,
        top: '42%',
        left: 'clamp(1%, 3vw, 3%)',
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
        // 140px desktop → min ~63px, scales with 9.7vw
        width: 'clamp(3.9rem, 9.7vw, 8.75rem)',
        widthPx: 140,
        top: '14%',
        left: 'clamp(18%, 35vw, 35%)',
        rotate: 0,
        delay: 0.2,
        zIndex: 40,
        popup: {
            text: [
                "Got repetitive tasks? He can probably automate those.",
                "He can take a design and turn it into a real working site.",
                "He can wire up APIs and handle the backend logic.",
                "He can build mobile apps that work on both iOS and Android.",
                "He learns fast and gets better with every project.",
            ],
            duration: 6000,
            maxWidth: 320,
            offsetX: -80,
            offsetY: 25,
            forceTop: true,
        }
    },
    {
        id: 'linkedin',
        src: '/stickers/linkedin.png',
        alt: 'LinkedIn',
        // 65px desktop → min ~29px, scales with 4.5vw
        width: 'clamp(1.8rem, 4.5vw, 4.06rem)',
        widthPx: 65,
        top: '58%',
        left: 'clamp(14%, 29vw, 29%)',
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
        // 150px desktop → min ~68px, scales with 10.4vw
        width: 'clamp(4.2rem, 10.4vw, 9.38rem)',
        widthPx: 150,
        top: '14%',
        left: 'clamp(50%, 72vw, 72%)',
        rotate: 0,
        delay: 0.25,
        zIndex: 11,
        tapEffect: 'flyAround',
    },
    {
        id: 'assumption',
        src: '/stickers/assumption.png',
        alt: 'Assumption Iloilo',
        // 110px desktop → min ~50px, scales with 7.6vw
        width: 'clamp(3.1rem, 7.6vw, 6.88rem)',
        widthPx: 110,
        top: '53%',
        left: 'clamp(8%, 17vw, 17%)',
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
        // 100px desktop → min ~45px, scales with 6.9vw
        width: 'clamp(2.8rem, 6.9vw, 6.25rem)',
        widthPx: 100,
        top: '72%',
        left: 'clamp(42%, 65vw, 65%)',
        rotate: 3,
        delay: 0.35,
        zIndex: 14,
        tapEffect: 'spotify',
    },
    {
        id: 'patchup',
        src: '/stickers/patchup.png',
        alt: 'Patch Up Project',
        // 80px desktop → min ~36px, scales with 5.6vw
        width: 'clamp(2.25rem, 5.6vw, 5rem)',
        widthPx: 80,
        top: '8%',
        left: 'clamp(42%, 65vw, 65%)',
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
        // 65px desktop → min ~29px, scales with 4.5vw
        width: 'clamp(1.8rem, 4.5vw, 4.06rem)',
        widthPx: 65,
        top: '79%',
        left: 'clamp(16%, 32vw, 32%)',
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
        // 50px desktop → min ~22px, scales with 3.5vw
        width: 'clamp(1.4rem, 3.5vw, 3.13rem)',
        widthPx: 50,
        top: '58%',
        left: 'clamp(44%, 67vw, 67%)',
        rotate: -5,
        delay: 0.12,
        zIndex: 14,
        tapEffect: 'certificates',
    },
    {
        id: 'flag',
        src: '/stickers/flag.png',
        alt: 'Philippine Flag',
        // 170px desktop → min ~77px, scales with 11.8vw
        width: 'clamp(4.8rem, 11.8vw, 10.63rem)',
        widthPx: 170,
        top: '3%',
        left: 'clamp(62%, 85vw, 85%)',
        rotate: 10,
        delay: 0.16,
        zIndex: 12,
    },


    {
        id: 'email',
        src: '/stickers/email.png',
        alt: 'Email Contact',
        // 100px desktop → min ~45px, scales with 6.9vw
        width: 'clamp(2.8rem, 6.9vw, 6.25rem)',
        widthPx: 100,
        top: '37%',
        left: 'clamp(40%, 63.7vw, 63.7%)',
        rotate: 8,
        delay: 0.22,
        zIndex: 14,
        tapEffect: 'contact',
    },
    {
        id: 'vipscale',
        src: '/stickers/vipscale.png',
        alt: 'VIPScale Project',
        // 90px desktop → min ~40px, scales with 6.3vw
        width: 'clamp(2.5rem, 6.3vw, 5.63rem)',
        widthPx: 90,
        top: '3%',
        left: 'clamp(11%, 22vw, 22%)',
        rotate: -10,
        delay: 0.14,
        zIndex: 12,
        popup: {
            title: 'VIPScale',
            text: 'A productivity dashboard for task management, time tracking, and AI content tools powered by n8n automations.',
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
        // 90px desktop → min ~40px, scales with 6.3vw
        width: 'clamp(2.9rem, 8.3vw, 6.88rem)',
        widthPx: 130,
        top: '82%',
        left: 'clamp(22%, 42vw, 42%)',
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
        // 135px desktop → min ~61px, scales with 9.4vw
        width: 'clamp(3.8rem, 9.4vw, 8.44rem)',
        widthPx: 135,
        top: '75%',
        left: 'clamp(8%, 16vw, 16%)',
        rotate: 6,
        delay: 0.32,
        zIndex: 13,
        popup: {
            text: [
                "I'm from Palawan, the one that keeps winning 'best island in the world.'",
                "We literally have a river that disappears underground. It's a UNESCO site.",
                "Around 1,780 islands in our province. Most of them you've never heard of.",
                "There's a safari here with free-roaming giraffes. In the Philippines. Crazy right?",
                "El Nido's cliffs took 250 million years to form. Worth the trip though.",
                "Coron has twin lagoons so clear it looks fake in photos. It's not.",
                "The Iwahig River glows with fireflies at night. No filter needed.",
                "Dugongs actually live here. Like, a whole population of them.",
                "Oldest human remains in PH were found in our caves. We go way back.",
                "Tubbataha Reef is a UNESCO dive site. Divers fly across the world for it.",
                "People save up for years to visit our beaches. We grew up there.",
            ],
            maxWidth: 320,
            duration: 9000,
        }
    },

    {
        id: 'telegram',
        src: '/stickers/telegram.png',
        alt: 'Telegram',
        // 60px desktop → min ~27px, scales with 4.2vw
        width: 'clamp(1.7rem, 4.2vw, 3.75rem)',
        widthPx: 60,
        top: '10%',
        left: 'clamp(16%, 32vw, 32%)',
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
        // 90px desktop → min ~40px, scales with 6.3vw
        width: 'clamp(2.5rem, 6.3vw, 5.63rem)',
        widthPx: 90,
        top: '80%',
        left: 'clamp(34%, 56vw, 56%)',
        rotate: -5,
        delay: 0.36,
        zIndex: 14,
        tapEffect: 'bounce',
    },
    // ── BOTTOM-RIGHT ──
    {
        id: 'coconut',
        src: '/stickers/coconut.png',
        alt: 'Coconut',
        // 70px desktop → min ~31px, scales with 4.9vw
        width: 'clamp(1.95rem, 4.9vw, 4.38rem)',
        widthPx: 70,
        top: '87%',
        left: 'clamp(72%, 93vw, 93%)',
        rotate: -10,
        delay: 0.4,
        zIndex: 15,
        tapEffect: 'shake',
    },
] as StickerData[]).map((sticker, index) => ({
    ...sticker,
    delay: 0.15 + (index * 0.05) // Base delay of 0.15s, so the card (0 delay) appears first
}));
