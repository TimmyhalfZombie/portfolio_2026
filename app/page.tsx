'use client';

import React, { useState, useRef } from 'react';
import { GridBackground } from '@/components/GridBackground';
import { StickyCardStack } from '@/components/StickyCardStack';
import { StickerLayer, StickerLayerMainMe } from '@/components/stickers';
import { MobileStoryView } from '@/components/MobileStoryView';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMainMeOnTop, setIsMainMeOnTop] = useState(false);
  const [isFrontStickersActive, setIsFrontStickersActive] = useState(false);
  const cardAreaRef = useRef<HTMLDivElement>(null);

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-white/20">
      <GridBackground />

      {/* Desktop & Tablet Layout (>= 768px) */}
      <div className="hidden md:block">
        {/* Main-me portrait — z-8 behind cards when overlapping, z-250 when dragged away */}
        <StickerLayerMainMe 
          activeIndex={activeIndex} 
          isMainMeActive={isMainMeOnTop} 
          onMainMeActiveChange={setIsMainMeOnTop} 
          cardAreaRef={cardAreaRef}
        />

        {/* Main Content Area — Cards (z-10) */}
        <div className="relative z-10 w-full pointer-events-none">
          {/* The Card Stack Section */}
          <StickyCardStack onActiveIndexChange={setActiveIndex} cardAreaRef={cardAreaRef} />
        </div>

        {/* All other stickers — ABOVE the cards (z-15) */}
        <StickerLayer 
          activeIndex={activeIndex} 
          isAnyActive={isFrontStickersActive} 
          onActiveChange={setIsFrontStickersActive} 
        />

        {/* Overlay Vignette (Desktop Only) */}
        <div className="fixed inset-0 pointer-events-none bg-radial-gradient from-transparent to-black/80 z-50"></div>
      </div>

      {/* Mobile Layout (< 768px) */}
      <div className="block md:hidden">
        <MobileStoryView />
      </div>
    </main>
  );
}
