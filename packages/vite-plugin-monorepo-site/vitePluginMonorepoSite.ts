import { createFilter, type FilterPattern } from "@rollup/pluginutils";
import frontmatter from "front-matter";
import fs from "fs";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import path from "path";
import { bundledLanguages, createHighlighter, type BundledTheme } from "shiki";
import type { Plugin, ResolvedConfig } from "vite";

const VIRTUAL_PAGES_ID = "virtual:markdown-pages";
const RESOLVED_VIRTUAL_PAGES_ID = "\0virtual:markdown-pages";
const GLOB_CHARS = /[*?{}[\]!]/;

export const DEFAULT_PAGES_EXCLUDE = [
  "CLAUDE.md",
  "AGENTS.md",
  "GEMINI.md",
  "COPILOT.md",
  "CONTRIBUTING.md",
  "SECURITY.md",
  "CODE_OF_CONDUCT.md",
  "CHANGELOG.md",
];

export type PagesOptions = {
  /** Directories to scan for markdown files. Supports glob patterns. */
  include: string | string[];
  /** Path to the HTML template file (relative to Vite root). Use <!-- CONTENT --> as a slot. Optional — a minimal wrapper is used if omitted. */
  template?: string;
  /** Output subdirectory within build.outDir. */
  outDir?: string;
  /** Filenames to exclude (case-insensitive). Defaults to DEFAULT_PAGES_EXCLUDE. */
  exclude?: string[];
};

export type Options = {
  theme?: BundledTheme;
  /** FilterPattern for .md transform imports (default: **\/*.md) */
  include?: FilterPattern;
  exclude?: FilterPattern;
  markdown?: MarkdownItOptions;
  /** When provided, enables static HTML page generation */
  pages?: PagesOptions;
};

export type PageMeta = {
  /** Relative URL to the generated page (e.g. "./vite-plugin-faust/index.html") */
  url: string;
  title: string;
  attributes: Record<string, unknown>;
};

type PageEntry = PageMeta & {
  outputPath: string;
  renderedHtml: string;
};

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ page.title }}</title>
  </head>
  <body>
    {{ page.content }}
  </body>
</html>`;

function htmlEscape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function interpolate(template: string, page: Record<string, string>): string {
  return template.replace(/\{\{\s*page\.(\w+)\s*\}\}/g, (_, key: string) => {
    const value = page[key] ?? "";
    return key === "content" ? value : htmlEscape(value);
  });
}

async function resolveDirectories(
  patterns: string | string[],
  root: string,
): Promise<string[]> {
  const patternList = typeof patterns === "string" ? [patterns] : patterns;
  const { glob } = await import("tinyglobby");
  const dirs: string[] = [];

  for (const pattern of patternList) {
    if (!GLOB_CHARS.test(pattern)) {
      const abs = path.isAbsolute(pattern)
        ? pattern
        : path.resolve(root, pattern);
      try {
        if (fs.statSync(abs).isDirectory()) dirs.push(abs);
      } catch {
        // path doesn't exist, skip
      }
    } else {
      const matches = await glob([pattern], { cwd: root, absolute: true });
      for (const m of matches) {
        try {
          if (fs.statSync(m).isDirectory()) dirs.push(m);
        } catch {
          // skip
        }
      }
    }
  }

  return [...new Set(dirs)];
}

export default function monorepoSitePlugin(options: Options = {}): Plugin {
  const filter = createFilter(options.include ?? ["**/*.md"], options.exclude);
  const theme = options.theme ?? "nord";

  const highlighterPromise = createHighlighter({
    themes: [theme],
    langs: Object.keys(bundledLanguages),
  });

  let mdInstance: MarkdownIt | null = null;
  async function getMd(): Promise<MarkdownIt> {
    if (mdInstance) return mdInstance;
    const highlighter = await highlighterPromise;
    mdInstance = new MarkdownIt({
      html: true,
      highlight: (str, lang) => {
        if (!lang) return "";
        try {
          return highlighter.codeToHtml(str, { lang, theme });
        } catch {
          return "";
        }
      },
      ...options.markdown,
    });
    return mdInstance;
  }

  let resolvedConfig: ResolvedConfig;
  let pageEntries: PageEntry[] = [];

  async function buildPages(root: string): Promise<PageEntry[]> {
    if (!options.pages) return [];
    const { include, template, outDir = "", exclude = DEFAULT_PAGES_EXCLUDE } = options.pages;
    const excludeSet = new Set(exclude.map((f) => f.toLowerCase()));
    const md = await getMd();

    const templateHtml = template
      ? fs.readFileSync(path.resolve(root, template), "utf-8")
      : null;

    const dirs = await resolveDirectories(include, root);
    const entries: PageEntry[] = [];

    for (const dir of dirs) {
      const mdFiles = fs
        .readdirSync(dir)
        .filter((f) => f.toLowerCase().endsWith(".md") && !excludeSet.has(f.toLowerCase()))
        .map((f) => path.join(dir, f));

      const hasIndexHtml = fs.existsSync(path.join(dir, "index.html"));

      for (const file of mdFiles) {
        const source = fs.readFileSync(file, "utf-8");
        const parsed = frontmatter<Record<string, unknown>>(source);
        const html = md.render(parsed.body);

        const isReadme = path.basename(file).toLowerCase() === "readme.md";
        const outputName =
          isReadme && !hasIndexHtml
            ? "index.html"
            : path.basename(file).replace(/\.md$/i, ".html");

        const dirRelPath = path
          .relative(root, dir)
          .split(path.sep)
          .join("/")
          .replace(/^(\.\.\/)+/, "");

        const defaultTitle = dirRelPath
          ? `${dirRelPath}/${path.basename(file, ".md")}`
          : path.basename(file, ".md");
        const title = (parsed.attributes.title as string) ?? defaultTitle;

        const relOutputPath = dirRelPath
          ? `${dirRelPath}/${outputName}`
          : outputName;
        const outputPath = outDir ? `${outDir}/${relOutputPath}` : relOutputPath;
        const url = `./${outputPath}`;

        const page: Record<string, string> = {
          ...Object.fromEntries(
            Object.entries(parsed.attributes)
              .filter(([, v]) => v != null)
              .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]),
          ),
          content: html,
          title,
          url,
        };
        const renderedHtml = interpolate(templateHtml ?? DEFAULT_TEMPLATE, page);

        entries.push({ outputPath, url, title, renderedHtml, attributes: parsed.attributes });
      }
    }

    return entries;
  }

  return {
    name: "vite-plugin-monorepo-site",

    configResolved(config) {
      resolvedConfig = config;
    },

    async buildStart() {
      pageEntries = await buildPages(resolvedConfig?.root ?? process.cwd());
    },

    async transform(code: string, id: string) {
      if (!filter(id) || path.extname(id) !== ".md") return;
      const md = await getMd();
      const parsed = frontmatter<Record<string, unknown>>(code);
      const html = md.render(parsed.body);
      return {
        code: `export default ${JSON.stringify({
          html,
          metadata: parsed.attributes,
          filename: path.basename(id),
          path: id,
        })}`,
        map: { mappings: "" },
      };
    },

    resolveId(id) {
      if (id === VIRTUAL_PAGES_ID) return RESOLVED_VIRTUAL_PAGES_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_PAGES_ID) return;
      const meta: PageMeta[] = pageEntries.map(({ url, title, attributes }) => ({
        url,
        title,
        attributes,
      }));
      return `export default ${JSON.stringify(meta)}`;
    },

    async generateBundle() {
      if (!options.pages) return;
      for (const entry of pageEntries) {
        this.emitFile({
          type: "asset",
          fileName: entry.outputPath,
          source: entry.renderedHtml,
        });
      }
    },

    configureServer(server) {
      if (!options.pages) return;
      const templatePath = options.pages.template
        ? path.resolve(resolvedConfig.root, options.pages.template)
        : null;

      server.watcher.on("change", async (file) => {
        const isTemplate = templatePath !== null && file === templatePath;
        if (!file.endsWith(".md") && !isTemplate) return;
        pageEntries = await buildPages(resolvedConfig.root);
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_PAGES_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.hot.send({ type: "full-reload" });
      });

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0] ?? "/";
        if (!url.endsWith(".html")) return next();
        const match = pageEntries.find((e) => `/${e.outputPath}` === url);
        if (!match) return next();
        res.setHeader("Content-Type", "text/html");
        res.end(match.renderedHtml);
      });
    },
  };
}
