export interface Destination {
  slug: string;
  location: string;
  name: string;
  description: string;
  /** Path under /public, relative to the app root. Undefined -> gradient placeholder. */
  image?: string;
  /** CSS background-position for the photo, matching the approved prototype crop. */
  imagePosition?: string;
  /** Gradient placeholder for destinations without a photo yet. */
  gradient?: string;
}

// Paired with a package card in the pair-rows section (one destination per package row).
// Tuple-typed so packages.ts can index into it without an `undefined` union.
export const pairedDestinations: [
  Destination,
  Destination,
  Destination,
  Destination,
] = [
  {
    slug: 'masjidil-haram',
    location: 'Makkah',
    name: 'Masjidil Haram',
    description: "Pusat tawaf, mengelilingi Ka'bah.",
    image: '/images/landing/dest-haram.jpg',
    imagePosition: 'center 40%',
  },
  {
    slug: 'masjid-nabawi',
    location: 'Madinah',
    name: 'Masjid Nabawi',
    description: 'Kubah hijau yang ikonik.',
    image: '/images/landing/dest-nabawi.jpg',
    imagePosition: 'center 35%',
  },
  {
    slug: 'jabal-nur',
    location: 'Makkah',
    name: 'Jabal Nur',
    description: 'Gua Hira, tempat wahyu pertama.',
    image: '/images/landing/dest-jabalnur.jpg',
  },
  {
    slug: 'masjid-quba',
    location: 'Madinah',
    name: 'Masjid Quba',
    description: 'Masjid pertama dalam Islam.',
    image: '/images/landing/dest-quba.jpg',
    imagePosition: 'center 42%',
  },
];

// "Destinasi Ziarah Lainnya" grid below the pair rows — no photos yet.
export const moreDestinations: Destination[] = [
  {
    slug: 'jabal-uhud',
    location: 'Madinah',
    name: 'Jabal Uhud',
    description: 'Menziarahi para syuhada Perang Uhud.',
    gradient: 'linear-gradient(160deg, #5c6647, #333a28)',
  },
  {
    slug: 'masjid-qiblatain',
    location: 'Madinah',
    name: 'Masjid Qiblatain',
    description: 'Tempat perpindahan arah kiblat.',
    gradient: 'linear-gradient(160deg, #48503b, #2a301f)',
  },
  {
    slug: 'jabal-tsur',
    location: 'Makkah',
    name: 'Jabal Tsur',
    description: 'Gua persembunyian saat hijrah.',
    gradient: 'linear-gradient(160deg, #6b5a3f, #3a2f1f)',
  },
  {
    slug: 'padang-arafah',
    location: 'Makkah',
    name: 'Padang Arafah',
    description: 'Jabal Rahmah, puncak ibadah haji.',
    gradient: 'linear-gradient(160deg, #8a7a4a, #4a3f22)',
  },
  {
    slug: 'masjid-aisyah-tanim',
    location: 'Makkah',
    name: "Masjid Aisyah (Tan'im)",
    description: 'Miqat untuk mengambil ihram umrah.',
    gradient: 'linear-gradient(160deg, #48503b, #333a28)',
  },
];
