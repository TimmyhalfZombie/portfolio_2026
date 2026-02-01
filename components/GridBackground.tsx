import React from 'react';

export const GridBackground = () => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-grid-small mask-gradient">
        <div className="absolute inset-0 bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
    </div>
  );
};
