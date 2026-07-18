import type { FlightHotelPackage } from '@repo/shared';
import type { PackageCardData } from '@/features/landing/data/packages';

type Labels = {
  typeUmrah: string;
  typeUmrahPlus: string;
  typeHajj: string;
  nightsUnit: string;
  mealFullBoard: string;
  mealHalfBoard: string;
  mealRoomOnly: string;
  transitVia: (city: string) => string;
  emptyHotel: string;
};

function formatPrice(price: number, currency: string, locale: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  } catch {
    // Unknown currency code — fall back to a plain grouped number.
    return `${currency} ${new Intl.NumberFormat(locale).format(price)}`;
  }
}

function hotelLine(
  stay: FlightHotelPackage['stays'][number] | undefined,
  emptyHotel: string,
): { name: string; distance: string } {
  if (!stay) return { name: emptyHotel, distance: '' };

  let dist = stay.distanceNote ?? '';
  if (stay.distanceMeters != null) {
    if (dist === 'Less than') {
      dist = `< ${stay.distanceMeters}m`;
    } else if (dist === 'Approx.') {
      dist = `± ${stay.distanceMeters}m`;
    } else if (!dist) {
      dist = `${stay.distanceMeters}m`;
    }
  }

  return { name: stay.displayName, distance: dist };
}

/** Derive the landing card's display fields from an API travel package.
 * Only the fields the card renders are produced — category, badge colour, and
 * the paired destination from the placeholder model are intentionally dropped
 * (see prd/landing/CONTEXT.md, "derive & simplify"). */
export function toPackageCardData(
  pkg: FlightHotelPackage,
  locale: string,
  labels: Labels,
): PackageCardData {
  const typeBadge =
    pkg.type === 'hajj'
      ? labels.typeHajj
      : pkg.type === 'umrah_plus'
        ? labels.typeUmrahPlus
        : labels.typeUmrah;

  const meal =
    pkg.mealPlan === 'full_board'
      ? labels.mealFullBoard
      : pkg.mealPlan === 'half_board'
        ? labels.mealHalfBoard
        : pkg.mealPlan === 'room_only'
          ? labels.mealRoomOnly
          : '';

  const stars =
    pkg.stays.reduce((max, stay) => Math.max(max, stay.starRating ?? 0), 0) ||
    5;

  const makkah = pkg.stays.find((stay) => /mak/i.test(stay.destination));
  const madinah = pkg.stays.find((stay) => /mad/i.test(stay.destination));

  const airline = pkg.flight.isDirect
    ? pkg.flight.airlineName
    : `${pkg.flight.airlineName} ${labels.transitVia(
        pkg.flight.transitCityName ?? pkg.flight.transitAirport ?? '',
      )}`;

  const firstDeparture = [...pkg.departures].sort(
    (a, b) =>
      new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime(),
  )[0];

  let departureDate = '';
  if (firstDeparture) {
    try {
      departureDate = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(new Date(firstDeparture.departureDate));
    } catch {
      departureDate = firstDeparture.departureDate;
    }
  }

  return {
    badge: typeBadge,
    // Umrah Plus / Hajj get the gold accent; plain umrah keeps the brand badge.
    badgeVariant: pkg.type === 'umrah' ? 'default' : 'gold',
    featured: true,
    stars,
    name: pkg.title,
    subtitle: pkg.description ?? '',
    priceMain: formatPrice(pkg.price, pkg.currency, locale),
    priceUnit: '',
    departureDate,
    durationValue: `${pkg.durationNights} ${labels.nightsUnit}`,
    airline,
    direct: pkg.flight.isDirect,
    hotelMakkah: hotelLine(makkah, labels.emptyHotel),
    hotelMadinah: hotelLine(madinah, labels.emptyHotel),
    footNote: meal,
  };
}
