import { useRouter } from 'next/router';
import Layout from '../layout/Layout';
import Messages from 'messageformat-runtime/messages';
import frCA from './about-us.fr-CA.properties';
import enCA from './about-us.en-CA.properties';

export default function AboutUs() {
  const router = useRouter();
  const { locale, defaultLocale } = router;
  const messages = new Messages(
    { 'fr-CA': frCA, 'en-CA': enCA },
    defaultLocale
  );

  messages.locale = locale;

  return (
    <Layout title="About us">
      <h1>{messages.get('title')}</h1>
      <p>{messages.get('details')}</p>
    </Layout>
  );
}
