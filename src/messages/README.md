# next-multilingual/messages

## Usage

Look in the `example` directory to see a complete implementation in action.

Here are the step by step actions that were applied on the example:

1. Install `properties-json-loader` (e.g. `npm i properties-json-loader`) - this will allow to natively import `properties` files used to localize the URLs and other strings.

## useMessages()

```ini
# Component.en-US.properties
foo = The foo message
bar = A bar message
```

```js
// Component.tsx
import { useMessages } from 'next-multilingual/messages';

function Component() {
  const messages = useMessages();
  messages.foo === 'The foo message'; // in the en-US locale
}
```

The `useMessages()` hook automatically loads messages from `.properties` files that are next to its usage site.
This requires the `next-multilingual/babel-plugin` Babel plugin to be in use.
The [recommended way](https://nextjs.org/docs/advanced-features/customizing-babel-config) to do that is to include a `.babelrc` file in your project:

```json
{
  "presets": ["next/babel"],
  "plugins": ["next-multilingual/babel-plugin"]
}
```
