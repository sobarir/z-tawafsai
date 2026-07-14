'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { DataTable } from './data-table';

interface EntityDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  toolbar?: ReactNode;
  /** Which top-level i18n namespace to pull the shared admin-table labels from. */
  namespace?: 'schedule' | 'catalog';
}

/** DataTable pre-wired with an admin domain's shared i18n labels (schedule, catalog, ...). */
export function EntityDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  toolbar,
  namespace = 'schedule',
}: EntityDataTableProps<TData, TValue>) {
  const tNamespace = useTranslations(namespace);
  const tCommon = useTranslations('common');

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      loadingMessage={tNamespace('loadingRows')}
      emptyMessage={tNamespace('noResults')}
      searchPlaceholder={tNamespace('searchPlaceholder')}
      previousLabel={tCommon('previous')}
      nextLabel={tCommon('next')}
      pageLabel={(current, total) => tNamespace('pageOf', { current, total })}
      toolbar={toolbar}
    />
  );
}
