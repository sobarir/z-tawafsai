import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelSeasonWindowsAdmin } from '@/features/hotel-season-windows/hotel-season-windows-admin';

const SeasonWindowsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.seasonWindows');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelSeasonWindowsAdmin />
    </PageLayout>
  );
};

export default SeasonWindowsPage;
