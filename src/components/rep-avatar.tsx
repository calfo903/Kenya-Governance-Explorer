'use client';

import React, { useRef, useState, useCallback } from 'react';
import { Camera, Upload, X, User } from 'lucide-react';
import { useRepAvatar } from '@/hooks/use-rep-avatar';

interface RepAvatarProps {
  /** Unique identifier — usually the representative's full name */
  name: string;
  /** County or jurisdiction to distinguish same-named people */
  county?: string;
  /** Size in Tailwind format, e.g. "h-10 w-10" */
  size?: string;
  /** Fallback initials when no image is uploaded */
  initials?: string;
  /** Additional CSS classes on the container */
  className?: string;
  /** Show upload overlay on hover */
  showUpload?: boolean;
}

export default function RepAvatar({
  name,
  county,
  size = 'h-10 w-10',
  initials,
  className = '',
  showUpload = true,
}: RepAvatarProps) {
  const { src, loaded, upload, remove } = useRepAvatar(name, county);
  const inputRef = useRef<HTMLInputElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Generate initials from name
  const fallbackInitials = initials || name
    .split(' ')
    .map(w => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleFile = useCallback(async (file: File) => {
    try {
      await upload(file);
      setMenuOpen(false);
    } catch {
      // Could show toast here
    }
  }, [upload]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div className={`relative inline-flex shrink-0 ${className}`}>
      {/* Avatar */}
      <div
        className={`${size} rounded-full overflow-hidden flex items-center justify-center bg-stone-100 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 ${showUpload ? 'cursor-pointer group' : ''}`}
        onClick={() => showUpload && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={showUpload ? 0 : undefined}
        aria-label={src ? `Change photo for ${name}` : `Upload photo for ${name}`}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
      >
        {src ? (
          <img
            src={src}
            alt={name}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          <span className="text-xs font-bold text-stone-500 dark:text-stone-400 select-none">
            {fallbackInitials}
          </span>
        )}

        {/* Upload overlay on hover */}
        {showUpload && !isDragging && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
            {src ? <Camera className="w-3.5 h-3.5 text-white" /> : <Upload className="w-3.5 h-3.5 text-white" />}
          </div>
        )}

        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 border-2 border-dashed border-emerald-500 flex items-center justify-center">
            <Upload className="w-4 h-4 text-emerald-600" />
          </div>
        )}
      </div>

      {/* Remove button (small X in corner when image exists) */}
      {src && showUpload && (
        <button
          onClick={(e) => { e.stopPropagation(); remove(); }}
          className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-stone-600 dark:bg-stone-400 text-white dark:text-stone-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 z-10"
          aria-label="Remove photo"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
