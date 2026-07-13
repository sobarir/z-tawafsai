import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { InterlineAgreementsAdmin } from '@/features/interline-agreements/interline-agreements-admin';

const InterlineAgreementsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.interlineAgreements');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <InterlineAgreementsAdmin />
    </PageLayout>
  );
};

export default InterlineAgreementsPage;
