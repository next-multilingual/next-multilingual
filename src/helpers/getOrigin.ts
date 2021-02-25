import getConfig from 'next/config';

export const getOrigin = (): string | Error => {
  const {
    publicRuntimeConfig: { origin },
  } = getConfig();

  if (!origin) {
    throw new Error(
      'Please add a key "origin" in "publicRuntimeConfig" object in next.config.js file'
    );
  }
  return origin;
};
