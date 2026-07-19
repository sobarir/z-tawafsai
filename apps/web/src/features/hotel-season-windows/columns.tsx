'use client';

import type { Property, Season, SeasonWindow } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface SeasonWindowColumnsOptions {
  columnLabels: {
    property: string;
    season: string;
    startDate: string;
    endDate: string;
  };
  properties: Property[];
  seasons: Season[];
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (window: SeasonWindow) => void;
  onDelete: (window: SeasonWindow) => void;
}

export function getSeasonWindowColumns({
  columnLabels,
  properties,
  seasons,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: SeasonWindowColumnsOptions): ColumnDef<SeasonWindow>[] {
  const propertyName = (propertyCode: string): string =>
    properties.find((p) => p.propertyCode === propertyCode)?.displayName ??
    propertyCode;
  const seasonName = (seasonId: string): string =>
    seasons.find((s) => s.id === seasonId)?.name ?? seasonId;

  return [
    {
      id: 'property',
      header: columnLabels.property,
      cell: ({ row }) => propertyName(row.original.propertyCode),
    },
    {
      id: 'season',
      header: columnLabels.season,
      cell: ({ row }) => seasonName(row.original.seasonId),
    },
    { accessorKey: 'startDate', header: columnLabels.startDate },
    { accessorKey: 'endDate', header: columnLabels.endDate },
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
