import { createContext, useContext } from 'react';

/**
 * False while the opening screen still covers the portfolio. The portfolio mounts
 * underneath early so its images decode out of sight; entrance animations and the
 * mobile story timer wait for this before they start.
 */
export const RevealContext = createContext(true);

export const useRevealed = () => useContext(RevealContext);
