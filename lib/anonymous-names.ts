export const ANONYMOUS_TECH_NAMES: string[] = [
    "Anonymous Motherboard",
    "Anonymous VPS",
    "Anonymous Router",
    "Anonymous Kernel",
    "Anonymous Transistor",
    "Anonymous Cipher",
    "Anonymous Microchip",
    "Anonymous Firewall",
    "Anonymous Mainframe",
    "Anonymous Processor",
    "Anonymous Semiconductor",
    "Anonymous Hypervisor",
    "Anonymous Gateway",
    "Anonymous Protocol",
    "Anonymous Database",
    "Anonymous Subnet",
    "Anonymous Server",
    "Anonymous Byte",
    "Anonymous Circuit",
    "Anonymous Terminal",
    "Anonymous Buffer",
    "Anonymous Compiler",
    "Anonymous Algorithm",
    "Anonymous Docker",
    "Anonymous Payload",
    "Anonymous Packet",
    "Anonymous Firmware",
    "Anonymous Hostname",
    "Anonymous Endpoint",
    "Anonymous Socket",
    "Anonymous Proxy",
    "Anonymous Cluster",
    "Anonymous Container",
    "Anonymous Sandbox",
    "Anonymous Registry",
    "Anonymous Microservice",
    "Anonymous Repository",
    "Anonymous Memory",
    "Anonymous Pipeline",
    "Anonymous Thread",
    "Anonymous Process",
    "Anonymous Register",
    "Anonymous Bus",
    "Anonymous Clock",
    "Anonymous Logic Gate",
    "Anonymous GPU",
    "Anonymous CPU",
    "Anonymous RAM",
    "Anonymous NVMe",
    "Anonymous Ethernet",
    "Anonymous Fiber",
    "Anonymous Webhook",
    "Anonymous Middleware",
    "Anonymous Instance",
    "Anonymous Node",
    "Anonymous Keypair",
    "Anonymous Hash",
    "Anonymous Nonce",
    "Anonymous Token",
    "Anonymous Cookie",
    "Anonymous Cache",
    "Anonymous Index",
    "Anonymous Queue",
    "Anonymous Stack",
    "Anonymous Heap",
    "Anonymous Pointer",
    "Anonymous Array",
    "Anonymous Vector",
    "Anonymous Matrix",
    "Anonymous Tensor",
    "Anonymous Model",
    "Anonymous Neural Net",
    "Anonymous Transducer",
    "Anonymous Multiplexer",
    "Anonymous Demultiplexer",
    "Anonymous Microcontroller",
    "Anonymous Breadboard",
    "Anonymous Oscilloscope",
];

const STORAGE_KEY_NAME = 'portfolio-assigned-anon-name';
const STORAGE_KEY_INDEX = 'portfolio-assigned-anon-index';

/**
 * Assigns a persistent tech-themed anonymous username for this visitor.
 * Stored in localStorage so the user keeps the same name across sessions.
 */
export function getAssignedAnonymousName(): string {
    if (typeof window === 'undefined') {
        return ANONYMOUS_TECH_NAMES[0];
    }

    try {
        const saved = localStorage.getItem(STORAGE_KEY_NAME);
        if (saved && ANONYMOUS_TECH_NAMES.includes(saved)) {
            return saved;
        }

        // Get or increment the assignment counter to distribute names evenly
        let currentIndex = parseInt(localStorage.getItem(STORAGE_KEY_INDEX) || '-1', 10);
        if (isNaN(currentIndex)) {
            currentIndex = -1;
        }

        // Pick next index, cycling back after 80
        const nextIndex = (currentIndex + 1) % ANONYMOUS_TECH_NAMES.length;
        const assignedName = ANONYMOUS_TECH_NAMES[nextIndex];

        localStorage.setItem(STORAGE_KEY_INDEX, nextIndex.toString());
        localStorage.setItem(STORAGE_KEY_NAME, assignedName);

        return assignedName;
    } catch {
        // Fallback if localStorage is disabled
        const randomIndex = Math.floor(Math.random() * ANONYMOUS_TECH_NAMES.length);
        return ANONYMOUS_TECH_NAMES[randomIndex];
    }
}

/**
 * Gets avatar display initials for a name.
 * e.g., "Anonymous Motherboard" -> "M" or "AM"
 */
export function getAvatarInitial(name: string): string {
    if (!name) return 'A';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2 && parts[0].toLowerCase() === 'anonymous') {
        return parts[1].charAt(0).toUpperCase();
    }
    return name.charAt(0).toUpperCase();
}
