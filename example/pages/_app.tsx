import type { AppProps } from 'next/app';
import './_app.css';

import { getActualDefaultLocale, setCookieLocale } from 'next-multilingual';
import { useRouter } from 'next/router';

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter();
  const { locales, defaultLocale, locale } = router;
  /**
   * Next.js always expose the default locale with URLs without prefixes. If anyone use these URLs, we want to overwrite them
   * with the actual (default) locale.
   */
  if (locale === defaultLocale) {
    router.locale = getActualDefaultLocale(locales, defaultLocale);
  }
  setCookieLocale(router.locale); // Persist locale on page load (will be re-used when hitting `/`).

  return <Component {...pageProps} />;
}
