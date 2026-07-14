'use client';

import { useTranslations } from 'next-intl';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface EntityDeleteConfirmProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  loading: boolean;
  onConfirm: () => void;
  namespace?: 'schedule' | 'catalog' | 'reference' | 'travelPackagesAdmin';
}

export function EntityDeleteConfirm({
  open,
  onOpenChange,
  name,
  loading,
  onConfirm,
  namespace = 'schedule',
}: EntityDeleteConfirmProps) {
  const t = useTranslations(namespace);
  const tCommon = useTranslations('common');

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('deleteConfirmTitle')}
      description={t('deleteConfirmDescription', { name })}
      confirmLabel={tCommon('delete')}
      cancelLabel={tCommon('cancel')}
      loading={loading}
      onConfirm={onConfirm}
    />
  );
}
