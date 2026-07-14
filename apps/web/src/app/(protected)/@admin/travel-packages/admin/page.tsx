import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { TravelPackagesAdmin } from '@/features/travel-packages/travel-packages-admin';

const TravelPackagesAdminPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('travelPackagesAdmin.travelPackages');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <TravelPackagesAdmin />
    </PageLayout>
  );
};

export default TravelPackagesAdminPage;
