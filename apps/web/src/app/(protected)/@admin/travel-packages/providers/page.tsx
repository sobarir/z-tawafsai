import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { TravelProvidersAdmin } from '@/features/travel-providers/travel-providers-admin';

const TravelProvidersAdminPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('travelProvidersAdmin');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <TravelProvidersAdmin />
    </PageLayout>
  );
};

export default TravelProvidersAdminPage;
