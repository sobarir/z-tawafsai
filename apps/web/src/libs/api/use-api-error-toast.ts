'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { ApiError } from './mutator';

export function useApiErrorToast() {
  const tErrors = useTranslations('errors');

  return useCallback(
    (error: unknown) => {
      toast.error(
        error instanceof ApiError ? error.message : tErrors('generic'),
      );
    },
    [tErrors],
  );
}
