import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelRoomTypesAdmin } from '@/features/hotel-room-types/hotel-room-types-admin';

const RoomTypesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.roomTypes');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelRoomTypesAdmin />
    </PageLayout>
  );
};

export default RoomTypesPage;
