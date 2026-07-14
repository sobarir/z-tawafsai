'use client';

import type {
  Package,
  Property,
  RateRule,
  RoomType,
  Season,
} from '@repo/shared';
import type { ColumnDef } from '@tanstack/react-table';
import { actionsColumn } from '@/components/shared/actions-column';

interface RateRuleColumnsOptions {
  columnLabels: {
    listing: string;
    season: string;
    roomType: string;
    band: string;
    amount: string;
  };
  properties: Property[];
  packages: Package[];
  seasons: Season[];
  roomTypes: RoomType[];
  noneLabel: string;
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
  packages,
  seasons,
  roomTypes,
  noneLabel,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
}: RateRuleColumnsOptions): ColumnDef<RateRule>[] {
  const listingName = (listingId: string): string => {
    const property = properties.find((p) => p.listingId === listingId);
    if (property) return property.displayName;
    const pkg = packages.find((p) => p.listingId === listingId);
    return pkg?.displayName ?? listingId;
  };
  const seasonName = (seasonId: string): string =>
    seasons.find((s) => s.id === seasonId)?.name ?? seasonId;
  const roomTypeName = (roomTypeId: string | null): string => {
    if (!roomTypeId) return noneLabel;
    return roomTypes.find((r) => r.id === roomTypeId)?.name ?? roomTypeId;
  };

  return [
    {
      id: 'listing',
      header: columnLabels.listing,
      cell: ({ row }) => listingName(row.original.listingId),
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
