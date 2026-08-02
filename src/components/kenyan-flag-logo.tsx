'use client';

import React from 'react';

interface KenyanFlagLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

// Unique IDs per instance to avoid SVG id collisions

export default function KenyanFlagLogo({ size = 36, className = '', showText = false, textClassName = '' }: KenyanFlagLogoProps) {
  const id = React.useId();
  const s = size * 2.5; // viewBox scale

  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label="Kenya Governance Explorer">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* ── Two crossed spears behind shield ── */}
        {/* Left spear */}
        <line x1="18" y1="8" x2="82" y2="95" stroke="#C8A84E" strokeWidth="3" strokeLinecap="round" />
        <polygon points="18,8 14,18 22,18" fill="#C8A84E" />
        {/* Right spear */}
        <line x1="82" y1="8" x2="18" y2="95" stroke="#C8A84E" strokeWidth="3" strokeLinecap="round" />
        <polygon points="82,8 78,18 86,18" fill="#C8A84E" />

        {/* ── Shield outer (white border) ── */}
        <path
          d="M 28 15 L 72 15 L 72 58 Q 72 80 50 92 Q 28 80 28 58 Z"
          fill="#FFFFFF"
          stroke="#1a1a1a"
          strokeWidth="2.5"
        />

        {/* ── Shield inner fill ── */}
        <path
          d="M 32 19 L 68 19 L 68 56 Q 68 76 50 87 Q 32 76 32 56 Z"
          fill="#BB0000"
        />

        {/* ── Black top half of shield ── */}
        <defs>
          <clipPath id={`shield-top-${id}`}>
            <path d="M 32 19 L 68 19 L 68 44 L 32 44 Z" />
          </clipPath>
        </defs>
        <rect x="28" y="15" width="44" height="35" fill="#1a1a1a" clipPath={`url(#shield-top-${id})`} />

        {/* ── White horizontal stripe (middle) ── */}
        <rect x="32" y="42" width="36" height="8" rx="0" fill="#FFFFFF" />

        {/* ── Green bottom half of shield ── */}
        <defs>
          <clipPath id={`shield-bottom-${id}`}>
            <path d="M 32 50 L 68 50 L 68 56 Q 68 76 50 87 Q 32 76 32 56 Z" />
          </clipPath>
        </defs>
        <rect x="28" y="50" width="44" height="50" fill="#006600" clipPath={`url(#shield-bottom-${id})`} />

        {/* ── Red cock (simplified) on the white stripe ── */}
        <circle cx="50" cy="46" r="4" fill="#BB0000" />
        <path d="M 46 44 Q 44 40 46 38 Q 48 40 46 44 Z" fill="#BB0000" />
        <path d="M 54 44 Q 56 40 54 38 Q 52 40 54 44 Z" fill="#BB0000" />
        {/* Beak */}
        <polygon points="50,42 48,44 52,44" fill="#C8A84E" />
      </svg>
      {showText && (
        <span className={`font-bold text-stone-900 dark:text-stone-100 leading-tight ${textClassName}`}>
          Kenya Governance Explorer
        </span>
      )}
    </div>
  );
}
