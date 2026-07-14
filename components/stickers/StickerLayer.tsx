'use client';

import React, { useEffect } from 'react';
import { STICKER_CONFIG } from './StickerConfig';
import { Sticker } from './Sticker';


declare global {
  interface Window {
    localAudioController?: {
      play: () => void;
      pause: () => void;
      next: () => void;
      getSongName: () => string;
    };
  }
}

const LOCAL_PLAYLIST = [
  { src: '/mp3/Hot Mulligan - I Dont Think Its the Right Time for Emojis.mp3', name: "Hot Mulligan - I Don't Think It's the Right Time for Emojis" },
  { src: '/mp3/The Story So Far Big Blind.mp3', name: 'The Story So Far - Big Blind' },
];

/** All stickers EXCEPT main-me — rendered ABOVE the card stack (z-15) */
export const StickerLayer: React.FC<{ 
  activeIndex?: number;
  isAnyActive?: boolean;
  onActiveChange?: (active: boolean) => void;
}> = ({ activeIndex = 0, isAnyActive = false, onActiveChange }) => {
  const stickers = STICKER_CONFIG.filter((s) => s.id !== 'main-me');
  const isSecondCard = activeIndex === 1;

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: isAnyActive ? 250 : 15 }}
    >
      {stickers.map((sticker) => {
        const isRetained = 
          !!(sticker.popup?.title && sticker.popup?.linkUrl) || 
          ['main-me', 'ghl', 'kajabi', 'squarespace', 'wix'].includes(sticker.id);
        const shouldShrink = isSecondCard && !isRetained;
        const shouldExpand = isSecondCard && isRetained && sticker.id !== 'main-me' && sticker.id !== 'cat';
        return (
          <Sticker 
            key={sticker.id} 
            data={sticker} 
            isShrunk={shouldShrink} 
            isExpanded={shouldExpand} 
            onDragStateChange={onActiveChange}
          />
        );
      })}
    </div>
  );
};


/**
 * Main-me sticker — position-based z-index:
 * - Overlapping card area → z-8 (behind cards)
 * - Away from card area → z-250 (above everything including stickers)
 * - During drag → z-250 (always on top while moving)
 */
export const StickerLayerMainMe: React.FC<{ 
  activeIndex?: number;
  isMainMeActive?: boolean;
  onMainMeActiveChange?: (active: boolean) => void;
  cardAreaRef?: React.RefObject<HTMLDivElement | null>;
}> = ({ activeIndex = 0, isMainMeActive = false, onMainMeActiveChange, cardAreaRef }) => {
  const mainMe = STICKER_CONFIG.find((s) => s.id === 'main-me');
  if (!mainMe) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: isMainMeActive ? 250 : 8 }}
    >
      <Sticker 
        key={mainMe.id} 
        data={mainMe} 
        isShrunk={false} 
        isExpanded={false} 
        onDragStateChange={onMainMeActiveChange}
        cardAreaRef={cardAreaRef}
      />
    </div>
  );
};
