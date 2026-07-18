import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { EarningsReport } from '@/features/travel-packages/earnings-report';

const TravelPackageEarningsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('travelPackagesAdmin.earnings');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <EarningsReport />
    </PageLayout>
  );
};

export default TravelPackageEarningsPage;
