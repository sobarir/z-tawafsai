'use client';

import { useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import type { PackageCategory } from '@/features/landing/data/packages';
import { cn } from '@/libs/utils';

export interface PackageRow {
  slug: string;
  category: PackageCategory;
  node: React.ReactNode;
}

const toggleItemClass = cn(
  'rounded-full border border-line bg-paper px-4 py-2 text-[.8rem] font-semibold text-landing-muted transition-colors',
  'hover:border-brand-600 hover:text-brand-700',
  'data-[state=on]:border-brand-900 data-[state=on]:bg-brand-900 data-[state=on]:text-white',
);

export function PackageFilterRows({
  rows,
  labels,
}: {
  rows: PackageRow[];
  labels: Record<PackageCategory | 'all', string>;
}) {
  const [filter, setFilter] = useState<PackageCategory | 'all'>('all');

  return (
    <div>
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(value) => {
          if (value) setFilter(value as PackageCategory | 'all');
        }}
        className="mb-[18px] flex flex-wrap gap-[7px]"
      >
        {(Object.entries(labels) as [PackageCategory | 'all', string][]).map(
          ([value, label]) => (
            <ToggleGroupItem
              key={value}
              value={value}
              className={toggleItemClass}
            >
              {label}
            </ToggleGroupItem>
          ),
        )}
      </ToggleGroup>

      <div className="flex flex-col gap-[18px]">
        {rows.map((row) => (
          <div
            key={row.slug}
            className={cn(
              'grid items-stretch gap-[18px] min-[861px]:grid-cols-[1fr_340px]',
              filter !== 'all' && filter !== row.category && 'hidden',
            )}
          >
            {row.node}
          </div>
        ))}
      </div>
    </div>
  );
}
