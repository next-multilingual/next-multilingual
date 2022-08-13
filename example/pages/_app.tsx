import type { AppProps } from 'next/app'
import './_app.css'

import { setCookieLocale, useRouter } from 'next-multilingual'

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  const router = useRouter()
  setCookieLocale(router.locale) // Persist locale on page load (will be re-used when hitting `/`).
  return <Component {...pageProps} />
}
