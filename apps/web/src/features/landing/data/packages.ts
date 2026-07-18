/** The fields `PackageCard` actually renders. The landing "Paket" cards are fed
 * live featured packages from the API, mapped to this shape by
 * `landing/lib/to-package-card-data.ts`. */
export interface PackageCardData {
  badge: string;
  badgeVariant: 'default' | 'gold';
  featured: boolean;
  stars: number;
  name: string;
  subtitle: string;
  priceMain: string;
  priceUnit: string;
  departureDate: string;
  durationValue: string;
  airline: string;
  direct: boolean;
  hotelMakkah: { name: string; distance: string };
  hotelMadinah: { name: string; distance: string };
  footNote: string;
}
