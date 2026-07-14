import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelSeasonsAdmin } from '@/features/hotel-seasons/hotel-seasons-admin';

const SeasonsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.seasons');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelSeasonsAdmin />
    </PageLayout>
  );
};

export default SeasonsPage;
