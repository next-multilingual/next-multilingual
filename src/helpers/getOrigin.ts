import getConfig from 'next/config';

export function getOrigin(): string | Error {
  const {
    publicRuntimeConfig: { origin },
  } = getConfig();

  if (!origin) {
    throw new Error(
      'Please add a key "origin" with a fully-qualified URL (protocol + domain) in "publicRuntimeConfig" object in' +
        ' next.config.js file'
    );
  }

  const originURL = new URL(origin);

  if (!originURL.protocol || !originURL.protocol.startsWith('http')) {
    throw new Error('Please add a valid (http / https) protocol to your domain');
  }
  return originURL.toString();
}
