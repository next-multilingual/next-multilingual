import { NextApiRequest } from 'next';
import { ReactElement } from 'react';
import { IntlLink } from '../../lib/intl-link';
import { useRouter } from 'next/router';
import { IntlHead } from '../../lib/intl-head';

export default function IndexPage({ locale }): ReactElement {
  console.warn('props in index', locale);
  const router = useRouter();
  const { locales, defaultLocale } = router;

  return (
    <div>
      <IntlHead title="Home Page" language={locale}>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
        />
      </IntlHead>
      <h1>Homepage</h1>
      <p>Current locale: {locale}</p>
      <p>Default locale: {defaultLocale}</p>
      <p>Configured locales: {JSON.stringify(locales)}</p>
      <LanguageSwitcher locales={locales} locale={locale} />
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
  for (const supportedLocale of locales) {
    if (locale !== supportedLocale) {
      return (
        <IntlLink href="/" locale={supportedLocale}>
          <a>Switch language</a>
        </IntlLink>
      );
    }
  }
}

export const getServerSideProps = async ({ req }: { req: NextApiRequest }) => {
  const language = req.headers['accept-language'];
  const locale = language.split(',')[0];

  return {
    props: {
      locale
    }
  };
};
