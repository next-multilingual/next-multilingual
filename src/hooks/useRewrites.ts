import { getClientBuildManifest } from 'next/dist/client/route-loader';
import { Rewrite } from 'next/dist/lib/load-custom-routes';
import { useEffect, useState } from 'react';

type ManifestRewrites = {
  afterFiles: Rewrite[];
};

export function useRewrites(): Rewrite[] {
  const [rewrites, setRewrites] = useState<Rewrite[]>([]);

  useEffect(() => {
    getClientBuildManifest()
      .then((manifest) => {
        // Next.js needs to add types https://github.com/vercel/next.js/blob/d130f63c416b21adc67dc3c755ad6e1a707e2cc8/packages/next/build/webpack/plugins/build-manifest-plugin.ts#L41
        setRewrites(((manifest.__rewrites as unknown) as ManifestRewrites).afterFiles as Rewrite[]);
      })
      .catch(console.error);
  }, []);

  return rewrites;
}
