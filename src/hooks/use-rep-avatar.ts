'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Storage key generator ──
function makeKey(name: string, county?: string): string {
  const slug = `${name}|${county || '_'}`.toLowerCase().replace(/[^a-z0-9|]/g, '-');
  return `rep-avatar:${slug}`;
}

// ── Hook ──
export function useRepAvatar(name: string, county?: string) {
  const [src, setSrc] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(makeKey(name, county));
      setSrc(raw);
    } catch { /* quota or unavailable */ }
    setLoaded(true);
  }, [name, county]);

  const upload = useCallback((file: File) => {
    return new Promise<void>((resolve, reject) => {
      if (!file.type.startsWith('image/')) {
        reject(new Error('Not an image file'));
        return;
      }
      // Compress via canvas to keep localStorage manageable
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 200;
          let { width, height } = img;
          if (width > MAX || height > MAX) {
            if (width > height) {
              height = Math.round(height * MAX / width);
              width = MAX;
            } else {
              width = Math.round(width * MAX / height);
              height = MAX;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          try {
            localStorage.setItem(makeKey(name, county), dataUrl);
            setSrc(dataUrl);
            resolve();
          } catch {
            reject(new Error('Storage full'));
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [name, county]);

  const remove = useCallback(() => {
    try {
      localStorage.removeItem(makeKey(name, county));
    } catch { /* ignore */ }
    setSrc(null);
  }, [name, county]);

  return { src, loaded, upload, remove };
}
