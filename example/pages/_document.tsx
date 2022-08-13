import { getHtmlLang } from 'next-multilingual'
import Document, { Head, Html, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html lang={getHtmlLang(this)} translate="no" className="notranslate">
        <Head>
          <meta name="google" content="notranslate" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
