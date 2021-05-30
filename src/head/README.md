### IntlHead

An `IntHead` component is a wrapper around **Next.js**
`<Head />` component. It injects the necessary alternate links.
At the moment of writing this package, Next.js has either a bug or an undocumented feature around `<Head />`
component. Because of it, it isn't possible to use our hook `useAlternateLinks()`.

For the following locales `['en-CA', 'fr-CA']` it will produce the following alternate links at `/`:

```html
<link rel="alternate" href="http://localhost:3000/en-CA/" hreflang="en-CA" />
<link rel="alternate" href="http://localhost:3000/fr-CA/" hreflang="fr-CA" />
<link rel="alternate" href="http://localhost:3000/" hreflang="x-default" />
```

```tsx
import { useRouter } from 'next/router';
import { IntlHead } from 'next-multilingual';

<IntlHead>
  <title>My awesome website</title>
  {/* You can add whatever links you wish here */}
</IntlHead>;
```

### UseCanonicalUrl

A `useCanonicalUrl` hook is provided to help with the canonical link

```tsx
import { useRouter } from 'next/router';
import { IntlHead, useCanonicalUrl } from 'next-multilingual';
const { locale } = useRouter();
const canonicalUrl = useCanonicalUrl(locale);

<IntlHead>
  <title>My awesome website</title>
  <link rel="canonical" href={canonicalUrl} />
</IntlHead>;
```

At the following URL `http://localhost:3000/fr-CA/à-propos-de-nous` This will produce the following link

```html
<link rel="canonical" href="http://localhost:3000/fr-CA/%C3%A0-propos-de-nous" />
```
