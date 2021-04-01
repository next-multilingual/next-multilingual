import { useRouter } from 'next/router';
import Layout from '../layout/Layout';
import Messages from 'messageformat-runtime/messages';
import frCA from './about-us.fr-CA.properties';
import enCA from './about-us.en-CA.properties';

const messages = new Messages({ 'fr-CA': frCA, 'en-CA': enCA }, 'en-CA');

export default function AboutUs() {
  const router = useRouter();
  const { locale, locales, defaultLocale } = router;

  return (
    <Layout title="About us">
      <h1>{messages.get('title', {}, locale)}</h1>
      <p>{messages.get('details', {}, locale)}</p>
    </Layout>
  );
}
