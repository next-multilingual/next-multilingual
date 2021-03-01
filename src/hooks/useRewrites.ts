import { getClientBuildManifest } from 'next/dist/client/route-loader';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { useEffect, useState } from 'react';

export const useRewrites = (): Rewrite[] => {
  const [rewrites, setRewrites] = useState<Rewrite[]>([]);

  useEffect(() => {
    getClientBuildManifest()
      .then((manifest) => {
        // The ClientManifestType is incorrect
        setRewrites((manifest.__rewrites as unknown) as Rewrite[]);
      })
      .catch(console.error);
  }, []);

  return rewrites;
};
