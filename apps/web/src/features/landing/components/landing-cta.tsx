import { getTranslations } from 'next-intl/server';
import { CtaForm } from '@/features/landing/components/cta-form';

export async function LandingCta() {
  const t = await getTranslations('landing.cta');

  return (
    <section
      className="relative m-4 overflow-hidden rounded-[20px] bg-[linear-gradient(120deg,var(--color-brand-900),var(--color-brand-700))] p-9 text-white min-[600px]:m-[30px] min-[600px]:p-11"
      id="kontak"
    >
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[.12]"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <pattern
            id="landing-cta-pattern"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <path d="M10 0v20M0 10h20" stroke="#f0e2cb" strokeWidth="1" />
            <circle
              cx="10"
              cy="10"
              r="4"
              fill="none"
              stroke="#f0e2cb"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#landing-cta-pattern)" />
      </svg>

      <div className="relative z-[1] max-w-[560px]">
        <span className="text-[.7rem] font-bold tracking-[.14em] text-gold-soft uppercase">
          {t('kicker')}
        </span>
        <h3 className="mt-2.5 mb-2.5 font-serif text-[clamp(1.6rem,3vw,2.3rem)] text-white">
          {t('heading')}
        </h3>
        <p className="mb-5 text-white/85">{t('body')}</p>
        <CtaForm
          emailPlaceholder={t('emailPlaceholder')}
          emailAriaLabel={t('emailAriaLabel')}
          submitLabel={t('submit')}
        />
      </div>
    </section>
  );
}
