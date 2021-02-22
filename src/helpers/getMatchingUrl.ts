interface GetMatchingUrlProps {
  rewrites;
  locale: string;
  path: string;
}
export const getMatchingUrl = ({ rewrites, locale, path }: GetMatchingUrlProps): string => {
  const lcPath = `/${locale}${path}`;
  const match = rewrites.find(({ destination, locale }) => {
    return locale === false && destination === lcPath;
  });
  return match ? match.source : path;
};
