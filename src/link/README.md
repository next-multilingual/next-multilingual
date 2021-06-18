# next-multilingual/link

To use localized URLs, we provide a `MulLink` component that that extends Next.js' `Link` component:

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

The browser will show the following link:

```html
<a href="/fr-ca/nous-joindre">
```

As the data for this mapping is not immediately available during rendering, make sure that the following configuration is present in your application's `next.config.js` to correctly prerender (SSR) links:

```js
module.exports = {
  webpack(config, { isServer }) {
    if (isServer) {
      config.resolve.alias['next-multilingual/link$'] = require.resolve('next-multilingual/link-ssr');
    }
    return config;
  }
};
```

Look in the `example` directory to see a complete implementation in action.
