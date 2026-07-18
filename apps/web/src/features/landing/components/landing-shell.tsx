import type { ReactNode } from 'react';
import { LandingSidebar } from '@/features/landing/components/landing-sidebar';
import { LandingTopbar } from '@/features/landing/components/landing-topbar';
import { cn } from '@/libs/utils';

export function LandingShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn(
        'text-landing-ink',
        'flex min-h-screen flex-col bg-paper min-[900px]:grid min-[900px]:grid-cols-[340px_1fr]',
      )}
    >
      <LandingSidebar className="order-2 min-[900px]:order-none" />
      <div className="order-1 min-w-0 bg-white min-[900px]:order-none">
        <LandingTopbar />
        <main id="main-content">{children}</main>
      </div>
    </div>
  );
}
