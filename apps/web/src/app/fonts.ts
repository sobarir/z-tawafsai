import { Amiri, Fredoka, Plus_Jakarta_Sans } from 'next/font/google';

export const fontSans = Fredoka({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
  display: 'swap',
});

// Hotel-search feature only (prd/hotels/31-design.md) — display serif +
// body sans for the mizan visual identity, scoped to that feature's tree.
export const fontHotelDisplay = Amiri({
  subsets: ['latin', 'arabic'],
  weight: ['400', '700'],
  variable: '--font-hotel-display',
  display: 'swap',
});

export const fontHotelBody = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hotel-body',
  display: 'swap',
});
