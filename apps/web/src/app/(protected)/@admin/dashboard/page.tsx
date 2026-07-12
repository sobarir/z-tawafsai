import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { requirePermission } from '@/features/auth/rbac/require';

const AdminDashboardPage = async () => {
  await requirePermission('dashboard.view:admin');
  const t = await getTranslations('dashboard.admin');

  return (
    <PageLayout>
      <PageHeader title={t('title')} subtitle={t('description')} />
    </PageLayout>
  );
};

export default AdminDashboardPage;
