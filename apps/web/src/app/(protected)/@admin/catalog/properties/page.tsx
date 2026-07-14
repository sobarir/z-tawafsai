import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelPropertiesAdmin } from '@/features/hotel-properties/hotel-properties-admin';

const PropertiesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.properties');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelPropertiesAdmin />
    </PageLayout>
  );
};

export default PropertiesPage;
