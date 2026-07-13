import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { AirlinesAdmin } from '@/features/airlines/airlines-admin';
import { requirePermission } from '@/features/auth/rbac/require';

const AirlinesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.airlines');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <AirlinesAdmin />
    </PageLayout>
  );
};

export default AirlinesPage;
