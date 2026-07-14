import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { CitiesAdmin } from '@/features/cities/cities-admin';

const CitiesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('reference.cities');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <CitiesAdmin />
    </PageLayout>
  );
};

export default CitiesPage;
