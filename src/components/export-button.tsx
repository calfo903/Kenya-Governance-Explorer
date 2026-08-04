'use client';

import { useState, useCallback } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ExportButtonProps {
  /** Callback that performs the actual export logic (e.g. calls exportCountiesToCSV) */
  onClick?: () => void;
  /** Visual variant matching shadcn/ui Button */
  variant?: 'default' | 'outline' | 'secondary';
  /** Button size */
  size?: 'sm' | 'default';
  /** Label text displayed beside the icon */
  label?: string;
  /** When true, shows a spinner and disables the button */
  loading?: boolean;
  /** Additional class names */
  className?: string;
}

/**
 * Reusable CSV download button component.
 *
 * Shows a Download icon with optional label text.
 * Displays a brief loading spinner when clicked, then
 * invokes the provided onClick handler to trigger the export.
 */
export default function ExportButton({
  onClick,
  variant = 'default',
  size = 'default',
  label = 'Export CSV',
  loading: externalLoading,
  className,
}: ExportButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);
  const isLoading = externalLoading ?? internalLoading;

  const handleClick = useCallback(() => {
    if (externalLoading !== undefined) {
      onClick?.();
      return;
    }

    setInternalLoading(true);
    requestAnimationFrame(() => {
      try {
        onClick?.();
      } finally {
        setTimeout(() => setInternalLoading(false), 600);
      }
    });
  }, [onClick, externalLoading]);

  return (
    <Button
      variant={variant}
      size={size === 'sm' ? 'sm' : 'default'}
      onClick={handleClick}
      disabled={isLoading}
      aria-busy={isLoading}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        <Download className="size-4" aria-hidden="true" />
      )}
      {label}
    </Button>
  );
}
