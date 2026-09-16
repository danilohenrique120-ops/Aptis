import React from 'react';
import { SkillLevel } from '../types';

interface IluoCircleProps {
  level: SkillLevel;
  size?: number; // default 24px
  className?: string;
}

export function IluoCircle({ level, size = 26, className = '' }: IluoCircleProps) {
  // SVG center at (16, 16), radius 14
  // Quadrants:
  // Q1 (top-right): path from center to top, arc to right, back to center
  // Q2 (bottom-right): path from center to right, arc to bottom, back to center
  // Q3 (bottom-left): path from center to bottom, arc to left, back to center
  // Q4 (top-left): path from center to left, arc to top, back to center

  const getColor = (lvl: SkillLevel) => {
    switch (lvl) {
      case 1:
        return { fill: '#64748b', stroke: '#475569' }; // slate-500/600
      case 2:
        return { fill: '#f59e0b', stroke: '#d97706' }; // amber-500/600
      case 3:
        return { fill: '#2563eb', stroke: '#1d4ed8' }; // blue-600/700
      case 4:
        return { fill: '#10b981', stroke: '#059669' }; // emerald-500/600
    }
  };

  const { fill, stroke } = getColor(level);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={`shrink-0 transition-transform ${className}`}
      aria-label={`Nível ILUO ${level}`}
    >
      {/* Background circle outline */}
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="#f8fafc"
        stroke="#cbd5e1"
        strokeWidth="2"
      />

      {/* Cross grid lines */}
      <line x1="16" y1="3" x2="16" y2="29" stroke="#cbd5e1" strokeWidth="1.2" />
      <line x1="3" y1="16" x2="29" y2="16" stroke="#cbd5e1" strokeWidth="1.2" />

      {/* Quadrant 1: Top-Right (Present in Level >= 1) */}
      {level >= 1 && (
        <path
          d="M 16 16 L 16 3 A 13 13 0 0 1 29 16 Z"
          fill={fill}
        />
      )}

      {/* Quadrant 2: Bottom-Right (Present in Level >= 2) */}
      {level >= 2 && (
        <path
          d="M 16 16 L 29 16 A 13 13 0 0 1 16 29 Z"
          fill={fill}
        />
      )}

      {/* Quadrant 3: Bottom-Left (Present in Level >= 3) */}
      {level >= 3 && (
        <path
          d="M 16 16 L 16 29 A 13 13 0 0 1 3 16 Z"
          fill={fill}
        />
      )}

      {/* Quadrant 4: Top-Left (Present in Level >= 4) */}
      {level >= 4 && (
        <path
          d="M 16 16 L 3 16 A 13 13 0 0 1 16 3 Z"
          fill={fill}
        />
      )}

      {/* Outer border ring overlay */}
      <circle
        cx="16"
        cy="16"
        r="13"
        fill="none"
        stroke={stroke}
        strokeWidth="1.8"
      />
    </svg>
  );
}
