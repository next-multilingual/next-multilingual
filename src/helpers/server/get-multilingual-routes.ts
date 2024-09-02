import { existsSync, readdirSync } from 'node:fs'
import { extname } from 'node:path'
import { highlight, highlightFilePath, log, normalizeLocale } from '../..'
import { SLUG_KEY_ID, getMessagesFilePath, slugify } from '../../messages'
import { parsePropertiesFile } from '../../messages/properties'
import { isDynamicRoute, isOptionalCatchAllDynamicRoute } from '../../router'
import {
  NON_ROUTABLE_PAGE_FILES,
  PAGES_DIRECTORIES,
  PAGE_FILE_EXTENSIONS,
  getLastPathSegment,
  pagesFilePathToUrlPath,
  removePagesFileExtension,
} from '../paths-utils'

/** The `pages` directory currently used by Next.js. */
const PAGES_DIRECTORY = (() => {
  for (const pageDirectory of PAGES_DIRECTORIES) {
    if (existsSync(pageDirectory)) {
      return pageDirectory
    }
  }
})()

/**
 * Get the pages directory if it exists, otherwise throw an error.
 *
 * ⚠ This needs to be used instead of the `PAGES_DIRECTORY` constant, so that the check is done asynchronously to
 * avoid triggered false error on Netlify and Vercel.
 *
 * @returns The pages directory if it exists.
 */
export const getPagesDirectory = (): string => {
  if (!PAGES_DIRECTORY) {
    // This should never happen, so we are providing detailed logs just in case.
    const currentDirectory = readdirSync('.', { withFileTypes: true }).map(
      (directoryEntry) => directoryEntry.name
    )
    throw new Error(
      `cannot find the Next.js pages directory. Entries in the current directory (${process.cwd()}):\n\n - ${currentDirectory.join(
        '\n - '
      )}\n`
    )
  }
  return PAGES_DIRECTORY
}

/**
 * All possible permutations of the non-routable app-root-relative pages file paths. Pre-generating these will
 * avoid complex path manipulations and allow to deal with complete file paths only.
 */
export const NON_ROUTABLE_PAGES = ((): string[] => {
  const nonRoutablePages: string[] = []
  PAGES_DIRECTORIES.forEach((pagesDirectory) => {
    NON_ROUTABLE_PAGE_FILES.forEach((nonRoutablePageFile) => {
      PAGE_FILE_EXTENSIONS.forEach((pageFileExtension) =>
        nonRoutablePages.push(`${pagesDirectory}/${nonRoutablePageFile}${pageFileExtension}`)
      )
    })
  })
  return nonRoutablePages
})()

/**
 * Get the non-localized URL path from a directory entre path (e.g., `pages/hello/index.tsx` -> `/hello`).
 *
 * @param filesystemPath - A filesystem path (file or directory).
 *
 * @returns The non-localized URL path (e.g., `pages/hello/index.tsx` -> `/hello`).
 */
export const getNonLocalizedUrlPath = (filesystemPath: string): string => {
  const urlPath = pagesFilePathToUrlPath(filesystemPath)
  const urlPathSegments = urlPath.split('/')
  const lastUrlPathSegment = urlPathSegments.at(-1)

  if (lastUrlPathSegment && lastUrlPathSegment === 'index') {
    urlPathSegments.pop() // Indexes do not need the last segment.
  }

  return urlPathSegments.join('/')
}

/**
 * Is a URL path an API Route?
 *
 * @param urlPath - The URL path.
 *
 * @return True if the URL path is an API Route, otherwise false.
 */
export const isApiRoute = (urlPath: string): boolean => {
  return urlPath === '/api' || urlPath.startsWith('/api/')
}

/**
 * Is the last segment of a URL path localizable?
 *
 * @param urlPath - A URL path.
 *
 * @return True if the URL path localizable, otherwise false.
 */
export const isLastSegmentLocalizable = (urlPath: string): boolean => {
  return !isDynamicRoute(urlPath) || isOptionalCatchAllDynamicRoute(urlPath)
}

export class MultilingualRoute {
  /** The filesystem path (file or directory). */
  public filesystemPath: string
  /** The non-localized URL path of a route. */
  public nonLocalizedUrlPath: string
  /** An array of localized URL path objects. */
  public localizedUrlPaths: LocalizedUrlPath[] = []

  /**
   * A unique route entry, including its localized URL paths.
   *
   * @param filesystemPath - The filesystem path (file or directory).
   * @param locales - The locales that will support localized URL paths.
   * @param routes - The current route object array being constructed during a recursive call.
   */
  constructor(filesystemPath: string, locales: string[], routes: MultilingualRoute[]) {
    this.filesystemPath = filesystemPath
    this.nonLocalizedUrlPath = getNonLocalizedUrlPath(filesystemPath)
    const nonLocalizedSlug = getLastPathSegment(this.nonLocalizedUrlPath)
    const isLocalizable = isLastSegmentLocalizable(this.nonLocalizedUrlPath)
    const routeIsDynamicOptionalCatchAll = isOptionalCatchAllDynamicRoute(nonLocalizedSlug)

    const parentNonLocalizedUrlPath =
      (this.nonLocalizedUrlPath.match(/\//g) || []).length > 1
        ? this.nonLocalizedUrlPath
            .split('/')
            .slice(0, routeIsDynamicOptionalCatchAll ? -2 : -1)
            .join('/')
        : ''

    const parentRoute = parentNonLocalizedUrlPath
      ? routes.find((route) => route.nonLocalizedUrlPath === parentNonLocalizedUrlPath)
      : undefined

    locales.forEach((locale) => {
      const localizedSlug = isLocalizable ? this.getLocalizedSlug(filesystemPath, locale) : ''
      const applicableSlug = localizedSlug
        ? `${localizedSlug}${routeIsDynamicOptionalCatchAll ? `/${nonLocalizedSlug}` : ''}`
        : '' || nonLocalizedSlug
      const urlPath = `${
        parentRoute
          ? (parentRoute.localizedUrlPaths.find(
              (localizedUrlPath) => localizedUrlPath.locale === locale
            )?.urlPath ?? '')
          : ''
      }/${applicableSlug}`

      this.localizedUrlPaths.push({
        locale,
        urlPath,
      })
    })
  }

  /**
   * Get a localized slug.
   *
   * @param filesystemPath - The filesystem path (file or directory).
   * @param locale - The locale of the slug.
   *
   * @return The localized slug.
   */
  private getLocalizedSlug(filesystemPath: string, locale: string): string {
    const messagesFilePath = getMessagesFilePath(filesystemPath, locale)

    if (!existsSync(messagesFilePath)) {
      log.warn(
        `unable to create the ${highlight(normalizeLocale(locale))} slug for ${highlightFilePath(
          filesystemPath
        )}. The message file ${highlightFilePath(messagesFilePath)} does not exist.`
      )
      return ''
    }

    const keyValueObject = parsePropertiesFile(messagesFilePath)
    const slugKey = Object.keys(keyValueObject).find((key) => key.endsWith(`.${SLUG_KEY_ID}`))
    if (!slugKey) {
      log.warn(
        `unable to create the ${highlight(normalizeLocale(locale))} slug for ${highlightFilePath(
          filesystemPath
        )}. The message file ${highlightFilePath(
          messagesFilePath
        )} must include a key with the ${highlight(SLUG_KEY_ID)} identifier.`
      )
      return ''
    }
    return slugify(keyValueObject[slugKey], locale)
  }

  /**
   * Get a localized URL path.
   *
   * @param locale - The locale of the the path.
   *
   * @returns The localize URL path.
   */
  public getLocalizedUrlPath(locale: string): string {
    const localizedUrlPath = this.localizedUrlPaths.find(
      (localizedUrlPath) => localizedUrlPath.locale === locale
    )
    return localizedUrlPath?.urlPath ?? ''
  }
}

/**
 * An object that represents a localized URL path.
 */
export type LocalizedUrlPath = {
  /** The locale of the URL path. */
  locale: string
  /** The localized URL path. */
  urlPath: string
}

/**
 * Get the multilingual routes of a Next.js application.
 *
 * @param locales - The locales used by Next.js.
 * @param directoryPath - The directory being currently inspected for routes.
 * @param routes - The current route object array being constructed during a recursive call.
 *
 * @return The Next.js routes.
 */
export const getMultilingualRoutes = (
  locales: string[],
  directoryPath = getPagesDirectory(),
  routes: MultilingualRoute[] = []
): MultilingualRoute[] => {
  const nonLocalizedUrlPath = getNonLocalizedUrlPath(directoryPath)
  const isHomepage = nonLocalizedUrlPath === '/' ? true : false

  if (isApiRoute(nonLocalizedUrlPath)) {
    return routes // Skip if the URL path is a Next.js' API Route.
  }

  // Get the list of page files in scope.
  const pageFiles = readdirSync(directoryPath, { withFileTypes: true }).filter((directoryEntry) => {
    if (directoryEntry.isFile()) {
      return PAGE_FILE_EXTENSIONS.includes(extname(directoryEntry.name))
    }
    return false
  })

  // Get the list of directories.
  const directories = readdirSync(directoryPath, { withFileTypes: true }).filter((directoryEntry) =>
    directoryEntry.isDirectory()
  )

  // Start by checking indexes.
  const indexFound = (() => {
    for (const pageExtension of PAGE_FILE_EXTENSIONS) {
      const indexFilePath = `${directoryPath}/index${pageExtension}`
      if (existsSync(indexFilePath)) {
        addPageRoute(locales, indexFilePath, routes)
        return true // Only one index per directory.
      }
    }
    return false
  })()

  // Check for an optional catch-all dynamic route (acting as an index).
  const optionalCatchAllFound = (() => {
    for (const pageFile of pageFiles) {
      if (isOptionalCatchAllDynamicRoute(removePagesFileExtension(pageFile.name))) {
        addPageRoute(locales, `${directoryPath}/${pageFile.name}`, routes)
        return true // Only one optional catch-all dynamic route (acting as an index) per directory.
      }
    }
    return false
  })()

  // If there is no index, try to add a localized route on the directory, as long as its not the homepage.
  if (!indexFound && !optionalCatchAllFound && !isHomepage) {
    routes.push(new MultilingualRoute(directoryPath, locales, routes))
  }

  // Check all other files.
  pageFiles.forEach((pageFile) => {
    const pagePathSegment = removePagesFileExtension(pageFile.name)
    if (pagePathSegment === 'index' || isOptionalCatchAllDynamicRoute(pagePathSegment)) {
      return // Skip index file since it was already done first.
    }
    addPageRoute(locales, `${directoryPath}/${pageFile.name}`, routes)
  })

  // Look for sub-directories to build child routes.
  for (const directory of directories) {
    getMultilingualRoutes(locales, `${directoryPath}/${directory.name}`, routes)
  }

  return routes
}

/**
 * Add a Next.js page route into a routes array.
 *
 * @param locales - The locales used by Next.js.
 * @param pageFilePath - The file path of a Next.js page.
 * @param routes - The current route object array being constructed during a recursive call.
 */
const addPageRoute = (
  locales: string[],
  pageFilePath: string,
  routes: MultilingualRoute[]
): void => {
  if (!extname(pageFilePath)) {
    throw new Error(`invalid page file path ${pageFilePath}`)
  }
  const nonLocalizedUrlPath = getNonLocalizedUrlPath(pageFilePath)
  const lastSegmentIsLocalizable = isLastSegmentLocalizable(nonLocalizedUrlPath)
  const filePathsWithSlug = getFilePathsWithSlug(locales, pageFilePath).map((filePathWithSlug) =>
    highlightFilePath(filePathWithSlug)
  )
  const hasFilePathsWithSlug = filePathsWithSlug.length > 0

  // Check if the route is a non-routable page file.
  if (NON_ROUTABLE_PAGES.includes(pageFilePath)) {
    if (hasFilePathsWithSlug) {
      log.warn(
        `invalid slug${filePathsWithSlug.length > 1 ? 's' : ''} found in ${filePathsWithSlug.join(
          ', '
        )} since ${highlightFilePath(pageFilePath)} is a non-routable page file.`
      )
    }
    return // Skip as the file is non-routable.
  }

  // Check if the route already exists.
  const duplicateRoute = routes.find((route) => route.nonLocalizedUrlPath === nonLocalizedUrlPath)

  if (duplicateRoute) {
    if (hasFilePathsWithSlug) {
      log.warn(
        `the slug${filePathsWithSlug.length > 1 ? 's' : ''} found in ${filePathsWithSlug.join(
          ', '
        )} will be ignored since a duplicate page was detected using the non-localized path ${highlightFilePath(
          nonLocalizedUrlPath
        )}.`
      )
    }
    return // Skip since we do not want duplicate routes.
  }

  // Check if the page is a dynamic route.
  if (!lastSegmentIsLocalizable && hasFilePathsWithSlug) {
    log.warn(
      `the slug${filePathsWithSlug.length > 1 ? 's' : ''} found in ${filePathsWithSlug.join(
        ', '
      )} will be ignored since ${highlight(nonLocalizedUrlPath)} is a non-localizable route.`
    )
  }
  routes.push(new MultilingualRoute(pageFilePath, locales, routes))
}

/**
 * Get the paths of messages files that contains a `slug` key and that are associated with a Next.js page.
 *
 * @param locales - The locales used by Next.js.
 * @param pageFilePath - The file path of a Next.js page.
 *
 * @returns The paths of messages files that contains a `slug` key.
 */
const getFilePathsWithSlug = (locales: string[], pageFilePath: string): string[] => {
  const messageFilePaths: string[] = []

  locales.forEach((locale) => {
    const messagesFilePath = getMessagesFilePath(pageFilePath, locale)
    if (!existsSync(messagesFilePath)) {
      return
    }
    const keyValueObject = parsePropertiesFile(messagesFilePath)

    if (Object.keys(keyValueObject).some((key) => key.endsWith(`.${SLUG_KEY_ID}`))) {
      messageFilePaths.push(messagesFilePath)
    }
  })
  return messageFilePaths
}
