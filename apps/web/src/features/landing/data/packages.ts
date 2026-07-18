import { pairedDestinations } from '@/features/landing/data/destinations';

export type PackageCategory = 'hemat' | 'premium' | 'keluarga';

export interface TravelPackage {
  slug: string;
  category: PackageCategory;
  badge: string;
  badgeVariant: 'default' | 'gold';
  featured: boolean;
  stars: number;
  name: string;
  subtitle: string;
  priceMain: string;
  priceUnit: string;
  durationValue: string;
  airline: string;
  direct: boolean;
  hotelMakkah: string;
  hotelMadinah: string;
  footNote: string;
  /** The destination shown alongside this package in the pair-rows layout. */
  destination: (typeof pairedDestinations)[number];
}

// Placeholder data — prices, hotel names, airlines are prototype values.
// Replace before launch; see prd/landing/00-overview.md.
export const packages: TravelPackage[] = [
  {
    slug: 'umrah-reguler',
    category: 'hemat',
    badge: 'Hemat',
    badgeVariant: 'default',
    featured: false,
    stars: 4,
    name: 'Umrah Reguler',
    subtitle: 'Paket seimbang untuk umrah pertama yang nyaman.',
    priceMain: 'Rp 28,9',
    priceUnit: 'jt',
    durationValue: '9 hari',
    airline: 'Saudia (transit Jeddah)',
    direct: false,
    hotelMakkah: 'Al Kiswah Towers · ±450 m',
    hotelMadinah: 'Al Eiman Taibah · ±300 m',
    footNote: 'Quad · belum termasuk perlengkapan',
    destination: pairedDestinations[0],
  },
  {
    slug: 'umrah-nyaman',
    category: 'premium',
    badge: 'Paling Diminati',
    badgeVariant: 'gold',
    featured: true,
    stars: 5,
    name: 'Umrah Nyaman',
    subtitle: 'Penerbangan langsung dan hotel view Haram.',
    priceMain: 'Rp 42,5',
    priceUnit: 'jt',
    durationValue: '12 hari',
    airline: 'Garuda Indonesia',
    direct: true,
    hotelMakkah: 'Swissôtel Al Maqam · view Haram',
    hotelMadinah: 'The Oberoi Madina · depan Nabawi',
    footNote: 'Double · grup maks 25 jamaah',
    destination: pairedDestinations[1],
  },
  {
    slug: 'umrah-keluarga',
    category: 'keluarga',
    badge: 'Keluarga',
    badgeVariant: 'default',
    featured: false,
    stars: 4,
    name: 'Umrah Keluarga',
    subtitle: 'Kamar connecting, jadwal fleksibel, ramah anak & lansia.',
    priceMain: 'Rp 31,8',
    priceUnit: 'jt',
    durationValue: '10 hari',
    airline: 'Saudia',
    direct: true,
    hotelMakkah: 'Hilton Suites Makkah · ±350 m',
    hotelMadinah: 'Crowne Plaza Madinah · ±250 m',
    footNote: 'Anak di bawah 5 th diskon',
    destination: pairedDestinations[2],
  },
  {
    slug: 'umrah-express',
    category: 'hemat',
    badge: 'Singkat',
    badgeVariant: 'default',
    featured: false,
    stars: 4,
    name: 'Umrah Express',
    subtitle: 'Untuk cuti terbatas — fokus ibadah inti di Makkah.',
    priceMain: 'Rp 24,5',
    priceUnit: 'jt',
    durationValue: '6 hari',
    airline: 'Etihad Airways',
    direct: true,
    hotelMakkah: 'Anjum Makkah · ±500 m',
    hotelMadinah: 'Leader Al Muna Kareem · 1 malam',
    footNote: 'Quad · kuota terbatas',
    destination: pairedDestinations[3],
  },
];
