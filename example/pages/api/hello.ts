import type { NextApiRequest, NextApiResponse } from 'next';
import { getMessages } from 'next-multilingual/messages';

/**
 * Example API schema.
 */
type Schema = {
  message: string;
};

/**
 * Delay an executing code.
 *
 * @param milliseconds - The number of milliseconds to delay the execution.
 *
 * @returns An empty promise.
 */
function delay(milliseconds): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * The "hello API" handler.
 */
export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse<Schema>
): Promise<void> {
  const messages = getMessages(request.headers['accept-language']);
  await delay(2000);
  response.status(200).json({ message: messages.format('message') });
}
