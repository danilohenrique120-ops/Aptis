'use client';

import React from 'react';
import Image from 'next/image';

export interface AptisLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'symbol' | 'horizontal' | 'badge';
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

export function AptisLogo({
  size = 'md',
  variant = 'full',
  showTagline = false,
  className = '',
  glow = false
}: AptisLogoProps) {
  const dimensions = {
    xs: { img: 24, font: 'text-sm', badge: 'text-[8px]', gap: 'gap-1.5' },
    sm: { img: 32, font: 'text-base', badge: 'text-[9px]', gap: 'gap-2' },
    md: { img: 40, font: 'text-lg', badge: 'text-[10px]', gap: 'gap-2.5' },
    lg: { img: 52, font: 'text-2xl', badge: 'text-xs', gap: 'gap-3' },
    xl: { img: 72, font: 'text-4xl', badge: 'text-xs', gap: 'gap-4' },
    hero: { img: 110, font: 'text-5xl', badge: 'text-sm', gap: 'gap-5' }
  }[size];

  // Symbol only: Contains ONLY the letter 'A' monogram with cyan checkmark
  if (variant === 'symbol') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center shrink-0 ${glow ? 'group' : ''} ${className}`}
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 to-blue-600/40 rounded-2xl blur-md" />
        )}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md shadow-black/50 border border-cyan-500/30 bg-slate-950 flex items-center justify-center">
          <Image
            src="/brand/aptis-icon.png"
            alt="Aptis"
            width={dimensions.img}
            height={dimensions.img}
            className="w-full h-full object-contain p-0.5"
            priority
          />
        </div>
      </div>
    );
  }

  // Full lockup: Icon ('A' Monogram only) + Typographic "APTIS" Wordmark + SUITE badge
  return (
    <div className={`inline-flex items-center ${dimensions.gap} ${className}`}>
      {/* Icon Frame (ONLY the letter A monogram) */}
      <div 
        className="relative shrink-0 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-md shadow-black/40 flex items-center justify-center group"
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
        )}
        <Image
          src="/brand/aptis-icon.png"
          alt="Aptis Monograma A"
          width={dimensions.img}
          height={dimensions.img}
          className="w-full h-full object-contain p-1"
          priority
        />
      </div>

      {/* Typography Lockup */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`${dimensions.font} font-black tracking-wider text-white uppercase`}>
            APTIS
          </span>
          <span className="px-1.5 py-0.5 rounded-sm bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[9px] font-bold tracking-widest uppercase">
            SUITE
          </span>
        </div>
        
        {showTagline && (
          <span className="text-[10px] font-medium text-slate-400 tracking-tight mt-1">
            A fábrica sempre apta.
          </span>
        )}
      </div>
    </div>
  );
}
