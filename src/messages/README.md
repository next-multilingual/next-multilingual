# next-multilingual/messages

`next-multilingual/messages` comes with its own hook `useMessages` to allow pages and components to access localized string easily.

## How does it work?

The hook itself handles i18n functions related to strings such as using [ICU](https://unicode-org.github.io/icu/) syntax to handle plurals in many languages or doing simple operations like replacing named variables with their correct value.

Behind the scene, `next-multilingual/messages/babel-plugin` will automatically inject all strings related to a page or component. 

The rule for this to work is simple. Let's say you have a component called `footer.tsx`, to create strings in multiple language you need to create `footer.en-US.properties` (where `en-US` is the locale of the strings). Basically the format is `<file name without the extension>.<locale>.properties`. It's also case sensitive, so make sure to follow the exact pattern.

Inside the `properties` files, you have 3 actions you can do:

- Create inline comments (used as context for linguists during translation)
- Create a message key
- Create a string (associated with a key)

```ini
# This is the message in the footer at the bottom of pages
my-app.footer-component.footer = © Footer
```

And now to use it:

```tsx
import type { ReactElement } from 'react';
import { useMessages } from 'next-multilingual/messages';

export default function Footer(): ReactElement {
  const messages = useMessages();
  return <footer>{messages.footer}</footer>;
}
```

## But wait...

Looking at this, you might have questions such as:

- Why `.properties` files?
- Why is the key so long and doesn't even seem to be used by `useMessages`
- Why use ICU?
- Why use named variables?
- Etc.

No problem, all the answers an be found in the `messages` section in the [design decisions](../../docs/design-decisions.md) document.

