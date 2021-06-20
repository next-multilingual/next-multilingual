import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ReactElement } from 'react';
import { normalizeLocale } from 'next-multilingual';

class MyDocument extends Document {
  render(): ReactElement {
    return (
      <Html lang={normalizeLocale(this.props.locale)}>
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
