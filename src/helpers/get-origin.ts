/**
 * Get the current environment's URL origin (protocol + domain).
 *
 * @returns The normalized (lowercase, without a trailing slash) URL origin used to generate fully-qualified URLs.
 */
export function getOrigin(): string {
  const origin = process.env.NEXT_PUBLIC_ORIGIN;

  if (!origin) {
    throw new Error(
      'Please add NEXT_PUBLIC_ORIGIN in your current environment variable with a fully-qualified URL (protocol + domain)'
    );
  }

  try {
    // Only valid URLs can create a URL object without throwing errors.
    const originUrl = new URL(origin);

    // Make sure that the configured URL has a valid protocol.
    if (!['http', 'https'].includes(originUrl.protocol.slice(0, -1))) {
      throw new Error();
    }

    // Make sure that the configured URL does not include a path (Next.js' `basePath` should be used instead).
    if (originUrl.pathname !== '/') {
      throw new Error();
    }
  } catch (error) {
    throw new Error(
      'Please make sure that your NEXT_PUBLIC_ORIGIN environment variable is a fully-qualified URL (e.g. https://example.com) without any path'
    );
  }

  return (origin.endsWith('/') ? origin.slice(0, 1) : origin).toLocaleLowerCase();
}
