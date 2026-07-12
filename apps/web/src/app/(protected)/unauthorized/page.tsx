import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';

const UnauthorizedPage = async () => {
  const t = await getTranslations('errors');

  return (
    <PageLayout centered>
      <PageHeader title={t('403')} subtitle={t('unauthorizedDescription')} />
      <Button asChild className="w-full max-w-sm">
        <Link href="/dashboard">{t('goToDashboard')}</Link>
      </Button>
    </PageLayout>
  );
};

export default UnauthorizedPage;
