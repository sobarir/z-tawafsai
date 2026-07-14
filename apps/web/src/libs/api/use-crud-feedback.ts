'use client';

import { type QueryKey, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useApiErrorToast } from './use-api-error-toast';

type CrudMessageKey = 'createSuccess' | 'updateSuccess' | 'deleteSuccess';

/** Wires the toast + query-invalidation side effects shared by every entity's create/update/delete mutations. */
export function useCrudFeedback(
  queryKey: QueryKey,
  namespace:
    | 'schedule'
    | 'catalog'
    | 'reference'
    | 'travelPackagesAdmin' = 'schedule',
) {
  const queryClient = useQueryClient();
  const tNamespace = useTranslations(namespace);
  const onError = useApiErrorToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey });

  const onSuccess = (messageKey: CrudMessageKey, after?: () => void) => () => {
    toast.success(tNamespace(messageKey));
    invalidate();
    after?.();
  };

  return { onSuccess, onError, invalidate };
}

type CrudFeedback = ReturnType<typeof useCrudFeedback>;

/** Builds the `{ onSuccess, onError }` mutation option pair shared by every entity's create/update/delete mutations. */
export function crudMutationOptions(
  feedback: CrudFeedback,
  messageKey: CrudMessageKey,
  after?: () => void,
) {
  return {
    onSuccess: feedback.onSuccess(messageKey, after),
    onError: feedback.onError,
  };
}
