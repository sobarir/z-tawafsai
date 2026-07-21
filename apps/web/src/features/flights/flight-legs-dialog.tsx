'use client';

import type { Flight } from '@repo/shared';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';
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
import { formatMinutes } from '@/libs/format-duration';

interface FlightLegsDialogProps {
  flight: Flight | null;
  onOpenChange: (open: boolean) => void;
}

function parseTimeToMinutes(timeStr: string, dayOffset: number) {
  const [hours = 0, minutes = 0] = timeStr.split(':').map(Number);
  return dayOffset * 24 * 60 + hours * 60 + minutes;
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
            {flight?.legs.map((leg, index) => {
              const prevLeg = index > 0 ? flight.legs[index - 1] : null;
              let transitRow = null;

              if (prevLeg && prevLeg.arrAirport === leg.depAirport) {
                const arrMins = parseTimeToMinutes(
                  prevLeg.arrivalTimeLocal,
                  prevLeg.arrivalDayOffset,
                );
                const depMins = parseTimeToMinutes(
                  leg.departureTimeLocal,
                  leg.departureDayOffset,
                );
                const transitMins = depMins - arrMins;

                if (transitMins > 0) {
                  transitRow = (
                    <TableRow key={`transit-${leg.id}`} className="bg-muted/30">
                      <TableCell
                        colSpan={6}
                        className="text-center text-xs text-muted-foreground py-1.5"
                      >
                        Transit in {leg.depAirport}:{' '}
                        {formatMinutes(transitMins)}
                      </TableCell>
                    </TableRow>
                  );
                }
              }

              return (
                <Fragment key={leg.id}>
                  {transitRow}
                  <TableRow>
                    <TableCell>{leg.legSequence}</TableCell>
                    <TableCell>{tLegRole(leg.role)}</TableCell>
                    <TableCell>{leg.depAirport}</TableCell>
                    <TableCell>{leg.arrAirport}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <span>{leg.departureTimeLocal}</span>
                        {leg.departureDayOffset > 0 && (
                          <sup className="text-[10px] font-bold text-orange-600 mt-1">
                            +{leg.departureDayOffset}
                          </sup>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <span>{leg.arrivalTimeLocal}</span>
                        {leg.arrivalDayOffset > 0 && (
                          <sup className="text-[10px] font-bold text-orange-600 mt-1">
                            +{leg.arrivalDayOffset}
                          </sup>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
        <p className="text-sm text-muted-foreground">
          {t('legsSummary', { count: flight?.legs.length ?? 0 })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
