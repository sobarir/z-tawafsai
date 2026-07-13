'use client';

import type { ConnectionResult, Flight } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LabeledCombobox } from '@/components/shared/labeled-combobox';
import { Button } from '@/components/ui/button';
import { useValidateConnection } from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import { toFlightOptions } from '@/libs/combobox-options';
import { ConnectionResultCard } from './connection-result-card';

interface SingleConnectionFormProps {
  flights: Flight[];
}

export function SingleConnectionForm({ flights }: SingleConnectionFormProps) {
  const t = useTranslations('schedule.connections');
  const handleError = useApiErrorToast();

  const flightOptions = toFlightOptions(flights);

  const [prevFlightId, setPrevFlightId] = useState('');
  const [nextFlightId, setNextFlightId] = useState('');
  const [result, setResult] = useState<ConnectionResult | null>(null);

  const mutation = useValidateConnection({
    mutation: {
      onSuccess: (data) => setResult(data),
      onError: (error) => {
        setResult(null);
        handleError(error);
      },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <LabeledCombobox
          label={t('prevFlight')}
          options={flightOptions}
          value={prevFlightId}
          onChange={setPrevFlightId}
        />

        <LabeledCombobox
          label={t('nextFlight')}
          options={flightOptions}
          value={nextFlightId}
          onChange={setNextFlightId}
        />
      </div>

      <Button
        type="button"
        size="sm"
        className="w-fit"
        disabled={!prevFlightId || !nextFlightId}
        loading={mutation.isPending}
        onClick={() =>
          mutation.mutate({ data: { prevFlightId, nextFlightId } })
        }
      >
        {t('validateButton')}
      </Button>

      {result ? <ConnectionResultCard result={result} /> : null}
    </div>
  );
}
