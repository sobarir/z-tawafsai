'use client';

import type { Flight } from '@repo/shared';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FlightLegsDialogProps {
  flight: Flight | null;
  onOpenChange: (open: boolean) => void;
}

export function FlightLegsDialog({
  flight,
  onOpenChange,
}: FlightLegsDialogProps) {
  const t = useTranslations('schedule.flights');
  const tFields = useTranslations('schedule.flights.fields');
  const tLegRole = useTranslations('schedule.flights.legRole');

  return (
    <Dialog open={!!flight} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {flight ? `${flight.operatingAirline}${flight.flightNumber}` : ''}
          </DialogTitle>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>{tFields('legRole')}</TableHead>
              <TableHead>{tFields('legDepAirport')}</TableHead>
              <TableHead>{tFields('legArrAirport')}</TableHead>
              <TableHead>{tFields('legDeparture')}</TableHead>
              <TableHead>{tFields('legArrival')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flight?.legs.map((leg) => (
              <TableRow key={leg.id}>
                <TableCell>{leg.legSequence}</TableCell>
                <TableCell>{tLegRole(leg.role)}</TableCell>
                <TableCell>{leg.depAirport}</TableCell>
                <TableCell>{leg.arrAirport}</TableCell>
                <TableCell>
                  {new Date(leg.departureTime).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(leg.arrivalTime).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {t('legsSummary', { count: flight?.legs.length ?? 0 })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
