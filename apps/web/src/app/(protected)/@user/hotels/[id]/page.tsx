import { requireUser } from '@/features/auth/rbac/require';
import { HotelDetailPageContent } from '@/features/hotel-search/hotel-detail-page-content';

interface HotelDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const HotelDetailPage = async ({
  params,
  searchParams,
}: HotelDetailPageProps) => {
  await requireUser();
  return <HotelDetailPageContent params={params} searchParams={searchParams} />;
};

export default HotelDetailPage;
