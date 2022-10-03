import { useActualLocale } from 'next-multilingual'
import type { AppProps } from 'next/app'
import './_app.css'

const ExampleApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  useActualLocale() // Forces Next.js to use the actual (proper) locale.
  return <Component {...pageProps} />
}

export default ExampleApp
