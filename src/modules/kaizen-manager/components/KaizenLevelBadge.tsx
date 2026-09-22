'use client';

import React from 'react';
import { KaizenLevel } from '../types';
import { KAIZEN_LEVEL_CONFIG } from '../mock-data';

interface KaizenLevelBadgeProps {
  level: KaizenLevel;
  showIcon?: boolean;
  className?: string;
}

export function KaizenLevelBadge({
  level,
  showIcon = true,
  className = ''
}: KaizenLevelBadgeProps) {
  const config = KAIZEN_LEVEL_CONFIG[level] || KAIZEN_LEVEL_CONFIG.standard;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.badgeClass} ${className}`}
      title={config.description}
    >
      {showIcon && <span>{config.icon}</span>}
      <span>{config.label}</span>
    </span>
  );
}
