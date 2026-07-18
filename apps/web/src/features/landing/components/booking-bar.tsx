'use client';

import { Calendar, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const fieldTriggerClass =
  'h-auto w-auto shrink-0 gap-1 border-none bg-transparent p-0 text-[.86rem] font-semibold text-landing-ink shadow-none focus-visible:ring-0';

export function BookingBar() {
  const t = useTranslations('landing');

  return (
    <div className="flex max-w-[560px] flex-wrap gap-0 rounded-[14px] bg-white p-1.5 shadow-[0_20px_50px_-18px_rgba(0,0,0,0.5)]">
      <div className="flex min-w-[150px] flex-1 items-center gap-2.5 px-3.5 py-2.5">
        <Calendar className="size-[18px] shrink-0 text-landing-muted" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
            {t('hero.bulanLabel')}
          </span>
          <Select defaultValue="sep">
            <SelectTrigger className={fieldTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sep">
                {t('bookingBar.bulanOptions.sep')}
              </SelectItem>
              <SelectItem value="okt">
                {t('bookingBar.bulanOptions.okt')}
              </SelectItem>
              <SelectItem value="nov">
                {t('bookingBar.bulanOptions.nov')}
              </SelectItem>
              <SelectItem value="des">
                {t('bookingBar.bulanOptions.des')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex min-w-[150px] flex-1 items-center gap-2.5 border-l border-line px-3.5 py-2.5">
        <Users className="size-[18px] shrink-0 text-landing-muted" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[.66rem] font-bold tracking-[.05em] text-landing-muted uppercase">
            {t('hero.jamaahLabel')}
          </span>
          <Select defaultValue="satu">
            <SelectTrigger className={fieldTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="satu">
                {t('bookingBar.jamaahOptions.satu')}
              </SelectItem>
              <SelectItem value="dua">
                {t('bookingBar.jamaahOptions.dua')}
              </SelectItem>
              <SelectItem value="keluarga">
                {t('bookingBar.jamaahOptions.keluarga')}
              </SelectItem>
              <SelectItem value="rombongan">
                {t('bookingBar.jamaahOptions.rombongan')}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="brand" className="m-0.5">
        {t('hero.ctaCekKetersediaan')}
      </Button>
    </div>
  );
}
