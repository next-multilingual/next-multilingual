import type { NextApiRequest, NextApiResponse } from 'next'
import { isLocale } from 'next-multilingual'
import { getMessages } from 'next-multilingual/messages'
import { getLocalizedUrl } from 'next-multilingual/url'

/**
 * Example API schema.
 */
export type HelloApiSchema = {
  message: string
}

/**
 * Delay an executing code.
 *
 * @param milliseconds - The number of milliseconds to delay the execution.
 *
 * @returns An empty promise.
 */
const delay = (milliseconds: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds)
  })
}

/**
 * The "hello API" handler.
 */
const handler = async (
  request: NextApiRequest,
  response: NextApiResponse<HelloApiSchema>
): Promise<void> => {
  const locale = request.headers['accept-language']
  if (locale === undefined || !isLocale(locale)) {
    response.status(400)
    return
  }

  const messages = getMessages(locale)
  await delay(2000)
  response.status(200).json({
    message: messages.format('message', {
      contactUsUrl: await getLocalizedUrl('/contact-us', locale, undefined, true),
    }),
  })
}

export default handler
