import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { MctRulesAdmin } from '@/features/mct-rules/mct-rules-admin';

const MctRulesPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.mctRules');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <MctRulesAdmin />
    </PageLayout>
  );
};

export default MctRulesPage;
