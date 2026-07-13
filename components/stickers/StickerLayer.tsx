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

/** Stickers rendered IN FRONT of the card stack (z-30) */
export const StickerLayer: React.FC<{ 
  activeIndex?: number;
  isAnyActive?: boolean;
  onActiveChange?: (active: boolean) => void;
}> = ({ activeIndex = 0, isAnyActive = false, onActiveChange }) => {
  const frontStickers = STICKER_CONFIG.filter((s) => !s.behindCards);
  const isSecondCard = activeIndex === 1;

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: isAnyActive ? 250 : 8 }}
    >
      {frontStickers.map((sticker) => {
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


/** Stickers rendered BEHIND the card stack (z-5) — e.g. main-me */
export const StickerLayerBehind: React.FC<{ 
  activeIndex?: number;
  isMainMeActive?: boolean;
  onMainMeActiveChange?: (active: boolean) => void;
}> = ({ activeIndex = 0, isMainMeActive = false, onMainMeActiveChange }) => {
  const behindStickers = STICKER_CONFIG.filter((s) => s.behindCards);
  const isSecondCard = activeIndex === 1;

  return (
    <div 
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: isMainMeActive ? 250 : 9 }}
    >
      {behindStickers.map((sticker) => {
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
            onDragStateChange={onMainMeActiveChange}
          />
        );
      })}
    </div>
  );
};
