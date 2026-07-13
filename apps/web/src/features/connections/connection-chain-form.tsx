'use client';

import type { ConnectionResult, Flight } from '@repo/shared';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Label } from '@/components/ui/label';
import { useValidateConnectionChain } from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import { toFlightOptions } from '@/libs/combobox-options';
import { ConnectionResultCard } from './connection-result-card';

interface ConnectionChainFormProps {
  flights: Flight[];
}

export function ConnectionChainForm({ flights }: ConnectionChainFormProps) {
  const t = useTranslations('schedule.connections');
  const handleError = useApiErrorToast();

  const flightOptions = toFlightOptions(flights);

  const [rows, setRows] = useState<{ id: string; flightId: string }[]>([
    { id: crypto.randomUUID(), flightId: '' },
    { id: crypto.randomUUID(), flightId: '' },
  ]);
  const [results, setResults] = useState<ConnectionResult[] | null>(null);

  const mutation = useValidateConnectionChain({
    mutation: {
      onSuccess: (data) => setResults(data),
      onError: (error) => {
        setResults(null);
        handleError(error);
      },
    },
  });

  const setFlightAt = (id: string, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, flightId: value } : row)),
    );
  };

  const canValidate = rows.length >= 2 && rows.every((row) => row.flightId);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, index) => (
        <div key={row.id} className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-2">
            <Label>
              {t('prevFlight')} #{index + 1}
            </Label>
            <Combobox
              options={flightOptions}
              value={row.flightId}
              onChange={(value) => setFlightAt(row.id, value)}
            />
          </div>
          <Button
            type="button"
            variant="outlineDestructive"
            size="icon-sm"
            disabled={rows.length <= 2}
            onClick={() =>
              setRows((prev) => prev.filter((r) => r.id !== row.id))
            }
            aria-label={t('removeFlight')}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() =>
          setRows((prev) => [
            ...prev,
            { id: crypto.randomUUID(), flightId: '' },
          ])
        }
      >
        <PlusIcon /> {t('addFlight')}
      </Button>

      <Button
        type="button"
        size="sm"
        className="w-fit"
        disabled={!canValidate}
        loading={mutation.isPending}
        onClick={() =>
          mutation.mutate({
            data: { flightIds: rows.map((row) => row.flightId) },
          })
        }
      >
        {t('validateButton')}
      </Button>

      {results ? (
        <div className="flex flex-col gap-3">
          {results.map((result) => (
            <ConnectionResultCard
              key={`${result.prevFlightId}-${result.nextFlightId}`}
              result={result}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
