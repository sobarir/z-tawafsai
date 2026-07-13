'use client';

import type { Airline } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResolveInterline } from '@/libs/api/generated/endpoints';
import type { ResolveInterlineParams } from '@/libs/api/generated/models';
import { toAirlineOptions } from '@/libs/combobox-options';

interface InterlineResolverProps {
  airlines: Airline[];
}

export function InterlineResolver({ airlines }: InterlineResolverProps) {
  const t = useTranslations('schedule.interlineAgreements');
  const tFields = useTranslations('schedule.interlineAgreements.fields');
  const tCommon = useTranslations('common');

  const airlineOptions = toAirlineOptions(airlines);

  const [query, setQuery] = useState<ResolveInterlineParams>({
    inboundAirline: '',
    outboundAirline: '',
  });

  const { data, isFetching, refetch, isFetched } = useResolveInterline(query, {
    query: { enabled: false },
  });

  const canResolve = !!query.inboundAirline && !!query.outboundAirline;

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
            label={tFields('inboundAirline')}
            options={airlineOptions}
            value={query.inboundAirline}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, inboundAirline: value }))
            }
          />

          <LabeledCombobox
            label={tFields('outboundAirline')}
            options={airlineOptions}
            value={query.outboundAirline}
            onChange={(value) =>
              setQuery((prev) => ({ ...prev, outboundAirline: value }))
            }
          />
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

        {isFetched && !isFetching && data ? (
          <div className="flex flex-col gap-2 text-sm">
            <p>
              {data.online
                ? t('resolverOnline')
                : data.permitted
                  ? t('resolverPermitted')
                  : t('resolverNotPermitted')}
            </p>
            <Badge
              variant={data.bagThroughChecked ? 'success' : 'outline'}
              className="w-fit"
            >
              {tFields('bagThroughChecked')}:{' '}
              {data.bagThroughChecked ? tCommon('yes') : tCommon('no')}
            </Badge>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
