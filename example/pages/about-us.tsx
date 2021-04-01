import Layout from '../layout/Layout';
import messages from './about-us.fr-CA.properties';

console.warn('messages', messages);

export default function AboutUs() {
  return (
    <Layout title="About us">
      <h1>This is the about us</h1>
      <p>We are the best.</p>
    </Layout>
  );
}
