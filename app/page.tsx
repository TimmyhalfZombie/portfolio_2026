'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GridBackground } from '@/components/GridBackground';
import { StickyCardStack } from '@/components/StickyCardStack';
import { StickerLayer, StickerLayerMainMe } from '@/components/stickers';
import { MobileStoryView } from '@/components/MobileStoryView';
import { CommentsModal } from '@/components/CommentsModal';

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMainMeOnTop, setIsMainMeOnTop] = useState(false);
  const [isFrontStickersActive, setIsFrontStickersActive] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const cardAreaRef = useRef<HTMLDivElement>(null);

  // Orientation-based layout: portrait + ≤1024px = mobile, else desktop
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(orientation: portrait) or (max-width: 768px)');
    const update = () => setIsMobileLayout(mql.matches);
    update();
    setMounted(true);
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, []);

  // Force 3.1vw base font when mobile story view is active (phone + tablet portrait)
  // This ensures rem-based sizing (card, stickers, text) scales proportionally on ALL devices
  useEffect(() => {
    if (isMobileLayout) {
      document.documentElement.style.setProperty('font-size', '3.1vw', 'important');
    } else {
      document.documentElement.style.removeProperty('font-size');
    }
  }, [isMobileLayout]);

  // Prevent flash of wrong layout on SSR
  if (!mounted) return null;

  return (
    <main className="min-h-screen w-full bg-neutral-950 text-white font-sans selection:bg-white/20">
      <GridBackground />

      {!isMobileLayout ? (
        /* Desktop & Tablet Landscape Layout */
        <div>
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

          {/* Floating Comments Button (Desktop Only) */}
          <button
            onClick={() => setShowCommentsModal(true)}
            className="fixed bottom-6 right-6 z-[100] w-12 h-12 bg-black border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-neutral-900 hover:border-white/40 transition-all active:scale-95 pointer-events-auto shadow-2xl group"
            aria-label="Open comments"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Comments Modal (portaled to body) */}
          {showCommentsModal && typeof window !== 'undefined' && createPortal(
            <CommentsModal onClose={() => setShowCommentsModal(false)} />,
            document.body
          )}
        </div>
      ) : (
        /* Mobile & Tablet Portrait Layout */
        <div>
          <MobileStoryView />
        </div>
      )}
    </main>
  );
}
