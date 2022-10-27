import bundleAnalyzer from '@next/bundle-analyzer'
import { getConfig } from 'next-multilingual/config'

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const multilingualConfig = getConfig('exampleApp', ['en-US', 'fr-CA'], 'en-US', {
  reactStrictMode: true,
  poweredByHeader: false,
  // basePath: '/some-path',
  // debug: true,
})

// Set base path dynamically.
if (process.env.BASE_PATH) {
  multilingualConfig.basePath = process.env.BASE_PATH
}

/** @type {import('next/dist/server/config-shared').I18NConfig} */
export const i18n = multilingualConfig.i18n

/** @type {import('next').NextConfig} */
export const config = multilingualConfig

export default withBundleAnalyzer(config)
