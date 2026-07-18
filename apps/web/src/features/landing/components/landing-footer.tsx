import { getTranslations } from 'next-intl/server';

export async function LandingFooter() {
  const t = await getTranslations('landing.footer');

  const links = [
    { href: '#', label: t('linkAbout') },
    { href: '#', label: t('linkLegal') },
    { href: '#', label: t('linkContact') },
    { href: '#', label: t('linkPrivacy') },
  ];

  return (
    <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-line px-4 py-[30px] text-[.84rem] text-landing-muted min-[600px]:px-[30px]">
      <span>{t('copyright')}</span>
      <div className="flex flex-wrap gap-5">
        {links.map((link) => (
          <a key={link.label} href={link.href} className="hover:text-brand-700">
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
