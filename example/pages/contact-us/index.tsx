import { useRouter } from 'next/router';
import { IntlLink } from '../../../lib/intl-link';

export default function ContactUs() {
  const { locale } = useRouter();
  return (
    <>
      <h1>This is the contact</h1>
      <sub>Enter your message below to get in touch with us.</sub>
      <label>
        Message
        <textarea></textarea>
      </label>
      <button type="submit">Send</button>
      <br />
      <IntlLink href="/contact-us/message-sent" locale={locale}>
        <a>IntlLink with page id</a>
      </IntlLink>
    </>
  );
}
