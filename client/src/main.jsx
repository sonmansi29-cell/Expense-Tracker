import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once on failure to avoid infinite loops
      staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
      gcTime: 5 * 60 * 1000, // Cache garbage collection time (formerly cacheTime)
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      throwOnError: false, // Don't throw errors (allows error handling in components)
    },
    mutations: {
      retry: 0, // Don't retry mutations
    },
  },
});

// Listen for auth:logout events from API interceptor and clear queries
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    // Clear all cached queries on logout
    queryClient.clear();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
