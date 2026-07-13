import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { AirportsAdmin } from '@/features/airports/airports-admin';
import { requirePermission } from '@/features/auth/rbac/require';

const AirportsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.airports');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <AirportsAdmin />
    </PageLayout>
  );
};

export default AirportsPage;
