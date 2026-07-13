'use client';

import type { ConnectionResult } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const KIND_VARIANT: Record<
  ConnectionResult['kind'],
  'success' | 'secondary' | 'warning' | 'destructive'
> = {
  connection: 'success',
  stopover: 'secondary',
  open_jaw: 'secondary',
  transit: 'secondary',
  invalid: 'destructive',
};

export function ConnectionResultCard({ result }: { result: ConnectionResult }) {
  const t = useTranslations('schedule.connections');
  const tCommon = useTranslations('common');
  const yesNo = (value: boolean) => (value ? tCommon('yes') : tCommon('no'));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t('resultTitle')}
          <Badge variant={KIND_VARIANT[result.kind]}>
            {t(`kind.${result.kind}`)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
          <dt className="text-muted-foreground">{t('resultGap')}</dt>
          <dd>{result.gapMinutes ?? '—'}</dd>

          <dt className="text-muted-foreground">{t('resultSameMetro')}</dt>
          <dd>{yesNo(result.sameMetroInterAirport)}</dd>

          <dt className="text-muted-foreground">{t('resultInterline')}</dt>
          <dd>{yesNo(result.isInterline)}</dd>

          <dt className="text-muted-foreground">{t('resultBagThrough')}</dt>
          <dd>{yesNo(result.bagThroughChecked)}</dd>

          <dt className="text-muted-foreground">{t('resultMctRule')}</dt>
          <dd className="truncate">{result.appliedMctRuleId ?? '—'}</dd>

          <dt className="text-muted-foreground">
            {t('resultInterlineAgreement')}
          </dt>
          <dd className="truncate">{result.appliedInterlineId ?? '—'}</dd>

          <dt className="text-muted-foreground">{t('resultReason')}</dt>
          <dd className="col-span-3">{result.reason}</dd>
        </dl>
      </CardContent>
    </Card>
  );
}
