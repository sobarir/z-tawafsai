'use client';

import { useEffect, useState } from 'react';
import {
  useListAirports,
  useSearchFlights,
} from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import { FlightSearchForm, type FlightSearchQuery } from './flight-search-form';
import { FlightSearchResults } from './flight-search-results';

const EMPTY_QUERY: FlightSearchQuery = {
  originAirport: '',
  destAirport: '',
  date: '',
};

export function FlightSearch() {
  const { data: airports } = useListAirports();
  const [query, setQuery] = useState<FlightSearchQuery>(EMPTY_QUERY);
  const handleError = useApiErrorToast();

  const { data, error, isFetching, isFetched, refetch } = useSearchFlights(
    query,
    { query: { enabled: false } },
  );

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  const handleSearch = () => {
    void refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <FlightSearchForm
        airports={airports ?? []}
        query={query}
        onQueryChange={setQuery}
        onSearch={handleSearch}
        searching={isFetching}
      />
      <FlightSearchResults
        results={data}
        isFetching={isFetching}
        isFetched={isFetched}
      />
    </div>
  );
}
