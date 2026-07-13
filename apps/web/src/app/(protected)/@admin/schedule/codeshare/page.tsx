import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { FlightMarketingAdmin } from '@/features/flight-marketing/flight-marketing-admin';

const CodesharePage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.codeshare');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <FlightMarketingAdmin />
    </PageLayout>
  );
};

export default CodesharePage;
