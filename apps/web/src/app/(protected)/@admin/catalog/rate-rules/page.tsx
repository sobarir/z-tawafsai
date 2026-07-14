import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { HotelRateRulesAdmin } from '@/features/hotel-rate-rules/hotel-rate-rules-admin';

const RateRulesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('catalog.rateRules');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <HotelRateRulesAdmin />
    </PageLayout>
  );
};

export default RateRulesPage;
