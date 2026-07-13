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
    /** If true, the tech stack pills start and stay fully open/visible without a toggle button */
    stackAlwaysOpen?: boolean;
    /** If true, the popup will ALWAYS render above the sticker, ignoring upper-screen collision logic */
    forceTop?: boolean;
    /** If true, the popup will ALWAYS render below the sticker */
    forceBottom?: boolean;
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
    /** CSS top position — use calc(50% ± Xrem) for center-relative positioning */
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
    tapEffect?: 'flyAround' | 'spotify' | 'bounce' | 'contact' | 'certificates' | 'shake' | 'rotate3d' | 'crayfish' | 'fishing';
}

/*
 * Sticker positions use calc(50% ± Xrem) for `top` so that vertical placement
 * scales with viewport WIDTH (via the vw-based rem in globals.css), matching
 * the card stack's scaling behavior. This keeps stickers aligned across all
 * desktop resolutions and aspect ratios.
 *
 * Reference: designed at 1920×1080 where 1rem = 20px, viewport center = 540px.
 * Formula: old top Y% → offset = (Y/100 × 1080 - 540) / 20 rem
 */
export const STICKER_CONFIG: StickerData[] = ([
    // ── HERO — Center Top ──
    {
        id: 'main-me',
        src: '/stickers/main-me.webp',
        alt: 'Shem — Main Portrait',
        // 320px desktop → min ~144px, scales with 22vw
        width: 'clamp(9rem, 22vw, 20rem)',
        widthPx: 320,
        top: 'calc(50% - 24rem)',
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
        src: '/stickers/me.webp',
        alt: 'Shem — Secondary',
        // 220px desktop → min ~99px, scales with 15vw
        width: 'clamp(6.2rem, 15vw, 13.75rem)',
        widthPx: 220,
        top: 'calc(50% + 4.32rem)',
        left: 'clamp(0.5%, 1vw, 1%)',
        rotate: -8,
        delay: 0.1,
        zIndex: 12,
    },
    {
        id: 'resume',
        src: '/stickers/resume.webp',
        alt: 'Resume',
        // 70px desktop → min ~31px, scales with 4.9vw
        width: 'clamp(2rem, 5vw, 4.5rem)',
        widthPx: 70,
        top: 'calc(50% - 13rem)',
        left: 'clamp(2%, 4.5vw, 4.5%)',
        rotate: -8,
        delay: 0.14,
        zIndex: 15,
        popup: {
            text: 'Download my',
            linkText: 'Resume',
            linkUrl: '/resume/Shemuel_Rei_Lagrosa_Resume.pdf',
            forceTop: true,
        },
    },
    {
        id: 'fb',
        src: '/stickers/fb.webp',
        alt: 'Facebook',
        // 55px desktop → min ~25px, scales with 3.8vw
        width: 'clamp(1.55rem, 3.8vw, 3.44rem)',
        widthPx: 55,
        top: 'calc(50% - 2.5rem)',
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
        src: '/stickers/cat.webp',
        alt: 'Cat Sticker',
        // 140px desktop → min ~63px, scales with 9.7vw
        width: 'clamp(3.9rem, 9.7vw, 8.75rem)',
        widthPx: 140,
        top: 'calc(50% - 17.01rem)',
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
            offsetX: -180,
            offsetY: -35,
            forceBottom: true,
        }
    },
    {
        id: 'linkedin',
        src: '/stickers/linkedin.webp',
        alt: 'LinkedIn',
        // 55px desktop → min ~25px, scales with 3.8vw
        width: 'clamp(1.55rem, 3.8vw, 3.44rem)',
        widthPx: 55,
        top: 'calc(50% + 4.32rem)',
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
        src: '/stickers/fazzio.webp',
        alt: 'Fazzio Project',
        // 150px desktop → min ~68px, scales with 10.4vw
        width: 'clamp(4.2rem, 10.4vw, 9.38rem)',
        widthPx: 150,
        top: 'calc(50% - 19.44rem)',
        left: 'clamp(50%, 72vw, 72%)',
        rotate: 0,
        delay: 0.25,
        zIndex: 11,
        tapEffect: 'flyAround',
    },
    {
        id: 'assumption',
        src: '/stickers/assumption.webp',
        alt: 'Assumption Iloilo',
        // 99px desktop → min ~45px, scales with 6.8vw
        width: 'clamp(2.8rem, 6.8vw, 6.19rem)',
        widthPx: 99,
        top: 'calc(50% + 0.5rem)',
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
    {
        id: 'kajabi',
        src: '/stickers/kajabi.webp',
        alt: 'Kajabi',
        // 72px desktop → min ~32px, scales with 5vw
        width: 'clamp(2rem, 5vw, 4.5rem)',
        widthPx: 72,
        top: 'calc(50% - 7.2rem)',
        left: 'clamp(64%, 85vw, 85%)',
        rotate: 10,
        delay: 0.32,
        zIndex: 12,
        popup: {
            text: 'Experienced building online courses, membership sites, and sales funnels in Kajabi.',
            maxWidth: 320,
        }
    },
    {
        id: 'squarespace',
        src: '/stickers/squarespace.webp',
        alt: 'Squarespace',
        // 80px desktop → min ~36px, scales with 5.6vw
        width: 'clamp(2.25rem, 5.6vw, 5rem)',
        widthPx: 80,
        top: 'calc(50% + 16.2rem)',
        left: 'clamp(40%, 62vw, 62%)',
        rotate: -8,
        delay: 0.33,
        zIndex: 13,
        popup: {
            text: 'Experienced building business websites, landing pages, and custom-styled sites in Squarespace.',
            maxWidth: 320,
        }
    },

    // ── BOTTOM CENTER ──
    {
        id: 'punk',
        src: '/stickers/punk.webp',
        alt: 'Punk Sticker',
        // 100px desktop → min ~45px, scales with 6.9vw
        width: 'clamp(2.8rem, 6.9vw, 6.25rem)',
        widthPx: 100,
        top: 'calc(50% + 11.88rem)',
        left: 'clamp(48%, 71vw, 71%)',
        rotate: 3,
        delay: 0.35,
        zIndex: 14,
        tapEffect: 'spotify',
    },
    {
        id: 'patchup',
        src: '/stickers/patchup.webp',
        alt: 'Patch Up Project',
        // 72px desktop → min ~32px, scales with 5vw
        width: 'clamp(2rem, 5vw, 4.5rem)',
        widthPx: 72,
        top: 'calc(50% - 22.68rem)',
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
        src: '/stickers/hive.webp',
        alt: 'Hive',
        // 65px desktop → min ~29px, scales with 4.5vw
        width: 'clamp(1.8rem, 4.5vw, 4.06rem)',
        widthPx: 65,
        top: 'calc(50% + 15.66rem)',
        left: 'clamp(18%, 33vw, 33%)',
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
        src: '/stickers/coursera.webp',
        alt: 'Coursera Certificate',
        // 50px desktop → min ~22px, scales with 3.5vw
        width: 'clamp(1.4rem, 3.5vw, 3.13rem)',
        widthPx: 50,
        top: 'calc(50% + 4.32rem)',
        left: 'clamp(44%, 67vw, 67%)',
        rotate: -5,
        delay: 0.12,
        zIndex: 14,
        tapEffect: 'certificates',
    },
    {
        id: 'flag',
        src: '/stickers/flag.webp',
        alt: 'Philippine Flag',
        // 125px desktop → min ~56px, scales with 8.7vw
        width: 'clamp(3.5rem, 8.7vw, 7.8rem)',
        widthPx: 125,
        top: 'calc(50% - 22.38rem)',
        left: 'clamp(62%, 85vw, 85%)',
        rotate: 10,
        delay: 0.16,
        zIndex: 12,
    },


    {
        id: 'email',
        src: '/stickers/email.webp',
        alt: 'Email Contact',
        // 85px desktop → min ~38px, scales with 5.9vw
        width: 'clamp(2.4rem, 5.9vw, 5.31rem)',
        widthPx: 85,
        top: 'calc(50% - 7.02rem)',
        left: 'clamp(40%, 63.7vw, 63.7%)',
        rotate: 8,
        delay: 0.22,
        zIndex: 14,
        tapEffect: 'contact',
    },
    {
        id: 'vipscale',
        src: '/stickers/vipscale.webp',
        alt: 'VIPScale Project',
        // 93px desktop (increased by 15% from 81px)
        width: 'clamp(2.59rem, 6.56vw, 5.82rem)',
        widthPx: 93,
        top: 'calc(50% - 8.5rem)',
        left: 'clamp(6.5%, 13.5vw, 13.5%)',
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
        src: '/stickers/tool.webp',
        alt: 'Dev Tools',
        // 100px desktop → min ~45px, scales with 6.9vw
        width: 'clamp(2.8rem, 6.9vw, 6.25rem)',
        widthPx: 100,
        top: 'calc(50% + 13rem)',
        left: 'clamp(28%, 48vw, 48%)',
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
        src: '/stickers/palawan.webp',
        alt: 'Palawan Travel',
        // 135px desktop → min ~61px, scales with 9.4vw
        width: 'clamp(3.8rem, 9.4vw, 8.44rem)',
        widthPx: 135,
        top: 'calc(50% + 11.5rem)',
        left: 'clamp(8%, 15vw, 15%)',
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
        src: '/stickers/telegram.webp',
        alt: 'Telegram',
        // 50px desktop → min ~22px, scales with 3.5vw
        width: 'clamp(1.4rem, 3.5vw, 3.13rem)',
        widthPx: 50,
        top: 'calc(50% - 21.6rem)',
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
        id: 'ltbl',
        src: '/stickers/ltbl.webp',
        alt: 'Let There Be Lights Project',
        // 80px desktop → min ~36px, scales with 5.6vw
        width: 'clamp(2.25rem, 5.6vw, 5rem)',
        widthPx: 80,
        top: 'calc(50% + 0.5rem)',
        left: 'clamp(56%, 76vw, 76%)',
        rotate: -5,
        delay: 0.36,
        zIndex: 14,
        popup: {
            title: 'Let There Be Lights',
            text: 'A digital art gallery and devotional platform featuring daily reflections and imagery.',
            linkText: 'Visit Site',
            linkUrl: 'https://let-there-be-lights.vercel.app/',
            stack: ['React Native', 'Expo Go', 'Next.js', 'TypeScript', 'Supabase', 'Tailwind CSS', 'n8n'],
        }
    },
    {
        id: 'fishing',
        src: '/stickers/fishing.webp',
        alt: 'Fishing',
        // 75px desktop → min ~33px, scales with 5.2vw
        width: 'clamp(2.1rem, 5.2vw, 4.69rem)',
        widthPx: 75,
        top: 'calc(50% - 21.5rem)',
        left: 'clamp(1%, 6vw, 6%)',
        rotate: -15,
        delay: 0.38,
        zIndex: 11,
        tapEffect: 'fishing',
    },
    // ── BOTTOM-RIGHT ──
    {
        id: 'github',
        src: '/stickers/github.webp',
        alt: 'GitHub',
        // 60px desktop → min ~27px, scales with 4.2vw
        width: 'clamp(1.7rem, 4.2vw, 3.75rem)',
        widthPx: 60,
        top: 'calc(50% + 12.5rem)',
        left: 'clamp(66%, 84vw, 84%)',
        rotate: 6,
        delay: 0.37,
        zIndex: 14,
        popup: {
            text: 'Check out my',
            linkText: 'GitHub',
            linkUrl: 'https://github.com/TimmyhalfZombie',
        },
    },
    {
        id: 'coconut',
        src: '/stickers/coconut.webp',
        alt: 'Coconut',
        // 70px desktop → min ~31px, scales with 4.9vw
        width: 'clamp(1.95rem, 4.9vw, 4.38rem)',
        widthPx: 70,
        top: 'calc(50% + 16.98rem)',
        left: 'clamp(72%, 92vw, 92%)',
        rotate: -10,
        delay: 0.4,
        zIndex: 15,
        tapEffect: 'shake',
    },

    {
        id: 'wix',
        src: '/stickers/wix.webp',
        alt: 'Wix',
        // 90px desktop → min ~40px, scales with 6.2vw
        width: 'clamp(2.5rem, 6.2vw, 5.63rem)',
        widthPx: 90,
        top: 'calc(50% - 18.5rem)',
        left: 'clamp(9.5%, 19vw, 19%)',
        rotate: -5,
        delay: 0.39,
        zIndex: 12,
        popup: {
            text: 'Experienced building custom websites, landing pages, and client-facing sites in Wix.',
            maxWidth: 320,
        }
    },
    {
        id: 'ghl',
        src: '/stickers/ghl.webp',
        alt: 'GoHighLevel',
        // 100px desktop → min ~45px, scales with 6.9vw
        width: 'clamp(2.8rem, 6.9vw, 6.25rem)',
        widthPx: 100,
        top: 'calc(50% - 9.5rem)',
        left: 'clamp(13.5%, 23.5vw, 23.5%)',
        rotate: 8,
        delay: 0.4,
        zIndex: 13,
        popup: {
            text: 'Experienced building marketing funnels, automation workflows, and CRM pipelines in GoHighLevel.',
            maxWidth: 320,
        }
    },

    {
        id: 'crayfish',
        src: '/stickers/crayfish.webp',
        alt: 'Crayfish',
        // 110px desktop → min ~50px, scales with 7.6vw
        width: 'clamp(3.1rem, 7.6vw, 6.88rem)',
        widthPx: 110,
        top: 'calc(50% + 3rem)',
        left: 'clamp(68%, 88vw, 88%)',
        rotate: -8,
        delay: 0.41,
        zIndex: 14,
        tapEffect: 'crayfish',
    },
    {
        id: 'code',
        src: '/stickers/code.webp',
        alt: 'Code',
        // 60px desktop → min ~27px, scales with 4.2vw
        width: 'clamp(1.7rem, 4.2vw, 3.75rem)',
        widthPx: 60,
        top: 'calc(55% - 8rem)',
        left: 'clamp(52%, 74vw, 74%)',
        rotate: 10,
        delay: 0.42,
        zIndex: 13,
        popup: {
            title: 'Skill Set',
            text: 'The tools I build with.',
            maxWidth: 360,
            forceBottom: true,
            stackAlwaysOpen: true,
            offsetX: 50,
            stack: [
                'React / Next.js',
                'TypeScript',
                'React Native',
                'Expo Go',
                'Node.js / Express',
                'Supabase',
                'Firebase',
                'MongoDB',
                'n8n Automation',
                'Tailwind CSS',
                'Shadcn / Radix UI',
                'Websockets / REST',
                'IoT Pipeline',
                'No-Code Platforms',
            ],
        },
    },
] as StickerData[]).map((sticker, index) => {
    const exclude = sticker.id === 'main-me' || sticker.id === 'cat';
    return {
        ...sticker,
        delay: 0.15 + (index * 0.05), // Base delay of 0.15s, so the card (0 delay) appears first
        // Slightly scale up all stickers except main-me and cat
        width: exclude ? sticker.width : `calc(${sticker.width} * 1.12)`,
        widthPx: exclude ? sticker.widthPx : Math.round(sticker.widthPx * 1.12),
    };
});
