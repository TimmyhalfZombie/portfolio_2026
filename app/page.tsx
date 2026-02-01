'use client';

import { GridBackground } from '@/components/GridBackground';
import { FloatingSticker } from '@/components/FloatingSticker';
import { StickyCardStack } from '@/components/StickyCardStack';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-white/20">
      <GridBackground />

      {/* Decorative Stickers (Fixed Background) */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[150vh] max-w-7xl">
          <FloatingSticker src="/sticker_phone_booth.png" alt="Phone Booth" initialX="10%" initialY="20%" width={140} rotate={-15} delay={0.2} />
          <FloatingSticker src="/sticker_sneaker.png" alt="Sneaker" initialX="80%" initialY="25%" width={160} rotate={15} delay={0.4} />
          <FloatingSticker src="/sticker_dog.png" alt="Dog" initialX="15%" initialY="70%" width={120} rotate={-10} delay={0.6} />
          <FloatingSticker src="/sticker_laptop.png" alt="Laptop" initialX="75%" initialY="65%" width={200} rotate={10} delay={0.8} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 w-full">
        {/* The Card Stack Section */}
        <StickyCardStack />
      </div>

      {/* Overlay Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/80 z-20"></div>
    </main>
  );
}
