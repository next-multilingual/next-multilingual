import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { getActualLocale, normalizeLocale } from 'next-multilingual';

class MyDocument extends Document {
  render(): ReactElement {
    const { locale, locales, defaultLocale, props } = this.props.__NEXT_DATA__;
    const pagePropsActualLocale = props?.pageProps?.actualLocale;
    const actualLocale = pagePropsActualLocale
      ? pagePropsActualLocale
      : getActualLocale(locale, defaultLocale, locales);

    return (
      <Html lang={normalizeLocale(actualLocale)}>
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
