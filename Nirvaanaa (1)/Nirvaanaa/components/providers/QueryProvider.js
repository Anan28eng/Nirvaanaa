'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { SessionProvider } from 'next-auth/react';

export default function QueryProvider({ children }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 10 * 60 * 1000, // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SessionAwareDevtools />
        {children}
      </QueryClientProvider>
    </SessionProvider>
  );
}

function SessionAwareDevtools() {
  const { data: session } = useSession();
  return session?.user?.role === 'admin' ? (
    <ReactQueryDevtools initialIsOpen={false} />
  ) : null;
}

