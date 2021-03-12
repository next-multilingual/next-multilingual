interface GetSourceUrlProps {
  rewrites;
  locale: string;
  path: string;
}
export const getSourceUrl = ({ rewrites, locale, path }: GetSourceUrlProps): string => {
  const lcPath = `/${locale}${path}`;
  const match = rewrites.find(({ destination, locale }) => locale === false && destination === lcPath);
  return match ? match.source : lcPath;
};
