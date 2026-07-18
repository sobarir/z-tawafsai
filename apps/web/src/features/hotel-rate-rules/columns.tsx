'use client';

import type { Property, RateRule, RoomType, Season } from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface RateRuleColumnsOptions {
  columnLabels: {
    property: string;
    season: string;
    roomType: string;
    band: string;
    amount: string;
  };
  properties: Property[];
  seasons: Season[];
  roomTypes: RoomType[];
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (rateRule: RateRule) => void;
  onDelete: (rateRule: RateRule) => void;
}

export function getRateRuleColumns({
  columnLabels,
  properties,
  seasons,
  roomTypes,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: RateRuleColumnsOptions): ColumnDef<RateRule>[] {
  const propertyName = (propertyCode: string): string =>
    properties.find((p) => p.propertyCode === propertyCode)?.displayName ??
    propertyCode;
  const seasonName = (seasonId: string): string =>
    seasons.find((s) => s.id === seasonId)?.name ?? seasonId;
  const roomTypeName = (roomTypeId: string): string =>
    roomTypes.find((r) => r.id === roomTypeId)?.name ?? roomTypeId;

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
    {
      id: 'roomType',
      header: columnLabels.roomType,
      cell: ({ row }) => roomTypeName(row.original.roomTypeId),
    },
    {
      id: 'band',
      header: columnLabels.band,
      cell: ({ row }) =>
        `${row.original.minOccupancy}–${row.original.maxOccupancy}`,
    },
    {
      id: 'amount',
      header: columnLabels.amount,
      cell: ({ row }) => `${row.original.amount} ${row.original.currency}`,
    },
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
