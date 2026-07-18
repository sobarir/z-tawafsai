import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { sidebarPicks } from '@/features/landing/data/articles';
import { cn } from '@/libs/utils';

export async function LandingSidebar({ className }: { className?: string }) {
  const t = await getTranslations('landing');

  return (
    <aside
      className={cn(
        'flex flex-col border-line bg-paper p-[26px] min-[900px]:sticky min-[900px]:top-0 min-[900px]:h-screen min-[900px]:overflow-y-auto min-[900px]:border-r min-[900px]:py-[30px]',
        'border-t border-b min-[900px]:border-t-0 min-[900px]:border-b-0',
        className,
      )}
    >
      <div className="mb-1 flex items-center gap-2.5 font-serif text-[1.4rem] font-semibold text-brand-900">
        <Image
          src="/tawafsai-logo.svg"
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0"
          aria-hidden="true"
        />
        <span>
          {t('brand.prefix')}
          <b className="text-gold">{t('brand.suffix')}</b>
        </span>
      </div>

      <span className="text-[.66rem] font-bold tracking-[.16em] text-landing-muted uppercase">
        {t('sidebar.tagKicker')}
      </span>

      <h1 className="mt-5 mb-3.5 font-serif text-[2.3rem] leading-[1.02] text-landing-ink">
        {t('sidebar.headline')}
      </h1>
      <p className="mb-3.5 font-serif text-[1.15rem] leading-[1.35] text-brand-700 italic">
        {t('sidebar.tagline')}
      </p>
      <p className="mb-[22px] text-sm text-landing-muted">
        {t('sidebar.intro')}
      </p>

      <nav
        className="flex-1 border-t border-line pt-[18px]"
        aria-label={t('sidebar.picksAriaLabel')}
      >
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[.7rem] font-bold tracking-[.14em] text-brand-600 uppercase">
            {t('sidebar.picksKicker')}
          </span>
          <a
            href="#jelajah"
            className="text-[.72rem] font-semibold text-landing-muted"
          >
            {t('sidebar.picksAll')}
          </a>
        </div>
        <ul className="flex flex-col gap-0.5">
          {sidebarPicks.map((pick) => (
            <li key={pick.number}>
              <a
                href="#jelajah"
                className="flex items-start gap-[11px] rounded-[9px] px-2 py-2.5 transition-colors hover:bg-brand-100"
              >
                <span className="w-5 shrink-0 font-serif text-sm leading-[1.5] font-semibold text-gold">
                  {pick.number}
                </span>
                <span className="flex flex-col">
                  <span className="text-sm leading-[1.25] font-semibold text-landing-ink">
                    {pick.title}
                  </span>
                  <span className="mt-0.5 text-[.7rem] tracking-[.05em] text-landing-muted uppercase">
                    {pick.category}
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-4 border-t border-line pt-4">
        <div className="mb-3 flex items-center gap-3">
          <svg
            className="size-[52px] shrink-0"
            viewBox="0 0 60 60"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M12 30c-4-6-4-14 2-18M48 30c4-6 4-14-2-18M14 40c-5-3-7-10-4-16M46 40c5-3 7-10 4-16"
              stroke="#c98a3a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <text
              x="30"
              y="38"
              fontFamily="Fraunces,serif"
              fontSize="24"
              fontWeight="600"
              fill="#333a28"
              textAnchor="middle"
            >
              T
            </text>
          </svg>
          <span className="text-[.7rem] leading-[1.5] font-bold tracking-[.1em] text-landing-muted uppercase">
            {t('sidebar.footerCaptionLine1')}
            <br />
            {t('sidebar.footerCaptionLine2')}
          </span>
        </div>
        <p className="text-[.72rem] text-landing-muted">
          {t('sidebar.license')}
        </p>
      </div>
    </aside>
  );
}
