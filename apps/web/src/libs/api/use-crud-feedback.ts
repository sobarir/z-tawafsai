'use client';

import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useApiErrorToast } from './use-api-error-toast';

type CrudMessageKey = 'createSuccess' | 'updateSuccess' | 'deleteSuccess';

/** Wires the toast + query-invalidation side effects shared by every entity's create/update/delete mutations. */
export function useCrudFeedback(queryKey: QueryKey) {
  const queryClient = useQueryClient();
  const tSchedule = useTranslations('schedule');
  const onError = useApiErrorToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const onSuccess = (messageKey: CrudMessageKey, after?: () => void) => () => {
    toast.success(tSchedule(messageKey));
    invalidate();
    after?.();
  };

  return { onSuccess, onError, invalidate };
}
