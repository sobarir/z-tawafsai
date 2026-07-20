'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type {
  CreateTravelPackageBookingInput,
  FlightHotelPackage,
} from '@repo/shared';
import { createTravelPackageBookingSchema } from '@repo/shared';
import { useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { EntityFormDialog } from '@/components/shared/entity-form-dialog';
import { NumberFormField } from '@/components/shared/number-form-field';
import { TextFormField } from '@/components/shared/text-form-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  getListTravelPackageBookingsQueryKey,
  getListTravelPackagesQueryKey,
  useCreateTravelPackageBooking,
  useDeleteTravelPackageBooking,
  useListTravelPackageBookings,
  useUpdateTravelPackageBooking,
} from '@/libs/api/generated/endpoints';
import {
  crudMutationOptions,
  useCrudFeedback,
} from '@/libs/api/use-crud-feedback';

type Departure = FlightHotelPackage['departures'][number];

interface TravelPackageInventoryDialogProps {
  travelPackage: FlightHotelPackage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TravelPackageInventoryDialog({
  travelPackage,
  open,
  onOpenChange,
}: TravelPackageInventoryDialogProps) {
  const t = useTranslations('travelPackagesAdmin.bookings');

  return (
    <EntityFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={
        travelPackage
          ? t('title', { name: travelPackage.title })
          : t('titleBare')
      }
      contentClassName="sm:max-w-2xl"
    >
      <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-1">
        {!travelPackage || travelPackage.departures.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('noDepartures')}
          </p>
        ) : (
          travelPackage.departures.map((departure) => (
            <DepartureInventoryPanel key={departure.id} departure={departure} />
          ))
        )}
      </div>
    </EntityFormDialog>
  );
}

function DepartureInventoryPanel({ departure }: { departure: Departure }) {
  const t = useTranslations('travelPackagesAdmin.bookings');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();

  const bookingsKey = getListTravelPackageBookingsQueryKey({
    departureId: departure.id,
  });
  const { data: bookings } = useListTravelPackageBookings({
    departureId: departure.id,
  });

  // Derive counts live from the bookings query so the panel updates the instant
  // a booking is added/cancelled, independent of the packages-list refetch.
  const bookedSeats = (bookings ?? [])
    .filter((booking) => booking.status === 'confirmed')
    .reduce((sum, booking) => sum + booking.pax, 0);
  const remaining =
    departure.totalSeats === null ? null : departure.totalSeats - bookedSeats;

  const feedback = useCrudFeedback(bookingsKey, 'travelPackagesAdmin');
  const invalidatePackages = () =>
    queryClient.invalidateQueries({
      queryKey: getListTravelPackagesQueryKey(),
    });

  const emptyBooking: CreateTravelPackageBookingInput = {
    departureId: departure.id,
    customerName: '',
    pax: 1,
    phone: undefined,
    notes: undefined,
  };

  const form = useForm<CreateTravelPackageBookingInput>({
    resolver: zodResolver(createTravelPackageBookingSchema),
    defaultValues: emptyBooking,
  });

  const createMutation = useCreateTravelPackageBooking({
    mutation: crudMutationOptions(feedback, 'createSuccess', () => {
      form.reset(emptyBooking);
      invalidatePackages();
    }),
  });
  const updateMutation = useUpdateTravelPackageBooking({
    mutation: crudMutationOptions(
      feedback,
      'updateSuccess',
      invalidatePackages,
    ),
  });
  const deleteMutation = useDeleteTravelPackageBooking({
    mutation: crudMutationOptions(
      feedback,
      'deleteSuccess',
      invalidatePackages,
    ),
  });

  const submit = form.handleSubmit(async (values) => {
    await createMutation.mutateAsync({ data: values });
  });

  const departureDate = departure.departureDate.split('T')[0];
  const dateRange = departure.returnDate
    ? `${departureDate} → ${departure.returnDate}`
    : departureDate;

  return (
    <fieldset className="flex flex-col gap-3 rounded-md border p-3">
      <legend className="flex items-center gap-2 px-1 text-sm font-medium">
        {dateRange}
      </legend>

      <div className="flex flex-wrap gap-2 text-xs">
        {departure.totalSeats === null ? (
          <Badge variant="outline">{t('untracked')}</Badge>
        ) : (
          <>
            <Badge variant="outline">
              {t('total')}: {departure.totalSeats}
            </Badge>
            <Badge variant="outline">
              {t('booked')}: {bookedSeats}
            </Badge>
            <Badge variant={remaining === 0 ? 'destructive' : 'default'}>
              {t('remaining')}: {remaining}
            </Badge>
          </>
        )}
      </div>

      {/* Existing bookings */}
      {bookings && bookings.length > 0 ? (
        <ul className="flex flex-col divide-y rounded-md border">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className="flex items-center gap-3 px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <span
                  className={
                    booking.status === 'cancelled'
                      ? 'line-through text-muted-foreground'
                      : 'font-medium'
                  }
                >
                  {booking.customerName}
                </span>
                <span className="ml-2 text-muted-foreground">
                  {t('paxCount', { count: booking.pax })}
                </span>
                {booking.phone ? (
                  <span className="ml-2 text-muted-foreground">
                    {booking.phone}
                  </span>
                ) : null}
              </div>
              {booking.status === 'confirmed' ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: booking.id,
                      data: { status: 'cancelled' },
                    })
                  }
                >
                  {t('cancel')}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={updateMutation.isPending}
                  onClick={() =>
                    updateMutation.mutate({
                      id: booking.id,
                      data: { status: 'confirmed' },
                    })
                  }
                >
                  {t('reactivate')}
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={tCommon('delete')}
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate({ id: booking.id })}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-muted-foreground">{t('noBookings')}</p>
      )}

      {/* Add booking */}
      <Form {...form}>
        <form
          onSubmit={submit}
          noValidate
          className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_6rem_1fr_auto] sm:items-end"
        >
          <TextFormField
            control={form.control}
            name="customerName"
            label={t('customerName')}
            placeholder={t('customerNamePlaceholder')}
          />
          <NumberFormField control={form.control} name="pax" label={t('pax')} />
          <TextFormField
            control={form.control}
            name="phone"
            label={t('phone')}
            placeholder={t('phonePlaceholder')}
            optional
          />
          <Button type="submit" size="sm" disabled={createMutation.isPending}>
            <Plus className="h-4 w-4" /> {t('addBooking')}
          </Button>
        </form>
      </Form>
    </fieldset>
  );
}
