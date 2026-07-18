import { Clock, CreditCard, ShieldCheck, Star } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

export async function TrustStrip() {
  const t = await getTranslations('landing.trust');

  const items = [
    {
      icon: ShieldCheck,
      title: t('kemenagTitle'),
      subtitle: t('kemenagSubtitle'),
    },
    { icon: Star, title: t('ratingTitle'), subtitle: t('ratingSubtitle') },
    { icon: Clock, title: t('supportTitle'), subtitle: t('supportSubtitle') },
    {
      icon: CreditCard,
      title: t('protectedTitle'),
      subtitle: t('protectedSubtitle'),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 px-4 pb-2.5 min-[600px]:grid-cols-2 min-[900px]:grid-cols-4 min-[600px]:px-[30px]">
      {items.map((item) => (
        <div key={item.title} className="flex flex-col gap-1.5 rounded-xl p-4">
          <item.icon className="size-[22px] text-brand-600" />
          <b className="text-[.9rem] text-landing-ink">{item.title}</b>
          <span className="text-[.78rem] text-landing-muted">
            {item.subtitle}
          </span>
        </div>
      ))}
    </div>
  );
}
