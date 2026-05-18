# vite-plugin-markdown

    NOTE: not published to npm

Vite plugin to import Markdown files as HTML or structured data.

## Installation

```sh
# npm
npm install --save-dev vite-plugin-markdown

# yarn
yarn add -D vite-plugin-markdown

# pnpm
pnpm add -D vite-plugin-markdown
```

## Usage

```js
// vite.config.js
import markdown from "@mrkev/vite-plugin-markdown";

export default {
  // ...
  plugins: [markdown()],
};
```

Then Markdown files can be imported as modules:

```js
import readme from "./README.md";

console.log(readme.html); // rendered HTML string
```

## License

MIT
