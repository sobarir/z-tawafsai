'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSearchHotels } from '@/libs/api/generated/endpoints';
import { useApiErrorToast } from '@/libs/api/use-api-error-toast';
import type {
  HotelSearchFormValues,
  HotelSearchKind,
} from './hotel-search-form';
import { HotelSearchForm } from './hotel-search-form';
import { HotelSearchResults } from './hotel-search-results';
import type { HotelSort, RefineRailValue } from './refine-rail';
import { RefineRail } from './refine-rail';

export interface HotelSearchState
  extends HotelSearchFormValues,
    RefineRailValue {}

interface HotelSearchProps {
  initialState: HotelSearchState;
}

function toSearchParams(state: HotelSearchState): URLSearchParams {
  const params = new URLSearchParams();
  if (state.destination) params.set('destination', state.destination);
  if (state.checkIn) params.set('checkIn', state.checkIn);
  if (state.checkOut) params.set('checkOut', state.checkOut);
  params.set('occupancy', String(state.occupancy));
  params.set('currency', state.currency);
  params.set('kind', state.kind);
  params.set('sort', state.sort);
  if (state.minPrice !== undefined)
    params.set('minPrice', String(state.minPrice));
  if (state.maxPrice !== undefined)
    params.set('maxPrice', String(state.maxPrice));
  return params;
}

export function HotelSearch({ initialState }: HotelSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const handleError = useApiErrorToast();

  const canSearch =
    !!initialState.destination &&
    !!initialState.checkIn &&
    !!initialState.checkOut;

  const { data, error, isFetching, isFetched } = useSearchHotels(
    {
      destination: initialState.destination,
      checkIn: initialState.checkIn,
      checkOut: initialState.checkOut,
      occupancy: initialState.occupancy,
      currency: initialState.currency,
      kind: initialState.kind,
      sort: initialState.sort,
      minPrice: initialState.minPrice,
      maxPrice: initialState.maxPrice,
    },
    { query: { enabled: canSearch } },
  );

  useEffect(() => {
    if (error) handleError(error);
  }, [error, handleError]);

  // The URL is the state (prd/hotels/30-frontend.md) — every field change
  // navigates, so refresh/back-button/sharing all preserve the search.
  const applyState = (next: HotelSearchState) => {
    router.replace(`${pathname}?${toSearchParams(next).toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <HotelSearchForm
        value={initialState}
        onSubmit={(form: HotelSearchFormValues) =>
          applyState({ ...initialState, ...form })
        }
        searching={isFetching}
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[240px_1fr]">
        <RefineRail
          value={{
            sort: initialState.sort,
            minPrice: initialState.minPrice,
            maxPrice: initialState.maxPrice,
          }}
          onChange={(refine: RefineRailValue) =>
            applyState({ ...initialState, ...refine })
          }
        />
        <HotelSearchResults
          results={data?.items}
          total={data?.total}
          isFetching={isFetching}
          isFetched={isFetched}
          query={{
            destination: initialState.destination,
            checkIn: initialState.checkIn,
            checkOut: initialState.checkOut,
            occupancy: initialState.occupancy,
            currency: initialState.currency,
          }}
        />
      </div>
    </div>
  );
}

export type { HotelSearchKind, HotelSort };
