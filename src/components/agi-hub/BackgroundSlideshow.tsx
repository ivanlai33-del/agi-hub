'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const backgrounds = [
  '/hub-bg1.jpeg',
  '/hub-bg2.jpeg',
  '/hub-bg3.jpeg',
  '/hub-bg4.jpeg',
  '/hub-bg5.jpeg',
  '/hub-bg6.jpeg',
  '/hub-bg7.jpeg',
];

export const BackgroundSlideshow: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % backgrounds.length);
    }, 10000); // 10 seconds
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Preload all images for instant switching on mobile/tablet */}
      <div className="hidden">
        {backgrounds.map((src) => (
          <img key={src} src={src} alt="preload" />
        ))}
      </div>

      <AnimatePresence>
        <motion.div
          key={backgrounds[bgIndex]}
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 0.8, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ 
            opacity: { duration: 3 },
            scale: { duration: 12, ease: "linear" } 
          }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat will-change-[transform,opacity]"
          style={{ backgroundImage: `url(${backgrounds[bgIndex]})` }}
        />
      </AnimatePresence>
      
      {/* Dark Overlay for Legibility - Lightened to show background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 z-[1]" />
      
      {/* Atmosphere Glows - Using hardware acceleration */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 blur-[140px] rounded-full animate-pulse z-[2] will-change-opacity" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse [animation-delay:3s] z-[2] will-change-opacity" />
    </div>
  );
};
