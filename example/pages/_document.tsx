import { getActualLocale, normalizeLocale } from 'next-multilingual';
import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render(): JSX.Element {
    const { locale, locales, defaultLocale, props } = this.props.__NEXT_DATA__;
    const pagePropsActualLocale = props?.pageProps?.resolvedLocale;
    const actualLocale = pagePropsActualLocale
      ? pagePropsActualLocale
      : getActualLocale(locale, defaultLocale, locales);

    return (
      <Html lang={normalizeLocale(actualLocale)} translate="no" className="notranslate">
        <Head>
          <meta name="google" content="notranslate" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
