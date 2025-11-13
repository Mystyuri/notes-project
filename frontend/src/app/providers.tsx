'use client';

import { createContext, ReactNode, useContext, useMemo } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { getQueryClient } from '@/dal/query-client';
import { createOrpcClient } from '@/dal/api';

export const OrpcContext = createContext<ReturnType<typeof createOrpcClient> | null>(null);

export const useOrpc = () => {
  const orpc = useContext(OrpcContext);
  if (!orpc) {
    throw Error();
  }
  return orpc;
};

function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  const orpc = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const origin = window.location.origin.replace(/:\d+$/, '');
    const url = `${origin}/api/rpc`;

    return createOrpcClient(url);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OrpcContext.Provider value={orpc}>{children}</OrpcContext.Provider>
    </QueryClientProvider>
  );
}
export default Providers;
