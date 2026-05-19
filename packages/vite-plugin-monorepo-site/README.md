# vite-plugin-monorepo-site

Vite plugin that generates static HTML pages from markdown files in monorepo package directories, with an optional index of all pages available as a virtual module.

## Install

```bash
npm install @mrkev/vite-plugin-monorepo-site
```

## Usage

```ts
// vite.config.ts
import monorepoSitePlugin from "@mrkev/vite-plugin-monorepo-site";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    monorepoSitePlugin({
      pages: {
        include: [
          resolve(__dirname, "../my-package"),
          resolve(__dirname, "../another-package"),
        ],
        template: "template.html",
      },
    }),
  ],
});
```

## Options

```ts
type Options = {
  /** Shiki theme for syntax highlighting (default: "nord") */
  theme?: BundledTheme;
  /** FilterPattern for .md transform imports (default: **\/*.md) */
  include?: FilterPattern;
  exclude?: FilterPattern;
  markdown?: MarkdownItOptions;
  /** When provided, enables static HTML page generation */
  pages?: PagesOptions;
};

type PagesOptions = {
  /** Directories to scan for markdown files. Supports glob patterns. */
  include: string | string[];
  /** Path to an HTML template file relative to the Vite root. */
  template?: string;
  /** Output subdirectory within build.outDir. */
  outDir?: string;
  /** Filenames to exclude (case-insensitive). Defaults to DEFAULT_PAGES_EXCLUDE. */
  exclude?: string[];
};
```

### Template

The template file uses `{{ page.X }}` interpolation. Available variables:

| Variable | Description |
|---|---|
| `{{ page.title }}` | Page title (from frontmatter, or derived from filename) |
| `{{ page.content }}` | Rendered HTML content (not escaped) |
| `{{ page.description }}` | From frontmatter |
| any frontmatter key | Any other frontmatter field |

```html
<!-- template.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>{{ page.title }}</title>
    <meta property="og:title" content="{{ page.title }}" />
    <meta property="og:description" content="{{ page.description }}" />
  </head>
  <body>
    {{ page.content }}
  </body>
</html>
```

### README → index.html

If a directory contains `README.md` (case-insensitive) and no `index.html`, it is output as `index.html` instead of `readme.html`.

### Default excludes

The following filenames are excluded by default (`DEFAULT_PAGES_EXCLUDE`):

- `CLAUDE.md`, `AGENTS.md`, `GEMINI.md`, `COPILOT.md` — coding agent instruction files
- `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md`

Pass a custom `exclude` array to override this list entirely.

## Virtual module

Import `virtual:markdown-pages` anywhere in your app to get metadata for all generated pages:

```ts
import pages from "virtual:markdown-pages";
// PageMeta[]

pages.forEach((page) => {
  console.log(page.url);        // e.g. "./my-package/index.html"
  console.log(page.title);      // from frontmatter or derived
  console.log(page.attributes); // all frontmatter fields
});
```

Add a type declaration so TypeScript recognizes the import:

```ts
// virtual.d.ts
declare module "virtual:markdown-pages" {
  import type { PageMeta } from "@mrkev/vite-plugin-monorepo-site";
  const pages: PageMeta[];
  export default pages;
}
```

## Markdown imports

Without `pages` configured, the plugin still works as a transform — `.md` files imported in your app are converted to JS modules:

```ts
import doc from "./README.md";

doc.html;      // rendered HTML string
doc.metadata;  // frontmatter attributes
doc.filename;  // "README.md"
doc.path;      // absolute file path
```
