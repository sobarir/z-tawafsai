import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { FlightsAdmin } from '@/features/flights/flights-admin';

const FlightsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.flights');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <FlightsAdmin />
    </PageLayout>
  );
};

export default FlightsPage;
