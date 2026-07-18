import { Building2, Calendar, Plane, Star } from 'lucide-react';
import type { getTranslations } from 'next-intl/server';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { TravelPackage } from '@/features/landing/data/packages';
import { cn } from '@/libs/utils';

export function PackageCard({
  pkg,
  t,
}: {
  pkg: TravelPackage;
  t: Awaited<ReturnType<typeof getTranslations<'landing.packages'>>>;
}) {
  return (
    <Card
      flat
      className={cn(
        'h-full gap-3.5 rounded-2xl border-line bg-white px-6 py-[22px] transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-brand-600 hover:shadow-[var(--shadow-md)]',
        pkg.featured &&
          'border-brand-600 shadow-[0_0_0_1px_var(--color-brand-600)]',
      )}
    >
      <CardHeader className="grid-cols-[1fr_auto] gap-4 px-0">
        <div className="min-w-0">
          <div className="mb-1 flex flex-wrap items-center gap-3">
            <Badge
              className={cn(
                'rounded-full border-transparent px-2.5 py-1 text-[.62rem] font-bold tracking-[.06em] uppercase',
                pkg.badgeVariant === 'gold'
                  ? 'bg-gold-soft text-[#8a5a1a]'
                  : 'bg-brand-100 text-brand-700',
              )}
            >
              {pkg.badge}
            </Badge>
            <span
              role="img"
              className="flex items-center gap-0.5 text-gold"
              aria-label={`${pkg.stars} dari 5`}
            >
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length static rating display
                  key={i}
                  className="size-3.5"
                  fill={i < pkg.stars ? 'currentColor' : 'none'}
                />
              ))}
            </span>
          </div>
          <h4 className="mt-0.5 mb-0.5 font-serif text-[1.4rem] text-landing-ink">
            {pkg.name}
          </h4>
          <div className="text-[.82rem] text-landing-muted">{pkg.subtitle}</div>
        </div>
        <div className="shrink-0 rounded-xl bg-brand-100 px-4 py-3 text-right">
          <div className="text-[.68rem] font-semibold text-landing-muted">
            {t('priceFrom')}
          </div>
          <div className="font-serif text-[1.55rem] leading-[1.05] whitespace-nowrap text-brand-900">
            {pkg.priceMain}
            <span className="font-sans text-[.74rem] font-semibold text-landing-muted">
              {' '}
              {pkg.priceUnit}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-x-[22px] gap-y-3 px-0 min-[761px]:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('durasiLabel')}
            </div>
            <div className="text-[.88rem] font-semibold text-landing-ink">
              {pkg.durationValue}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Plane className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('maskapaiLabel')}
            </div>
            <div className="text-[.88rem] font-semibold text-landing-ink">
              {pkg.airline}
              {pkg.direct && (
                <Badge className="ml-1.5 rounded-full border-transparent bg-brand-600 px-1.5 py-px align-middle text-[.6rem] font-bold tracking-[.04em] text-white uppercase">
                  {t('directBadge')}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Building2 className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('hotelMakkahLabel')}
            </div>
            <div className="text-[.88rem] font-semibold text-landing-ink">
              {pkg.hotelMakkah}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Building2 className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('hotelMadinahLabel')}
            </div>
            <div className="text-[.88rem] font-semibold text-landing-ink">
              {pkg.hotelMadinah}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between gap-3.5 border-t border-line px-0 pt-3.5">
        <span className="text-[.74rem] text-landing-muted">{pkg.footNote}</span>
        <Button variant="brandSolid" size="sm">
          {t('detailCta')}
        </Button>
      </CardFooter>
    </Card>
  );
}
