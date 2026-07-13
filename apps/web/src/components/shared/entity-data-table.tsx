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
}

/** DataTable pre-wired with the schedule admin screens' shared i18n labels. */
export function EntityDataTable<TData, TValue>({
  columns,
  data,
  isLoading,
  toolbar,
}: EntityDataTableProps<TData, TValue>) {
  const tSchedule = useTranslations('schedule');
  const tCommon = useTranslations('common');

  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
      loadingMessage={tSchedule('loadingRows')}
      emptyMessage={tSchedule('noResults')}
      searchPlaceholder={tSchedule('searchPlaceholder')}
      previousLabel={tCommon('previous')}
      nextLabel={tCommon('next')}
      pageLabel={(current, total) => tSchedule('pageOf', { current, total })}
      toolbar={toolbar}
    />
  );
}
