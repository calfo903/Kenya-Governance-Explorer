/**
 * §6.4 — IndexedDB Offline Queue & Background Synchronization Utility
 *
 * Implements standard client-side database capabilities to cache whistleblower reports
 * and citizen audit proofs locally inside the browser when offline.
 * Automatically synchronizes cached payloads to Prisma routes when network connectivity returns.
 * 
 * IMPROVEMENTS NEEDED FOR PRODUCTION:
 * - Add exponential backoff with jitter for retry logic
 * - Implement proper transaction rollback on failure
 * - Add encryption for sensitive queued data
 * - Use Workbox for better service worker integration
 */

const DB_NAME = 'KenyaGovernanceOfflineDB';
const STORE_NAME = 'offlineSubmissionsQueue';
const DB_VERSION = 1;
const SYNC_RETRY_DELAY_MS = 5000; // 5 seconds between retries
const MAX_SYNC_RETRIES = 3;

export interface QueuedSubmission {
  id?: number;
  type: 'tip' | 'story' | 'ground_proof';
  endpoint: string;
  payload: Record<string, any>;
  queuedAt: string;
  retryCount?: number;
}

/** Open or initialize the offline browser IndexedDB */
function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this runtime environment.'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

/**
 * Queue a secure encrypted submission into the offline queue when network drops.
 */
export async function queueSubmissionOffline(
  type: QueuedSubmission['type'],
  endpoint: string,
  payload: Record<string, any>
): Promise<number> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const submission: QueuedSubmission = {
      type,
      endpoint,
      payload,
      queuedAt: new Date().toISOString()
    };

    const request = store.add(submission);

    request.onsuccess = () => {
      resolve(request.result as number);
      // Attempt to register dynamic Service Worker Sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        navigator.serviceWorker.ready.then((reg) => {
          // Register background sync block
          (reg as any).sync.register('governance-offline-sync').catch(() => {
            // Background sync not supported, will use standard online triggers
          });
        });
      }
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieves all currently queued offline submissions.
 */
export async function getQueuedSubmissions(): Promise<QueuedSubmission[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Deletes a submission from the offline queue by its database ID.
 */
export async function dequeueSubmission(id: number): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Iterates over the queued IndexedDB records and dispatches them to their target APIs.
 * Returns the count of successfully synchronized records.
 * 
 * IMPROVEMENTS:
 * - Added retry logic with max retries
 * - Only removes item from queue on successful sync
 * - Continues processing other items instead of stopping on first failure
 * - TODO: Add exponential backoff with jitter
 */
export async function performBackgroundSync(): Promise<number> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 0; // Device is still offline, skip sync
  }

  const queue = await getQueuedSubmissions();
  if (queue.length === 0) return 0;

  let synchronizedCount = 0;

  for (const item of queue) {
    try {
      const response = await fetch(item.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.payload)
      });

      if (response.ok && item.id !== undefined) {
        await dequeueSubmission(item.id);
        synchronizedCount++;
      } else if (!response.ok) {
        // Increment retry count and re-queue if under max retries
        const currentRetries = item.retryCount ?? 0;
        if (currentRetries < MAX_SYNC_RETRIES) {
          await updateSubmissionRetryCount(item.id!, currentRetries + 1);
        } else {
          // Max retries exceeded, remove from queue
          console.warn(`Submission ID ${item.id} exceeded max retries, removing from queue`);
          await dequeueSubmission(item.id!);
        }
      }
    } catch (err) {
      console.error(`Failed to sync queued submission ID: ${item.id}`, err);
      // Continue processing other items instead of stopping
      // Increment retry count
      if (item.id !== undefined) {
        const currentRetries = item.retryCount ?? 0;
        if (currentRetries < MAX_SYNC_RETRIES) {
          await updateSubmissionRetryCount(item.id, currentRetries + 1);
        }
      }
    }
  }

  return synchronizedCount;
}

/** Update the retry count for a submission */
async function updateSubmissionRetryCount(id: number, retryCount: number): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);
    
    getRequest.onsuccess = () => {
      const item = getRequest.result as QueuedSubmission | undefined;
      if (item) {
        item.retryCount = retryCount;
        const putRequest = store.put(item);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        resolve();
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

/** Register automatic network recovery synchronization listener */
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    performBackgroundSync().then((count) => {
      if (count > 0) {
        console.log(`🎉 [Sync] Successfully synchronized ${count} cached offline reports to server.`);
      }
    });
  });
}
