'use client';

import type { City } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface CityColumnsOptions {
  columnLabels: {
    cityCode: string;
    name: string;
    countryCode: string;
  };
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (city: City) => void;
  onDelete: (city: City) => void;
}

export function getCityColumns({
  columnLabels,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: CityColumnsOptions): ColumnDef<City>[] {
  return [
    { accessorKey: 'cityCode', header: columnLabels.cityCode },
    { accessorKey: 'name', header: columnLabels.name },
    { accessorKey: 'countryCode', header: columnLabels.countryCode },
    actionsColumn({
      actionsLabel,
      openMenuLabel,
      editLabel,
      deleteLabel,
      onEdit,
      onDelete,
    }),
  ];
}
