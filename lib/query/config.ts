/**
 * TanStack Query configuration
 */

import { CACHE_DURATION } from '@/lib/constants/time';

export const queryConfig = {
  tasks: {
    staleTime: CACHE_DURATION.FIVE_SECONDS,
    gcTime: CACHE_DURATION.THIRTY_MINUTES,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  notifications: {
    staleTime: CACHE_DURATION.THIRTY_SECONDS,
    gcTime: CACHE_DURATION.THIRTY_MINUTES,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  users: {
    staleTime: CACHE_DURATION.FIVE_MINUTES,
    gcTime: CACHE_DURATION.THIRTY_MINUTES,
    refetchOnWindowFocus: false,
    retry: 1,
  },
  analytics: {
    staleTime: CACHE_DURATION.FIVE_MINUTES,
    gcTime: CACHE_DURATION.THIRTY_MINUTES,
    refetchOnWindowFocus: false,
    retry: 1,
  },
} as const;

