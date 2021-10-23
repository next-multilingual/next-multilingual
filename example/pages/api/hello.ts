import type { NextApiRequest, NextApiResponse } from 'next';
import { getMessages } from 'next-multilingual/messages';

type Schema = {
  message: string;
};

export default function handler(request: NextApiRequest, response: NextApiResponse<Schema>): void {
  const messages = getMessages(request.headers['accept-language']);
  response.status(200).json({ message: messages.format('message') });
}
