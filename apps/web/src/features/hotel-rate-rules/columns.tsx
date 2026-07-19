'use client';

import type { RateRule, RoomType, Season } from '@repo/shared';
import { Plus } from 'lucide-react';
import type { ReactNode } from 'react';
import type { Column } from 'react-data-grid';
import { RowActionsCell } from '@/components/shared/row-actions-cell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export type MasterRow = {
  type: 'MASTER';
  id: string; // propertyCode
  propertyName: string;
  expanded: boolean;
};

export type DetailRow = {
  type: 'DETAIL';
  id: string; // propertyCode + '-detail'
  parentId: string; // propertyCode
};

export type GridRow = MasterRow | DetailRow;

export interface DetailFilters {
  season: string;
  roomType: string;
  band: string;
  amount: string;
}

function FilterHeader({
  name,
  filterValue,
  onFilterChange,
}: {
  name: string;
  filterValue: string;
  onFilterChange: (val: string) => void;
}) {
  return (
    <div className="flex flex-col justify-end gap-1.5 py-1.5 w-full">
      <span className="font-semibold leading-none">{name}</span>
      <Input
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        placeholder={`Search...`}
        className="h-7 text-xs font-normal"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export function getMasterColumns({
  propertyLabel,
  filterValue,
  onFilterChange,
  toggleExpand,
  renderDetail,
}: {
  propertyLabel: string;
  filterValue: string;
  onFilterChange: (val: string) => void;
  toggleExpand: (propertyCode: string) => void;
  renderDetail: (propertyCode: string) => ReactNode;
}): Column<GridRow>[] {
  return [
    {
      key: 'expanded',
      name: '',
      minWidth: 40,
      width: 40,
      colSpan(args) {
        return args.type === 'ROW' && args.row.type === 'DETAIL'
          ? 2
          : undefined;
      },
      renderCell({ row }) {
        if (row.type === 'DETAIL') {
          return (
            <div className="p-4 bg-muted/30 h-full">
              {renderDetail(row.parentId)}
            </div>
          );
        }
        return (
          <button
            type="button"
            className="flex h-full w-full cursor-pointer items-center justify-center border-none bg-transparent"
            onClick={() => toggleExpand(row.id)}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              aria-hidden="true"
              className={`transition-transform ${row.expanded ? 'rotate-90' : ''}`}
            >
              <path
                d="M4 2 L10 7 L4 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        );
      },
    },
    {
      key: 'property',
      name: propertyLabel,
      renderHeaderCell: () => (
        <FilterHeader
          name={propertyLabel}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
        />
      ),
      renderCell({ row }) {
        if (row.type === 'DETAIL') return null;
        return <span className="font-medium">{row.propertyName}</span>;
      },
    },
  ];
}

interface DetailColumnsOptions {
  columnLabels: {
    season: string;
    roomType: string;
    band: string;
    amount: string;
  };
  standardSeasonLabel: string;
  seasons: Season[];
  roomTypes: RoomType[];
  actionsLabel: string;
  openMenuLabel: string;
  editLabel: string;
  deleteLabel: string;
  onEdit: (rateRule: RateRule) => void;
  onDelete: (rateRule: RateRule) => void;
  onCreate: () => void;
  filters: DetailFilters;
  onFilterChange: (filters: DetailFilters) => void;
}

export function getDetailColumns({
  columnLabels,
  standardSeasonLabel,
  seasons,
  roomTypes,
  actionsLabel,
  openMenuLabel,
  editLabel,
  deleteLabel,
  onEdit,
  onDelete,
  onCreate,
  filters,
  onFilterChange,
}: DetailColumnsOptions): Column<RateRule>[] {
  const seasonName = (seasonId: string | null): string =>
    seasonId
      ? (seasons.find((s) => s.id === seasonId)?.name ?? seasonId)
      : standardSeasonLabel;
  const roomTypeName = (roomTypeId: string): string =>
    roomTypes.find((r) => r.id === roomTypeId)?.name ?? roomTypeId;

  return [
    {
      key: 'season',
      name: columnLabels.season,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.season}
          filterValue={filters.season}
          onFilterChange={(v) => onFilterChange({ ...filters, season: v })}
        />
      ),
      renderCell: ({ row }) => seasonName(row.seasonId),
    },
    {
      key: 'roomType',
      name: columnLabels.roomType,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.roomType}
          filterValue={filters.roomType}
          onFilterChange={(v) => onFilterChange({ ...filters, roomType: v })}
        />
      ),
      renderCell: ({ row }) => roomTypeName(row.roomTypeId),
    },
    {
      key: 'band',
      name: columnLabels.band,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.band}
          filterValue={filters.band}
          onFilterChange={(v) => onFilterChange({ ...filters, band: v })}
        />
      ),
      renderCell: ({ row }) => `${row.minOccupancy}–${row.maxOccupancy}`,
    },
    {
      key: 'amount',
      name: columnLabels.amount,
      renderHeaderCell: () => (
        <FilterHeader
          name={columnLabels.amount}
          filterValue={filters.amount}
          onFilterChange={(v) => onFilterChange({ ...filters, amount: v })}
        />
      ),
      renderCell: ({ row }) => `${row.amount} ${row.currency}`,
    },
    {
      key: 'actions',
      name: actionsLabel,
      width: 80,
      renderHeaderCell: () => (
        <div className="flex flex-col h-full justify-end items-center gap-1.5 py-1.5 w-full">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={onCreate}
          >
            <Plus className="h-4 w-4" />
          </Button>
          <span className="font-semibold leading-none">{actionsLabel}</span>
        </div>
      ),
      renderCell: ({ row }) => (
        <RowActionsCell
          openMenuLabel={openMenuLabel}
          actions={[
            { label: editLabel, onClick: () => onEdit(row) },
            {
              label: deleteLabel,
              onClick: () => onDelete(row),
              destructive: true,
            },
          ]}
        />
      ),
    },
  ];
}
