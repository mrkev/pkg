# vite-plugin-monorepo-site

Vite plugin that generates static HTML pages from markdown files in monorepo package directories, with package metadata and a virtual module index available for building a site landing page.

## Install

```bash
npm install vite-plugin-monorepo-site
```

## Usage

```ts
// vite.config.ts
import monorepoSitePlugin from "vite-plugin-monorepo-site";
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    monorepoSitePlugin({
      packages: {
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
  packages?: PackagesOptions;
};

type PackagesOptions = {
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
| `{{ page.meta }}` | Full block of standard HTML meta tags (title, og:title, description, etc.) |
| `{{ page.content }}` | Rendered HTML content (not escaped) |
| `{{ page.title }}` | Page title (from frontmatter, or derived from filename) |
| `{{ page.description }}` | From frontmatter or `package.json` |
| `{{ page.author }}` | From frontmatter or `package.json` |
| `{{ page.keywords }}` | From frontmatter or `package.json` (comma-separated) |
| `{{ page.version }}` | From `package.json` |
| `{{ page.homepage }}` | From `package.json` |
| `{{ page.license }}` | From `package.json` |
| `{{ page.repository }}` | From `package.json` (normalized URL; deep-links to `directory` if set) |
| any frontmatter key | Any other frontmatter field |

Frontmatter values override `package.json` values. `{{ page.meta }}` and `{{ page.content }}` are inserted as raw HTML; all other variables are HTML-escaped.

```html
<!-- template.html -->
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {{ page.meta }}
    <link rel="stylesheet" href="https://unpkg.com/normalize.css" />
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

Import `virtual:monorepo-packages` anywhere in your app to get metadata for all packages and their generated pages:

```ts
import packages from "virtual:monorepo-packages";
// MonorepoPackage[]

packages.forEach((pkg) => {
  console.log(pkg.name);        // from package.json
  console.log(pkg.description); // from package.json
  console.log(pkg.repository);  // normalized URL
  console.log(pkg.pages);       // PageMeta[] for this package
});
```

A named `pages` export provides a flat list across all packages:

```ts
import { pages } from "virtual:monorepo-packages";
// PageMeta[]
```

Add a type declaration so TypeScript recognizes the imports:

```ts
// virtual.d.ts
declare module "virtual:monorepo-packages" {
  import type { MonorepoPackage, PageMeta } from "vite-plugin-monorepo-site";
  const packages: MonorepoPackage[];
  export default packages;
  export const pages: PageMeta[];
}
```

### Types

```ts
type MonorepoPackage = {
  name?: string;
  description?: string;
  version?: string;
  homepage?: string;
  license?: string;
  author?: string;
  keywords?: string[];
  repository?: string;
  pages: PageMeta[];
};

type PageMeta = {
  /** Relative URL to the generated page, e.g. "./my-package/index.html" */
  url: string;
  title: string;
  attributes: Record<string, unknown>;
};
```

## Markdown imports

Without `packages` configured, the plugin still works as a transform — `.md` files imported in your app are converted to JS modules:

```ts
import doc from "./README.md";

doc.html;      // rendered HTML string
doc.metadata;  // frontmatter attributes
doc.filename;  // "README.md"
doc.path;      // absolute file path
```
