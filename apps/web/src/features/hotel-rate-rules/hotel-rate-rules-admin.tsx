'use client';

import type { RateRule } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';
import { DataGrid, TreeDataGrid } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';
import { EntityDeleteConfirm } from '@/components/shared/entity-delete-confirm';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { Button } from '@/components/ui/button';
import {
  getListHotelRateRulesQueryKey,
  useCreateHotelRateRule,
  useDeleteHotelRateRule,
  useListHotelCurrencies,
  useListHotelProperties,
  useListHotelRateRules,
  useListHotelRoomTypes,
  useListHotelSeasons,
  useUpdateHotelRateRule,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';
import {
  type DetailFilters,
  type GridRow,
  getDetailColumns,
  getMasterColumns,
} from './columns';
import { RateRuleForm } from './rate-rule-form';

export function HotelRateRulesAdmin() {
  const t = useTranslations('catalog.rateRules');
  const tCatalog = useTranslations('catalog');
  const tCommon = useTranslations('common');

  const { data: rateRules, isLoading } = useListHotelRateRules();
  const { data: properties } = useListHotelProperties();
  const { data: seasons } = useListHotelSeasons();
  const { data: roomTypes } = useListHotelRoomTypes();
  const { data: currencies } = useListHotelCurrencies();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<RateRule | null>(null);
  const [deleting, setDeleting] = useState<RateRule | null>(null);
  const [initialPropertyCode, setInitialPropertyCode] = useState<
    string | undefined
  >();

  const feedback = useCrudFeedback(getListHotelRateRulesQueryKey(), 'catalog');

  const createMutation = useCreateHotelRateRule({
    mutation: crudMutationOptions(feedback, 'createSuccess', () =>
      setFormOpen(false),
    ),
  });
  const updateMutation = useUpdateHotelRateRule({
    mutation: crudMutationOptions(feedback, 'updateSuccess', () => {
      setFormOpen(false);
      setEditing(null);
    }),
  });
  const deleteMutation = useDeleteHotelRateRule({
    mutation: crudMutationOptions(feedback, 'deleteSuccess', () =>
      setDeleting(null),
    ),
  });

  const [filters, setFilters] = useState<DetailFilters>({
    season: '',
    roomType: '',
    band: '',
    amount: '',
  });

  const [propertyFilter, setPropertyFilter] = useState('');
  const [expandedMasterIds, setExpandedMasterIds] = useState<Set<string>>(
    () => new Set(),
  );

  const filteredRateRules = useMemo(() => {
    if (!rateRules) return [];
    return rateRules.filter((r) => {
      const seasonName = r.seasonId
        ? (seasons?.find((s) => s.id === r.seasonId)?.name?.toLowerCase() ??
          r.seasonId.toLowerCase())
        : t('standardSeason').toLowerCase();
      const roomTypeName =
        roomTypes?.find((rt) => rt.id === r.roomTypeId)?.name?.toLowerCase() ??
        r.roomTypeId.toLowerCase();
      const band = `${r.minOccupancy}–${r.maxOccupancy}`.toLowerCase();
      const amount = `${r.amount} ${r.currency}`.toLowerCase();

      return (
        seasonName.includes(filters.season.toLowerCase()) &&
        roomTypeName.includes(filters.roomType.toLowerCase()) &&
        band.includes(filters.band.toLowerCase()) &&
        amount.includes(filters.amount.toLowerCase())
      );
    });
  }, [rateRules, filters, seasons, roomTypes, t]);

  const gridRows = useMemo(() => {
    const rows: GridRow[] = [];
    const propertyCodes = Array.from(
      new Set(rateRules?.map((r) => r.propertyCode) ?? []),
    );

    for (const code of propertyCodes) {
      const propertyName =
        properties?.find((p) => p.propertyCode === code)?.displayName ?? code;

      if (
        propertyFilter &&
        !propertyName.toLowerCase().includes(propertyFilter.toLowerCase()) &&
        !code.toLowerCase().includes(propertyFilter.toLowerCase())
      ) {
        continue;
      }

      const isExpanded = expandedMasterIds.has(code);
      rows.push({
        type: 'MASTER',
        id: code,
        propertyName,
        expanded: isExpanded,
      });

      if (isExpanded) {
        rows.push({
          type: 'DETAIL',
          id: `${code}-detail`,
          parentId: code,
        });
      }
    }
    return rows;
  }, [rateRules, properties, expandedMasterIds, propertyFilter]);

  const toggleExpand = useCallback((propertyCode: string) => {
    setExpandedMasterIds((prev) => {
      const next = new Set(prev);
      if (next.has(propertyCode)) {
        next.delete(propertyCode);
      } else {
        next.add(propertyCode);
      }
      return next;
    });
  }, []);

  function DetailGrid({
    propertyCode,
    filteredRateRules,
    detailCols,
    seasons,
    standardSeasonLabel,
  }: {
    propertyCode: string;
    filteredRateRules: RateRule[];
    detailCols: any[];
    seasons: any[];
    standardSeasonLabel: string;
  }) {
    const propertyRules = useMemo(() => {
      return filteredRateRules
        .filter((r) => r.propertyCode === propertyCode)
        .map((r) => ({
          ...r,
          season: r.seasonId
            ? (seasons?.find((s) => s.id === r.seasonId)?.name ?? r.seasonId)
            : standardSeasonLabel,
        }));
    }, [filteredRateRules, propertyCode, seasons, standardSeasonLabel]);

    const [expandedGroupIds, setExpandedGroupIds] = useState<
      ReadonlySet<unknown>
    >(() => new Set(propertyRules.map((r) => r.season)));

    return (
      <div className="border bg-background shadow-sm rounded-md overflow-hidden h-full flex flex-col">
        <TreeDataGrid
          columns={detailCols}
          rows={propertyRules}
          rowKeyGetter={(row) => row.id}
          groupBy={['season']}
          rowGrouper={(rows, columnKey) => {
            const groups: Record<string, any[]> = {};
            for (const row of rows) {
              const key = String((row as any)[columnKey]);
              groups[key] ??= [];
              groups[key].push(row);
            }
            return groups;
          }}
          expandedGroupIds={expandedGroupIds}
          onExpandedGroupIdsChange={setExpandedGroupIds}
          className="rdg-light h-full"
          headerRowHeight={64}
        />
      </div>
    );
  }

  const renderDetail = useCallback(
    (propertyCode: string) => {
      const detailCols = getDetailColumns({
        columnLabels: {
          season: t('columns.season'),
          roomType: t('columns.roomType'),
          band: t('columns.band'),
          amount: t('columns.amount'),
        },
        standardSeasonLabel: t('standardSeason'),
        seasons: seasons ?? [],
        roomTypes: roomTypes ?? [],
        actionsLabel: tCatalog('actions'),
        openMenuLabel: tCatalog('openMenu'),
        editLabel: tCommon('edit'),
        deleteLabel: tCommon('delete'),
        onEdit: (rateRule) => {
          setEditing(rateRule);
          setFormOpen(true);
        },
        onDelete: (rateRule) => setDeleting(rateRule),
        onCreate: () => {
          setEditing(null);
          setInitialPropertyCode(propertyCode);
          setFormOpen(true);
        },
        filters,
        onFilterChange: setFilters,
      });

      return (
        <DetailGrid
          propertyCode={propertyCode}
          filteredRateRules={filteredRateRules}
          detailCols={detailCols}
          seasons={seasons ?? []}
          standardSeasonLabel={t('standardSeason')}
        />
      );
    },
    [
      filteredRateRules,
      t,
      seasons,
      roomTypes,
      tCatalog,
      tCommon,
      filters,
      DetailGrid,
    ],
  );

  const masterColumns = useMemo(() => {
    return getMasterColumns({
      propertyLabel: t('columns.property'),
      filterValue: propertyFilter,
      onFilterChange: setPropertyFilter,
      toggleExpand,
      renderDetail,
    });
  }, [t, propertyFilter, toggleExpand, renderDetail]);

  const submitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <div className="flex items-center justify-end">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setEditing(null);
            setInitialPropertyCode(undefined);
            setFormOpen(true);
          }}
        >
          {tCatalog('createButton')}
        </Button>
      </div>

      <div
        className={`flex flex-col flex-1 min-h-[500px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
      >
        <DataGrid
          columns={masterColumns}
          rows={gridRows}
          className="rdg-light flex-1 min-h-[500px]"
          headerRowHeight={64}
          rowHeight={(row) => {
            if (row.type === 'DETAIL') {
              const rules = filteredRateRules.filter(
                (r) => r.propertyCode === row.parentId,
              );
              const count = rules.length;
              const uniqueSeasonsCount = new Set(rules.map((r) => r.seasonId))
                .size;
              // 32px padding (p-4), 64px header, 35px per row, 35px per group header, +16px buffer
              return 32 + 64 + (count + uniqueSeasonsCount) * 35 + 18;
            }
            return 35;
          }}
        />
      </div>

      <EntityFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        title={editing ? t('editTitle') : t('createTitle')}
      >
        <RateRuleForm
          rateRule={editing ?? undefined}
          initialPropertyCode={initialPropertyCode}
          properties={properties ?? []}
          seasons={seasons ?? []}
          roomTypes={roomTypes ?? []}
          currencies={currencies ?? []}
          submitting={submitting}
          onCancel={() => setFormOpen(false)}
          onSubmit={async (values) => {
            if (editing) {
              await updateMutation.mutateAsync({
                id: editing.id,
                data: {
                  seasonId: values.seasonId,
                  roomTypeId: values.roomTypeId,
                  minOccupancy: values.minOccupancy,
                  maxOccupancy: values.maxOccupancy,
                  amount: values.amount,
                  currency: values.currency,
                },
              });
            } else {
              await createMutation.mutateAsync({ data: values });
            }
          }}
        />
      </EntityFormDialog>

      <EntityDeleteConfirm
        namespace="catalog"
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(null)}
        name={
          deleting ? `${deleting.minOccupancy}-${deleting.maxOccupancy}` : ''
        }
        loading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleting) deleteMutation.mutate({ id: deleting.id });
        }}
      />
    </div>
  );
}
