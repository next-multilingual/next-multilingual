import type { AppProps } from 'next/app'
import './_app.css'

import { setCookieLocale, useActualLocale } from 'next-multilingual'
import { useRouter } from 'next/router'

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  // Forces Next.js to use the actual (proper) locale.
  useActualLocale()
  // The next two lines are optional, to enable smart locale detection on the homepage.
  const router = useRouter()
  // Persist locale on page load (only used on `/` when using smart locale detection).
  setCookieLocale(router.locale)
  return <Component {...pageProps} />
}
