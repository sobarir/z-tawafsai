import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PageHeader, PageLayout } from '@/components/shared/page-header';
import { TravelPackageList } from '@/features/travel-packages/travel-package-list';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('travelPackages');
  return { title: t('title'), description: t('description') };
};

const TravelPackagesPage = async () => {
  const t = await getTranslations('travelPackages');

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <PageLayout>
        <PageHeader title={t('title')} subtitle={t('description')} />
        <TravelPackageList />
      </PageLayout>
    </div>
  );
};

export default TravelPackagesPage;
