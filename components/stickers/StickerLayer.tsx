'use client';

import React from 'react';
import { STICKER_CONFIG } from './StickerConfig';
import { Sticker } from './Sticker';

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
