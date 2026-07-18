import { Building2, Calendar, Plane, Star } from 'lucide-react';
import type { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import type { PackageCardData } from '@/features/landing/data/packages';
import { cn } from '@/libs/utils';

export function PackageCard({
  pkg,
  t,
}: {
  pkg: PackageCardData;
  t: ReturnType<typeof useTranslations<'landing.packages'>>;
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
      <CardHeader className="grid-cols-[1fr_auto] gap-x-4 gap-y-4 px-0">
        {/* Top Row: Badge & Rating (Left), Price (Right) */}
        <div className="flex flex-col items-start gap-1.5 self-center">
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

        {/* Bottom Row: Title & Subtitle (Full Width) */}
        <div className="col-span-2 min-w-0">
          <h4 className="mb-1 font-serif text-[1.4rem] leading-tight text-landing-ink">
            {pkg.name}
          </h4>
          <div className="text-[.82rem] leading-relaxed text-landing-muted">
            {pkg.subtitle}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-x-[22px] gap-y-3 px-0 min-[761px]:grid-cols-2">
        <div className="flex items-start gap-2.5">
          <Calendar className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            {pkg.departureDate ? (
              <>
                <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
                  {pkg.departureDate}
                </div>
                <div className="text-[.76rem] leading-snug text-landing-muted">
                  {pkg.durationValue}
                </div>
              </>
            ) : (
              <div className="text-[.88rem] font-semibold text-landing-ink">
                {pkg.durationValue}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Plane className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
              {pkg.airline}
            </div>
            {pkg.direct && (
              <div className="mt-0.5">
                <Badge className="rounded-full border-transparent bg-brand-600 px-1.5 py-px text-[.6rem] font-bold tracking-[.04em] text-white uppercase">
                  {t('directBadge')}
                </Badge>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Building2 className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('hotelMakkahLabel')}
            </div>
            <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
              {pkg.hotelMakkah.name}
            </div>
            {pkg.hotelMakkah.distance && (
              <div className="text-[.76rem] leading-snug text-landing-muted">
                {pkg.hotelMakkah.distance}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-2.5">
          <Building2 className="mt-0.5 size-[19px] shrink-0 text-brand-600" />
          <div>
            <div className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
              {t('hotelMadinahLabel')}
            </div>
            <div className="text-[.88rem] font-semibold leading-snug text-landing-ink">
              {pkg.hotelMadinah.name}
            </div>
            {pkg.hotelMadinah.distance && (
              <div className="text-[.76rem] leading-snug text-landing-muted">
                {pkg.hotelMadinah.distance}
              </div>
            )}
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
