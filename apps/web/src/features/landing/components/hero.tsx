import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { BookingBar } from '@/features/landing/components/booking-bar';

export async function Hero() {
  const t = await getTranslations('landing.hero');

  return (
    <section className="relative m-4 min-h-[600px] overflow-hidden rounded-[20px] text-white min-[600px]:m-[30px]">
      <Image
        src="/images/landing/hero-kaaba.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 900px) calc(100vw - 340px), 100vw"
        className="object-cover object-bottom"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(100deg,rgba(28,32,20,.94)_0%,rgba(28,32,20,.7)_40%,rgba(28,32,20,.25)_70%,rgba(28,32,20,.12)_100%)]"
      />
      <div className="relative z-[2] flex min-h-[600px] items-center p-11">
        <div>
          <span className="text-[.7rem] font-bold tracking-[.14em] text-gold-soft uppercase">
            {t('kicker')}
          </span>
          <h2 className="my-3.5 max-w-[16ch] font-serif text-[clamp(2rem,4vw,3.2rem)] text-white">
            {t('headlinePre')}
            <span className="text-gold-soft">{t('headlineEmphasis')}</span>
            {t('headlinePost')}
          </h2>
          <p className="mb-[22px] max-w-[44ch] text-[1.05rem] text-white/85">
            {t('subtitle')}
          </p>
          <BookingBar />
        </div>
      </div>
    </section>
  );
}
