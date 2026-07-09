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
export const StickerLayer: React.FC<{ activeIndex?: number }> = ({ activeIndex = 0 }) => {
  const frontStickers = STICKER_CONFIG.filter((s) => !s.behindCards);
  const isSecondCard = activeIndex === 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-[30]">
      {frontStickers.map((sticker) => {
        const isRetained = 
          !!(sticker.popup?.title && sticker.popup?.linkUrl) || 
          ['main-me', 'ghl', 'kajabi', 'squarespace', 'wix'].includes(sticker.id);
        const shouldShrink = isSecondCard && !isRetained;
        const shouldExpand = isSecondCard && isRetained && sticker.id !== 'main-me' && sticker.id !== 'cat';
        return (
          <Sticker key={sticker.id} data={sticker} isShrunk={shouldShrink} isExpanded={shouldExpand} />
        );
      })}
    </div>
  );
};


/** Stickers rendered BEHIND the card stack (z-5) — e.g. main-me */
export const StickerLayerBehind: React.FC<{ activeIndex?: number }> = ({ activeIndex = 0 }) => {
  const behindStickers = STICKER_CONFIG.filter((s) => s.behindCards);
  const isSecondCard = activeIndex === 1;

  return (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {behindStickers.map((sticker) => {
        const isRetained = 
          !!(sticker.popup?.title && sticker.popup?.linkUrl) || 
          ['main-me', 'ghl', 'kajabi', 'squarespace', 'wix'].includes(sticker.id);
        const shouldShrink = isSecondCard && !isRetained;
        const shouldExpand = isSecondCard && isRetained && sticker.id !== 'main-me' && sticker.id !== 'cat';
        return (
          <Sticker key={sticker.id} data={sticker} isShrunk={shouldShrink} isExpanded={shouldExpand} />
        );
      })}
    </div>
  );
};
