'use client';

import { useLocale, useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useListTravelPackageEarnings } from '@/libs/api/generated/endpoints';
import { formatCurrency } from '@/libs/format-currency';

export function EarningsReport() {
  const t = useTranslations('travelPackagesAdmin.earnings');
  const locale = useLocale();
  const { data, isLoading } = useListTravelPackageEarnings();

  const earnings = data ?? [];

  // Grand total per currency (rows may span currencies).
  const totalsByCurrency = new Map<string, number>();
  for (const row of earnings) {
    totalsByCurrency.set(
      row.currency,
      (totalsByCurrency.get(row.currency) ?? 0) + row.totalEarned,
    );
  }

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">{t('loading')}</p>;
  }
  if (earnings.length === 0) {
    return <p className="text-sm text-muted-foreground">{t('empty')}</p>;
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('columns.provider')}</TableHead>
            <TableHead>{t('columns.currency')}</TableHead>
            <TableHead className="text-right">
              {t('columns.packages')}
            </TableHead>
            <TableHead className="text-right">
              {t('columns.bookings')}
            </TableHead>
            <TableHead className="text-right">{t('columns.pax')}</TableHead>
            <TableHead className="text-right">{t('columns.earned')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {earnings.map((row) => (
            <TableRow key={`${row.providerId}-${row.currency}`}>
              <TableCell className="font-medium">{row.providerName}</TableCell>
              <TableCell>{row.currency}</TableCell>
              <TableCell className="text-right">{row.packageCount}</TableCell>
              <TableCell className="text-right">{row.bookingCount}</TableCell>
              <TableCell className="text-right">{row.paxCount}</TableCell>
              <TableCell className="text-right font-semibold">
                {formatCurrency(row.totalEarned, row.currency, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          {[...totalsByCurrency.entries()].map(([currency, total]) => (
            <TableRow key={currency}>
              <TableCell colSpan={5} className="text-right font-medium">
                {t('total', { currency })}
              </TableCell>
              <TableCell className="text-right font-bold">
                {formatCurrency(total, currency, locale)}
              </TableCell>
            </TableRow>
          ))}
        </TableFooter>
      </Table>
    </div>
  );
}
