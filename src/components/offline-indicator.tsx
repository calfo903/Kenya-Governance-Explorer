'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { WifiOff } from 'lucide-react';

function subscribe(onStoreChange: () => void) {
  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);
  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
}

function getSnapshot() {
  return !navigator.onLine;
}

function getServerSnapshot() {
  return false;
}

export function OfflineIndicator() {
  const offline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!offline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] flex items-center justify-center gap-2 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-md">
      <WifiOff className="h-4 w-4" />
      <span>You are offline — showing cached data</span>
    </div>
  );
}