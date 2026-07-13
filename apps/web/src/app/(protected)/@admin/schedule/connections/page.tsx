import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';
import { ConnectionsAdmin } from '@/features/connections/connections-admin';

const ConnectionsPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('schedule.connections');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
      <ConnectionsAdmin />
    </PageLayout>
  );
};

export default ConnectionsPage;
