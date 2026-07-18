export interface Article {
  slug: string;
  chip: string;
  date: string;
  title: string;
  excerpt: string;
  /** Path under /public. Undefined -> solid brand-700 placeholder (no photo yet). */
  image?: string;
}

// First 3 cards, rendered on load.
export const initialArticles: Article[] = [
  {
    slug: 'panduan-tawaf',
    chip: 'Ibadah',
    date: '15 Juli 2026',
    title: 'Panduan Lengkap Tawaf: Tata Cara & Doanya',
    excerpt: 'Langkah demi langkah menunaikan tawaf dengan benar dan khusyuk.',
  },
  {
    slug: 'masa-berlaku-visa-90-hari',
    chip: 'Info Visa',
    date: '10 Juli 2026',
    title: 'Masa berlaku visa umrah kini sampai 90 hari',
    excerpt: 'Aturan baru memberi jamaah lebih banyak keleluasaan.',
  },
  {
    slug: 'waktu-terbaik-umrah-pasca-haji',
    chip: 'Panduan',
    date: '28 Juni 2026',
    title: 'Waktu terbaik umrah setelah musim haji',
    excerpt: 'Cuaca lebih sejuk dan suasana lebih tenang.',
  },
];

// Auto-loaded 2-at-a-time on scroll (IntersectionObserver), 3 rounds = the whole pool.
export const articlePool: Article[] = [
  {
    slug: 'cara-sai-shafa-marwah',
    chip: 'Ibadah',
    date: '8 Juli 2026',
    title: 'Cara Melakukan Sai antara Shafa & Marwah',
    excerpt: 'Panduan sai lengkap dengan doa di setiap putaran.',
  },
  {
    slug: 'checklist-umrah-pertama',
    chip: 'Persiapan',
    date: '1 Juli 2026',
    title: 'Checklist lengkap untuk jamaah umrah pertama',
    excerpt: 'Dari dokumen sampai perlengkapan ibadah.',
  },
  {
    slug: 'sejarah-masjidil-haram',
    chip: 'Destinasi',
    date: '24 Juni 2026',
    title: 'Sejarah Masjidil Haram di Makkah',
    excerpt: 'Mengenal sejarah dan keutamaan tempat paling suci.',
  },
  {
    slug: 'aplikasi-nusuk',
    chip: 'Tips',
    date: '18 Juni 2026',
    title: 'Aplikasi Nusuk: yang wajib disiapkan jamaah',
    excerpt: 'Langkah mengatur izin dan janji sebelum berangkat.',
  },
  {
    slug: 'keutamaan-ziarah-nabawi',
    chip: 'Destinasi',
    date: '12 Juni 2026',
    title: 'Keutamaan Ziarah ke Masjid Nabawi',
    excerpt: 'Adab dan keistimewaan berziarah di Madinah.',
    image: '/images/landing/dest-nabawi.jpg',
  },
  {
    slug: 'isi-koper-umrah',
    chip: 'Tips',
    date: '5 Juni 2026',
    title: 'Isi koper umrah: yang perlu & sering terlupa',
    excerpt: 'Panduan packing agar bagasi sesuai batas maskapai.',
  },
];

export interface SidebarPick {
  number: string;
  title: string;
  category: string;
}

// "Panduan Pilihan" — persistent sidebar SEO link list (distinct copy from the article feed).
export const sidebarPicks: SidebarPick[] = [
  {
    number: '01',
    title: 'Panduan Lengkap Tawaf: Tata Cara & Doanya',
    category: 'Ibadah',
  },
  {
    number: '02',
    title: 'Cara Melakukan Sai antara Shafa & Marwah',
    category: 'Ibadah',
  },
  {
    number: '03',
    title: 'Sejarah Masjidil Haram di Makkah',
    category: 'Destinasi',
  },
  {
    number: '04',
    title: 'Keutamaan Ziarah ke Masjid Nabawi, Madinah',
    category: 'Destinasi',
  },
  {
    number: '05',
    title: 'Syarat & Cara Mengurus Visa Umrah 2026',
    category: 'Info Visa',
  },
  {
    number: '06',
    title: 'Persiapan Umrah Pertama Kali: Checklist Lengkap',
    category: 'Persiapan',
  },
];
