import type { AppProps } from 'next/app'
import './_app.css'

import { useActualLocale } from 'next-multilingual'

export default function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  useActualLocale() // Forces Next.js to use the actual (proper) locale.
  return <Component {...pageProps} />
}
