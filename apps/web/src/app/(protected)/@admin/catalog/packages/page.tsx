import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelPackagesAdmin } from '@/features/hotel-packages/hotel-packages-admin';

const PackagesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.packages');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelPackagesAdmin />
    </PageLayout>
  );
};

export default PackagesPage;
