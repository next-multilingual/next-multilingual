import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { getActualDefaultLocale } from '../../lib';
import './_app.css';

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
  return <Component {...pageProps} />;
}
