import { requireUser } from '@/features/auth/rbac/require';
import { HotelSearchPageContent } from '@/features/hotel-search/hotel-search-page-content';

interface HotelsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const HotelsPage = async ({ searchParams }: HotelsPageProps) => {
  await requireUser();
  return <HotelSearchPageContent searchParams={searchParams} />;
};

export default HotelsPage;
