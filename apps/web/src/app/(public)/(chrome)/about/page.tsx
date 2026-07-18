import { Clock, CreditCard, ShieldCheck, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getLocale, getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import {
  getLocaleDirection,
  type Locale,
  siteConfig,
} from '@/features/site/config';
import { cn } from '@/libs/utils';

export const generateMetadata = async (): Promise<Metadata> => {
  const t = await getTranslations('about');
  return {
    title: `${t('title')} | ${siteConfig.appName}`,
    description: t('subtitle'),
  };
};

function AboutCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="ui-card relative flex flex-col gap-4 overflow-hidden rounded-2xl p-6 text-start sm:p-7">
      <h2 className="text-xl text-foreground">{title}</h2>
      {children}
    </div>
  );
}

const AboutPage = async () => {
  const [t, locale] = await Promise.all([
    getTranslations('about'),
    getLocale(),
  ]);
  const isRtl = getLocaleDirection(locale as Locale) === 'rtl';

  const whyChoose = [
    {
      icon: ShieldCheck,
      title: t('whyChoose.licensedTitle'),
      description: t('whyChoose.licensedDescription'),
    },
    {
      icon: Star,
      title: t('whyChoose.ratedTitle'),
      description: t('whyChoose.ratedDescription'),
    },
    {
      icon: Clock,
      title: t('whyChoose.supportTitle'),
      description: t('whyChoose.supportDescription'),
    },
    {
      icon: CreditCard,
      title: t('whyChoose.protectedTitle'),
      description: t('whyChoose.protectedDescription'),
    },
  ];

  return (
    <div className="flex flex-col gap-12 lg:gap-16">
      <div className="mx-auto w-full max-w-7xl px-4 pt-12">
        <div className="mx-auto w-full max-w-screen-xl space-y-8 px-5 sm:space-y-10 xl:px-0">
          <header className={cn('text-center', !isRtl && 'lg:text-left')}>
            <h1 className="text-4xl text-foreground">{t('title')}</h1>
            <p className="mt-3 text-base text-muted-foreground">
              {t('subtitle')}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 sm:gap-7 md:grid-cols-2 lg:gap-8">
            <AboutCard title={t('story.heading')}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('story.body')}
              </p>
            </AboutCard>

            <AboutCard title={t('license.heading')}>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {t('license.body')}
              </p>
              <p className="text-sm font-medium text-foreground">
                {t('license.number')}
              </p>
            </AboutCard>
          </div>

          <div>
            <h2 className="mb-5 text-2xl text-foreground">
              {t('whyChoose.heading')}
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {whyChoose.map((item) => (
                <div
                  key={item.title}
                  className="ui-card flex flex-col gap-2 rounded-2xl p-5"
                >
                  <item.icon className="size-6 text-primary" />
                  <b className="text-sm text-foreground">{item.title}</b>
                  <span className="text-sm text-muted-foreground">
                    {item.description}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <AboutCard title={t('contact.heading')}>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t('contact.body')}
            </p>
            <div className="flex flex-col gap-1 text-sm text-foreground">
              <span>{siteConfig.contact.supportEmail}</span>
              <span>{siteConfig.contact.phoneNumber}</span>
            </div>
          </AboutCard>
        </div>
      </div>

      <section className="relative mx-4 overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,var(--color-brand-900),var(--color-brand-700))] p-9 text-center text-white sm:mx-[30px] sm:p-11">
        <h2 className="text-white">{t('cta.heading')}</h2>
        <p className="mx-auto mt-2.5 mb-6 max-w-md text-white/85">
          {t('cta.body')}
        </p>
        <Button variant="brand" asChild>
          <Link href="/">{t('cta.button')}</Link>
        </Button>
      </section>
    </div>
  );
};

export default AboutPage;
