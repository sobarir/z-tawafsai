import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import type { HotelSearchState } from './hotel-search';
import { HotelSearch } from './hotel-search';
import type { HotelSearchKind } from './hotel-search-form';
import type { HotelSort } from './refine-rail';

const KINDS: HotelSearchKind[] = ['property', 'package', 'both'];
const SORTS: HotelSort[] = ['price_asc', 'price_desc', 'name'];

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function parseState(
  params: Record<string, string | string[] | undefined>,
): HotelSearchState {
  const kind = first(params.kind);
  const sort = first(params.sort);
  const occupancy = Number(first(params.occupancy));
  const minPrice = first(params.minPrice);
  const maxPrice = first(params.maxPrice);

  return {
    destination: first(params.destination) ?? '',
    checkIn: first(params.checkIn) ?? '',
    checkOut: first(params.checkOut) ?? '',
    occupancy: Number.isFinite(occupancy) && occupancy > 0 ? occupancy : 2,
    currency: first(params.currency) ?? 'USD',
    kind:
      kind && KINDS.includes(kind as HotelSearchKind)
        ? (kind as HotelSearchKind)
        : 'property',
    sort:
      sort && SORTS.includes(sort as HotelSort)
        ? (sort as HotelSort)
        : 'price_asc',
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  };
}

interface HotelSearchPageContentProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function HotelSearchPageContent({
  searchParams,
}: HotelSearchPageContentProps) {
  const [t, resolvedParams] = await Promise.all([
    getTranslations('hotelSearch'),
    searchParams,
  ]);

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelSearch initialState={parseState(resolvedParams)} />
    </PageLayout>
  );
}
