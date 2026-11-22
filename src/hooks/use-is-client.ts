'use client';

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => undefined;

/** True after client hydration; false during SSR. */
export function useIsClient() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
