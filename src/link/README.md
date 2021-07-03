# next-multilingual/link

To use localized URLs, `next-multilingual/link` provides a `MulLink` component that that extends Next.js' `Link` component:

```tsx
import { MulLink } from 'next-multilingual/link';

export default function ContactUs() {
  return (
    <>
      <MulLink href="/contact-us">
        <a>Contact us</a>
      </MulLink>
    </>
  );
}
```

In English the link will show just like in Next.js. But in when another locale is selected, you will get the localized URLs. See the example below for when `fr-ca` is selected:

```html
<a href="/fr-ca/nous-joindre">
```

As the data for this mapping is not immediately available during rendering, `next-multilingual/link-ssr` will take care of the server side rendering (SSR). By using `next-multilingual/config`, the Webpack configuration will be added automatically for you, so you should not need to ever directly use `next-multilingual/link-ssr`.

Look in the [`example`](../../example) directory to see a complete implementation using `MulLink` in action.
