'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from '@/lib/store/store';

/**
 * StoreProvider component jo Next.js App Router mein store ko initialize karta hai.
 * 'useRef' ka istemal isliye hai taaki refresh par store dubara create na ho.
 */
export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);
  
  if (!storeRef.current) {
    // Pehli baar store create ho raha hai
    storeRef.current = makeStore();
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}