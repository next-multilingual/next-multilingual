import { getHtmlLang } from 'next-multilingual'
import { DocumentProps, Head, Html, Main, NextScript } from 'next/document'

const Document: React.FC<DocumentProps> = (documentProps) => {
  return (
    <Html lang={getHtmlLang(documentProps)} translate="no" className="notranslate">
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

export default Document
