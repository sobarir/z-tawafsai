import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google';

// Sitewide body font — applied at the <html>/<body> level in layout.tsx.
export const fontSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
  display: 'swap',
});

// Sitewide heading/brand font (font-serif utility) — applied at the <html>
// level so it resolves everywhere, not just on the landing page.
export const fontSerif = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});
