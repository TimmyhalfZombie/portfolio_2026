'use client';

import { GridBackground } from '@/components/GridBackground';
import { StickyCardStack } from '@/components/StickyCardStack';
import { StickerLayer, StickerLayerBehind } from '@/components/stickers';

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-white/20">
      <GridBackground />

      {/* Stickers BEHIND the card stack (main-me portrait) */}
      <StickerLayerBehind />

      {/* Main Content Area */}
      <div className="relative z-10 w-full pointer-events-none">
        {/* The Card Stack Section */}
        <StickyCardStack />
      </div>

      {/* Stickers IN FRONT of the card stack */}
      <StickerLayer />

      {/* Overlay Vignette */}
      <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/80 z-20"></div>
    </main>
  );
}
