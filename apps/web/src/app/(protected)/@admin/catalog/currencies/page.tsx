import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelCurrenciesAdmin } from '@/features/hotel-currencies/hotel-currencies-admin';

const CurrenciesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.currencies');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelCurrenciesAdmin />
    </PageLayout>
  );
};

export default CurrenciesPage;
