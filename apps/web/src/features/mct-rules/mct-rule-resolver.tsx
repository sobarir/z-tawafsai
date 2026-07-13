'use client';

import type { Airline, Airport } from '@repo/shared';
import { mctScopeSchema } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useResolveMctRule } from '@/libs/api/generated/endpoints';
import type { ResolveMctRuleParams } from '@/libs/api/generated/models';
import { ApiError } from '@/libs/api/mutator';
import { toAirlineOptions, toAirportOptions } from '@/libs/combobox-options';

interface MctRuleResolverProps {
  airports: Airport[];
  airlines: Airline[];
}

const EMPTY_QUERY: ResolveMctRuleParams = {
  arrivalAirport: '',
  departureAirport: '',
  scope: 'DD',
};

export function MctRuleResolver({ airports, airlines }: MctRuleResolverProps) {
  const t = useTranslations('schedule.mctRules');
  const tFields = useTranslations('schedule.mctRules.fields');
  const tColumns = useTranslations('schedule.mctRules.columns');

  const airportOptions = toAirportOptions(airports);
  const airlineOptions = toAirlineOptions(airlines);

  const [query, setQuery] = useState<ResolveMctRuleParams>(EMPTY_QUERY);

  const { data, error, isFetching, refetch, isFetched } = useResolveMctRule(
    query,
    { query: { enabled: false } },
  );

  const canResolve = !!query.arrivalAirport && !!query.departureAirport;
  const notFound =
    isFetched && error instanceof ApiError && error.status === 404;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('resolverTitle')}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {t('resolverDescription')}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabeledCombobox
            label={tFields('arrivalAirport')}
            options={airportOptions}
            value={query.arrivalAirport}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, arrivalAirport: value }))
            }
          />

          <LabeledCombobox
            label={tFields('departureAirport')}
            options={airportOptions}
            value={query.departureAirport}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, departureAirport: value }))
            }
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>{tFields('scope')}</Label>
          <Select
            value={query.scope}
            onValueChange={(value) =>
              setQuery((prev) => ({
                ...prev,
                scope: value as ResolveMctRuleParams['scope'],
              }))
            }
          >
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mctScopeSchema.options.map((scope) => (
                <SelectItem key={scope} value={scope}>
                  {scope}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LabeledCombobox
            label={tFields('arrivalAirline')}
            options={airlineOptions}
            value={query.arrivalAirline}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, arrivalAirline: value }))
            }
          />

          <LabeledCombobox
            label={tFields('departureAirline')}
            options={airlineOptions}
            value={query.departureAirline}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, departureAirline: value }))
            }
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label>{tFields('arrivalTerminal')}</Label>
            <Input
              value={query.arrivalTerminal ?? ''}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  arrivalTerminal: e.target.value || undefined,
                }))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>{tFields('departureTerminal')}</Label>
            <Input
              value={query.departureTerminal ?? ''}
              onChange={(e) =>
                setQuery((prev) => ({
                  ...prev,
                  departureTerminal: e.target.value || undefined,
                }))
              }
            />
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="w-fit"
          disabled={!canResolve}
          loading={isFetching}
          onClick={() => refetch()}
        >
          {t('resolverButton')}
        </Button>

        {isFetched && !isFetching ? (
          notFound ? (
            <p className="text-sm text-muted-foreground">
              {t('resolverNoMatch')}
            </p>
          ) : data ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
              <dt className="text-muted-foreground">
                {tColumns('mctMinutes')}
              </dt>
              <dd>{data.mctMinutes}</dd>
              <dt className="text-muted-foreground">
                {tColumns('maxConnectionMinutes')}
              </dt>
              <dd>{data.maxConnectionMinutes}</dd>
            </dl>
          ) : null
        ) : null}
      </CardContent>
    </Card>
  );
}
