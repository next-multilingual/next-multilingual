import getConfig from 'next/config';

export const getOrigin = (): string | Error => {
  const {
    publicRuntimeConfig: { origin },
  } = getConfig();

  const originURL = new URL(origin);

  if (!originURL) {
    throw new Error(
      'Please add a key "origin" with a fully-qualified URL (protocol + domain) in "publicRuntimeConfig" object in' +
        ' next.config.js file'
    );
  }

  if (!originURL.protocol || !/https?/.test(originURL.protocol)) {
    throw new Error('Please add a valid (http / https) protocol to your domain');
  }
  return originURL.toString();
};
