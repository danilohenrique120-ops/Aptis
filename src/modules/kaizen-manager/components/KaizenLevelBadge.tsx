'use client';

import React from 'react';
import { KaizenLevel } from '../types';
import { KAIZEN_LEVEL_CONFIG } from '../mock-data';

interface KaizenLevelBadgeProps {
  level: KaizenLevel;
  showIcon?: boolean;
  className?: string;
  tintedGlass?: boolean;
}

export function KaizenLevelBadge({
  level,
  showIcon = true,
  className = '',
  tintedGlass = false
}: KaizenLevelBadgeProps) {
  const config = KAIZEN_LEVEL_CONFIG[level] || KAIZEN_LEVEL_CONFIG.standard;

  const darkBadgeMap: Record<KaizenLevel, string> = {
    quick: 'bg-amber-500/20 text-amber-300 border-amber-500/35',
    standard: 'bg-blue-500/20 text-blue-300 border-blue-500/35',
    major: 'bg-purple-500/20 text-purple-300 border-purple-500/35',
    advanced: 'bg-rose-500/20 text-rose-300 border-rose-500/35',
  };

  const badgeStyle = tintedGlass ? (darkBadgeMap[level] || darkBadgeMap.standard) : config.badgeClass;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle} ${className}`}
      title={config.description}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
