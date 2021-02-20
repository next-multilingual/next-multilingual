import { useEffect, useState } from 'react';

export const useGetOriginUrl = (): string | null => {
  const [origin, setOrigin] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  return origin;
};
