import { ReactElement } from 'react';
import { IntlLink } from 'next-intl-router/lib/intl-link';
import Layout from '../../layout/Layout';

export default function ContactUs(): ReactElement {
  return (
    <Layout title="About Us">
      <h1>This is the contact</h1>
      <sub>Enter your message below to get in touch with us.</sub>
      <label>
        Message
        <textarea />
      </label>
      <button type="submit">Send</button>
      <br />
      <IntlLink href="/contact-us/message-sent">
        <a>IntlLink with page id</a>
      </IntlLink>
    </Layout>
  );
}
