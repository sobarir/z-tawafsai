'use client';

import type { Airport } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toAirportOptions } from '@/libs/combobox-options';

export interface FlightSearchQuery {
  originAirport: string;
  destAirport: string;
  date: string;
}

interface FlightSearchFormProps {
  airports: Airport[];
  query: FlightSearchQuery;
  onQueryChange: (query: FlightSearchQuery) => void;
  onSearch: () => void;
  searching: boolean;
}

export function FlightSearchForm({
  airports,
  query,
  onQueryChange,
  onSearch,
  searching,
}: FlightSearchFormProps) {
  const t = useTranslations('flightSearch');

  const airportOptions = toAirportOptions(airports);
  const canSearch =
    !!query.originAirport && !!query.destAirport && !!query.date;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <LabeledCombobox
          label={t('originAirport')}
          options={airportOptions}
          value={query.originAirport}
          onChange={(value) =>
            onQueryChange({ ...query, originAirport: value })
          }
        />

        <LabeledCombobox
          label={t('destAirport')}
          options={airportOptions}
          value={query.destAirport}
          onChange={(value) => onQueryChange({ ...query, destAirport: value })}
        />

        <div className="flex flex-col gap-2">
          <Label>{t('date')}</Label>
          <Input
            type="date"
            value={query.date}
            onChange={(e) => onQueryChange({ ...query, date: e.target.value })}
          />
        </div>
      </div>

      <Button
        type="button"
        className="w-fit"
        disabled={!canSearch}
        loading={searching}
        onClick={onSearch}
      >
        {t('searchButton')}
      </Button>
    </div>
  );
}
