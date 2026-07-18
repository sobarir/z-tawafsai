'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { UserDropdown } from '@/components/shared/user-dropdown';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/hooks/auth-provider';

export function LandingTopbar() {
  const t = useTranslations('landing.topbar');
  const tNav = useTranslations('navigation');
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  const anchorLinks = [
    { href: '#paket', label: t('navPaket') },
    { href: '#destinasi', label: t('navDestinasi') },
    { href: '#jelajah', label: t('navJurnal') },
  ];

  const linkClassName =
    'text-[.88rem] font-medium text-landing-muted transition-colors hover:text-brand-700';

  const renderNavContent = (variant: 'desktop' | 'mobile') => {
    const onNavigate = variant === 'mobile' ? () => setOpen(false) : undefined;

    return (
      <>
        {anchorLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className={linkClassName}
          >
            {link.label}
          </a>
        ))}
        <Link href="/about" onClick={onNavigate} className={linkClassName}>
          {t('navTentang')}
        </Link>
        {user ? (
          <>
            <Link
              href="/dashboard"
              onClick={onNavigate}
              className={linkClassName}
            >
              {tNav('dashboard')}
            </Link>
            {variant === 'desktop' ? (
              <UserDropdown hideEmailOnMobile />
            ) : (
              <UserDropdown align="start" onLogout={onNavigate} />
            )}
          </>
        ) : (
          <Link href="/login" onClick={onNavigate} className={linkClassName}>
            {t('loginLabel')}
          </Link>
        )}
        <Button
          variant="brand"
          size="sm"
          asChild
          className={variant === 'mobile' ? 'w-fit' : undefined}
        >
          <Link href="#paket" onClick={onNavigate}>
            {t('ctaMulaiRencana')}
          </Link>
        </Button>
      </>
    );
  };

  return (
    <div className="sticky top-0 z-40 flex h-16 items-center justify-end border-b border-line bg-white/90 px-[30px] backdrop-blur-[10px]">
      <nav
        id="landing-menu"
        className="hidden items-center gap-[26px] min-[600px]:flex"
      >
        {renderNavContent('desktop')}
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="min-[600px]:hidden"
        aria-label={t('menuAriaLabel')}
        aria-expanded={open}
        aria-controls="landing-mobile-menu"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <nav
          id="landing-mobile-menu"
          className="absolute top-16 right-0 left-0 flex flex-col gap-3.5 border-b border-line bg-white px-6 py-4 min-[600px]:hidden"
        >
          {renderNavContent('mobile')}
        </nav>
      )}
    </div>
  );
}
