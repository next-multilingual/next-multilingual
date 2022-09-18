import NextJsHead from 'next/head'
import { MultilingualHead, MultilingualHeadProps } from '.'
import { highlight, log, normalizeLocale } from '../'
import { getLocalizedUrlFromRewrites } from '../helpers/get-localized-url-from-rewrites'
import { getSsrRewrites } from '../helpers/get-ssr-rewrites'
import {
  getParametersFromPath,
  hydrateRouteParameters,
  pathContainsParameters,
  useRouter,
} from '../router'

// Throw a clear error is this is included by mistake on the client side.
if (typeof window !== 'undefined') {
  throw new Error(
    '`next-multilingual/head/ssr` must only be used on the server, please use `next-multilingual/head` instead'
  )
}

/**
 * Head is a wrapper around Next.js' `Head` that provides alternate links with localized URLs and a canonical link.
 *
 * @returns The Next.js `Head` component, including alternative links for SEO.
 */
const Head: MultilingualHead = ({ localizedRouteParameters, children }: MultilingualHeadProps) => {
  const { pathname, basePath, locale, locales, query } = useRouter()

  // Check if it's a dynamic route and if we have all the information to generate the links.
  if (pathContainsParameters(pathname)) {
    for (const locale of locales) {
      const routeParameters = localizedRouteParameters ? localizedRouteParameters[locale] : {}
      const hydratedUrlPath = hydrateRouteParameters(pathname, routeParameters, true)
      if (pathContainsParameters(hydratedUrlPath)) {
        const missingParameters = getParametersFromPath(hydratedUrlPath)
        log.warn(
          `unable to generate canonical and alternate links for the path ${highlight(
            pathname
          )} because the following route parameter${
            missingParameters.length > 1 ? 's are' : ' is'
          } missing for ${highlight(normalizeLocale(locale))}: ${highlight(
            missingParameters.join(',')
          )}. Did you forget to use ${highlight('getLocalizedRouteParameters')} on your page?`
        )
        return <NextJsHead>{children}</NextJsHead>
      }
    }
  }

  /**
   * Next.js' `<Head>` does not allow nested components, so we are using simple JSX. Details here:
   *
   * @see https://github.com/vercel/next.js/issues/17721 (closed issue)
   * @see https://nextjs.org/docs/api-reference/next/head (Next.js documentation)
   *
   * | title, meta or any other elements (e.g., script) need to be contained as direct children of the Head
   * | element, or wrapped into maximum one level of <React.Fragment> or arrays—otherwise the tags won't
   * | be correctly picked up on client-side navigation.
   */
  return (
    <NextJsHead>
      <link
        rel="canonical"
        href={getLocalizedUrlFromRewrites(
          getSsrRewrites(),
          { pathname, query },
          locale,
          true,
          basePath
        )}
        key="canonical-link"
      />
      {locales?.map((locale) => {
        const query =
          localizedRouteParameters && localizedRouteParameters[locale]
            ? localizedRouteParameters[locale]
            : {}
        return (
          <link
            rel="alternate"
            href={getLocalizedUrlFromRewrites(
              getSsrRewrites(),
              {
                pathname,
                query,
              },
              locale,
              true,
              basePath
            )}
            hrefLang={normalizeLocale(locale)}
            key={`alternate-link-${locale}`}
          />
        )
      })}
      {children}
    </NextJsHead>
  )
}

export default Head
