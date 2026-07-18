'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CtaForm({
  emailPlaceholder,
  emailAriaLabel,
  submitLabel,
}: {
  emailPlaceholder: string;
  emailAriaLabel: string;
  submitLabel: string;
}) {
  return (
    <form
      className="flex flex-wrap gap-2.5"
      onSubmit={(event) => event.preventDefault()}
    >
      <Input
        type="email"
        placeholder={emailPlaceholder}
        aria-label={emailAriaLabel}
        className="h-auto min-w-[200px] flex-1 rounded-[10px] border-none bg-white px-4 py-3.5 text-[.9rem] text-landing-ink shadow-none"
      />
      <Button
        type="submit"
        variant="brandSolid"
        className="bg-gold text-[#3a2708] hover:bg-gold-soft"
      >
        {submitLabel}
      </Button>
    </form>
  );
}
