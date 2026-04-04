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
export const StickerLayer: React.FC = () => {
  const frontStickers = STICKER_CONFIG.filter((s) => !s.behindCards);

  return (
    <div className="fixed inset-0 pointer-events-none z-[30]">
      {frontStickers.map((sticker) => (
        <Sticker key={sticker.id} data={sticker} />
      ))}
    </div>
  );
};


/** Stickers rendered BEHIND the card stack (z-5) — e.g. main-me */
export const StickerLayerBehind: React.FC = () => {
  const behindStickers = STICKER_CONFIG.filter((s) => s.behindCards);

  return (
    <div className="fixed inset-0 pointer-events-none z-[5]">
      {behindStickers.map((sticker) => (
        <Sticker key={sticker.id} data={sticker} />
      ))}
    </div>
  );
};
