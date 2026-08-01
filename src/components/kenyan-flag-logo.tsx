'use client';

import React from 'react';

interface KenyanFlagLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function KenyanFlagLogo({ size = 36, className = '', showText = false, textClassName = '' }: KenyanFlagLogoProps) {
  const h = size;
  const w = size * 1.4;
  const stripeH = h / 4;
  const shieldW = w * 0.28;
  const shieldH = h * 0.7;
  const shieldX = (w - shieldW) / 2;
  const shieldY = (h - shieldH) / 2;

  return (
    <div className={`flex items-center gap-2 ${className}`} role="img" aria-label="Kenya Governance Explorer">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w * 3} ${h * 3}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Black stripe (top) */}
        <rect x="0" y="0" width={w * 3} height={stripeH * 3} fill="#000000" />
        {/* Red stripe */}
        <rect x="0" y={stripeH * 3} width={w * 3} height={stripeH * 3} fill="#BB0000" />
        {/* Green stripe */}
        <rect x="0" y={stripeH * 6} width={w * 3} height={stripeH * 3} fill="#006600" />
        {/* White borders between stripes */}
        <rect x="0" y={stripeH * 3 - 1.5} width={w * 3} height={3} fill="#FFFFFF" />
        <rect x="0" y={stripeH * 6 - 1.5} width={w * 3} height={3} fill="#FFFFFF" />

        {/* Kenyan Shield */}
        <path
          d={`
            M ${shieldX * 3} ${shieldY * 3}
            L ${(shieldX + shieldW) * 3} ${shieldY * 3}
            L ${(shieldX + shieldW) * 3} ${(shieldY + shieldH * 0.75) * 3}
            Q ${(shieldX + shieldW) * 3} ${(shieldY + shieldH) * 3} ${(shieldX + shieldW / 2) * 3} ${(shieldY + shieldH * 0.95) * 3}
            Q ${shieldX * 3} ${(shieldY + shieldH) * 3} ${shieldX * 3} ${(shieldY + shieldH * 0.75) * 3}
            Z
          `}
          fill="#FFFFFF"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {/* Spear (vertical behind shield) */}
        <line
          x1={(shieldX + shieldW / 2) * 3}
          y1={(shieldY - shieldH * 0.08) * 3}
          x2={(shieldX + shieldW / 2) * 3}
          y2={(shieldY + shieldH * 1.05) * 3}
          stroke="#666666"
          strokeWidth="3"
        />
        {/* Spear tip */}
        <polygon
          points={`${(shieldX + shieldW / 2) * 3},${(shieldY - shieldH * 0.15) * 3} ${(shieldX + shieldW / 2 - shieldW * 0.08) * 3},${(shieldY - shieldH * 0.02) * 3} ${(shieldX + shieldW / 2 + shieldW * 0.08) * 3},${(shieldY - shieldH * 0.02) * 3}`}
          fill="#666666"
        />

        {/* Inner shield: red fill */}
        <path
          d={`
            M ${(shieldX + 2) * 3} ${(shieldY + 3) * 3}
            L ${(shieldX + shieldW - 2) * 3} ${(shieldY + 3) * 3}
            L ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH * 0.72) * 3}
            Q ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH - 2) * 3} ${(shieldX + shieldW / 2) * 3} ${(shieldY + shieldH * 0.92) * 3}
            Q ${(shieldX + 2) * 3} ${(shieldY + shieldH - 2) * 3} ${(shieldX + 2) * 3} ${(shieldY + shieldH * 0.72) * 3}
            Z
          `}
          fill="#BB0000"
        />

        {/* Inner shield: black and green halves */}
        <clipPath id="shieldTop">
          <path
            d={`
              M ${(shieldX + 2) * 3} ${(shieldY + 3) * 3}
              L ${(shieldX + shieldW - 2) * 3} ${(shieldY + 3) * 3}
              L ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH * 0.5) * 3}
              L ${(shieldX + 2) * 3} ${(shieldY + shieldH * 0.5) * 3}
              Z
            `}
          />
        </clipPath>
        <rect x={(shieldX) * 3} y={(shieldY) * 3} width={shieldW * 3} height={shieldH * 0.5 * 3} fill="#000000" clipPath="url(#shieldTop)" />

        <clipPath id="shieldBottom">
          <path
            d={`
              M ${(shieldX + 2) * 3} ${(shieldY + shieldH * 0.5) * 3}
              L ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH * 0.5) * 3}
              L ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH * 0.72) * 3}
              Q ${(shieldX + shieldW - 2) * 3} ${(shieldY + shieldH - 2) * 3} ${(shieldX + shieldW / 2) * 3} ${(shieldY + shieldH * 0.92) * 3}
              Q ${(shieldX + 2) * 3} ${(shieldY + shieldH - 2) * 3} ${(shieldX + 2) * 3} ${(shieldY + shieldH * 0.72) * 3}
              Z
            `}
          />
        </clipPath>
        <rect x={(shieldX) * 3} y={(shieldY + shieldH * 0.5) * 3} width={shieldW * 3} height={shieldH * 0.5 * 3} fill="#006600" clipPath="url(#shieldBottom)" />

        {/* Rounded corners on the flag */}
        <rect x="0" y="0" width={w * 3} height={h * 3} rx="12" ry="12" fill="none" stroke="#00000020" strokeWidth="1" />
      </svg>
      {showText && (
        <span className={`font-bold text-stone-900 dark:text-stone-100 leading-tight ${textClassName}`}>
          Kenya Governance Explorer
        </span>
      )}
    </div>
  );
}
