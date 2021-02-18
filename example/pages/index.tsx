import { IntlLink } from '../../lib/intl-link';
import { useRouter } from 'next/router';

export default function IndexPage() {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  return (
    <div>
      <h1>Homepage</h1>
      <p>Current locale: {locale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <LanguageSwitcher locales={locales} locale={locale}></LanguageSwitcher>
      <br />
      <br />
      <IntlLink href="/about-us" locale={locale}>
        <a>About us page</a>
      </IntlLink>
    </div>
  );
}

type LanguageSwitcherProps = {
  locale: string;
  locales: string[];
};

function LanguageSwitcher(props: LanguageSwitcherProps) {
  const { locale, locales } = props;
  for (let supportedLocale of locales) {
    if (locale !== supportedLocale) {
      return (
        <IntlLink href="/" locale={supportedLocale}>
          <a>Switch language</a>
        </IntlLink>
      );
    }
  }
}
