'use client';

import React from 'react';
import Image from 'next/image';

export interface AptisLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'symbol' | 'image' | 'horizontal';
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
  // Dimensions per size
  const dimensions = {
    xs: { img: 24, font: 'text-sm', badge: 'text-[9px]', gap: 'gap-1.5' },
    sm: { img: 32, font: 'text-base', badge: 'text-[10px]', gap: 'gap-2' },
    md: { img: 40, font: 'text-lg', badge: 'text-[10px]', gap: 'gap-2.5' },
    lg: { img: 52, font: 'text-2xl', badge: 'text-xs', gap: 'gap-3' },
    xl: { img: 72, font: 'text-4xl', badge: 'text-xs', gap: 'gap-4' }
  }[size];

  // If using the official image directly
  if (variant === 'image') {
    return (
      <div className={`relative inline-flex items-center shrink-0 ${glow ? 'group' : ''} ${className}`}>
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-blue-600/30 rounded-2xl blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
        )}
        <div className="relative overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/90 shadow-lg shadow-black/40">
          <Image
            src="/brand/aptis-logo.png"
            alt="Aptis Logo"
            width={dimensions.img}
            height={dimensions.img}
            className="object-cover"
            priority
          />
        </div>
      </div>
    );
  }

  // Symbol only: vector monogram of the stylized 'A' with cyan checkmark
  if (variant === 'symbol') {
    return (
      <div 
        className={`relative inline-flex items-center justify-center shrink-0 ${glow ? 'group' : ''} ${className}`}
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        {glow && (
          <div className="absolute -inset-1 bg-cyan-400/30 rounded-xl blur-sm" />
        )}
        <div className="relative w-full h-full rounded-xl overflow-hidden shadow-md shadow-slate-950/50 border border-cyan-500/30 bg-slate-950 flex items-center justify-center">
          <Image
            src="/brand/aptis-logo.png"
            alt="Aptis"
            width={dimensions.img}
            height={dimensions.img}
            className="w-full h-full object-cover scale-110"
            priority
          />
        </div>
      </div>
    );
  }

  // Full variant: Official logo emblem + High-Contrast Geometric "APTIS" typography
  return (
    <div className={`inline-flex items-center ${dimensions.gap} ${className}`}>
      {/* Icon Frame */}
      <div 
        className="relative shrink-0 rounded-xl overflow-hidden border border-slate-700/70 bg-slate-950 shadow-md shadow-black/40 flex items-center justify-center group"
        style={{ width: dimensions.img, height: dimensions.img }}
      >
        {glow && (
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl blur-sm opacity-40 group-hover:opacity-75 transition-opacity" />
        )}
        <Image
          src="/brand/aptis-logo.png"
          alt="Aptis Monogram"
          width={dimensions.img}
          height={dimensions.img}
          className="w-full h-full object-cover"
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
