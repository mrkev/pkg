import { createFilter, type FilterPattern } from "@rollup/pluginutils";
import frontmatter from "front-matter";
import fs from "fs";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import path from "path";
import { bundledLanguages, createHighlighter, type BundledTheme } from "shiki";
import type { Plugin, ResolvedConfig } from "vite";

const VIRTUAL_MONOREPO_ID = "virtual:monorepo-packages";
const RESOLVED_VIRTUAL_MONOREPO_ID = "\0virtual:monorepo-packages";
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

export type PackagesOptions = {
  /** Directories to scan for markdown files. Supports glob patterns. */
  include: string | string[];
  /** Path to the HTML template file (relative to Vite root). Optional — a minimal wrapper is used if omitted. */
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
  packages?: PackagesOptions;
};

export type PageMeta = {
  /** Relative URL to the generated page (e.g. "./vite-plugin-faust/index.html") */
  url: string;
  title: string;
  attributes: Record<string, unknown>;
};

export type MonorepoPackage = {
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

type PkgInfo = Omit<MonorepoPackage, "pages">;

type PageEntry = PageMeta & {
  outputPath: string;
  renderedHtml: string;
};

type BuildResult = {
  pkgList: MonorepoPackage[];
  entries: PageEntry[];
};

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    {{ page.meta }}
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

function buildMetaTags(page: Record<string, string>): string {
  const e = htmlEscape;
  const lines: string[] = [];

  lines.push(`<title>${e(page.title ?? "")}</title>`);
  lines.push(`<meta property="og:title" content="${e(page.title ?? "")}" />`);
  lines.push(`<meta name="twitter:card" content="summary" />`);
  lines.push(`<meta name="twitter:title" content="${e(page.title ?? "")}" />`);

  if (page.description) {
    lines.push(`<meta name="description" content="${e(page.description)}" />`);
    lines.push(`<meta property="og:description" content="${e(page.description)}" />`);
    lines.push(`<meta name="twitter:description" content="${e(page.description)}" />`);
  }
  if (page.author) {
    lines.push(`<meta name="author" content="${e(page.author)}" />`);
  }
  if (page.keywords) {
    lines.push(`<meta name="keywords" content="${e(page.keywords)}" />`);
  }

  return lines.join("\n    ");
}

function interpolate(template: string, page: Record<string, string>): string {
  return template.replace(/\{\{\s*page\.(\w+)\s*\}\}/g, (_, key: string) => {
    const value = page[key] ?? "";
    return key === "content" || key === "meta" ? value : htmlEscape(value);
  });
}

function readPackageJson(dir: string): PkgInfo {
  const pkgPath = path.join(dir, "package.json");
  try {
    const raw = JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as Record<string, unknown>;
    const info: PkgInfo = {};

    if (typeof raw.name === "string") info.name = raw.name;
    if (typeof raw.description === "string") info.description = raw.description;
    if (typeof raw.version === "string") info.version = raw.version;
    if (typeof raw.homepage === "string") info.homepage = raw.homepage;
    if (typeof raw.license === "string") info.license = raw.license;

    if (raw.author != null) {
      info.author =
        typeof raw.author === "string"
          ? raw.author
          : typeof (raw.author as Record<string, unknown>).name === "string"
            ? ((raw.author as Record<string, unknown>).name as string)
            : undefined;
    }

    if (Array.isArray(raw.keywords) && raw.keywords.length > 0) {
      info.keywords = (raw.keywords as unknown[]).filter(
        (k): k is string => typeof k === "string",
      );
    }

    if (raw.repository != null) {
      if (typeof raw.repository === "string") {
        info.repository = raw.repository;
      } else {
        const repo = raw.repository as Record<string, unknown>;
        if (typeof repo.url === "string") {
          let repoUrl = repo.url.replace(/^git\+/, "").replace(/\.git$/, "");
          if (typeof repo.directory === "string") {
            repoUrl = `${repoUrl}/tree/HEAD/${repo.directory}`;
          }
          info.repository = repoUrl;
        }
      }
    }

    return info;
  } catch {
    return {};
  }
}

function pkgInfoToTemplateMeta(info: PkgInfo): Record<string, string> {
  const meta: Record<string, string> = {};
  if (info.name != null) meta.packageName = info.name;
  if (info.description != null) meta.description = info.description;
  if (info.version != null) meta.version = info.version;
  if (info.homepage != null) meta.homepage = info.homepage;
  if (info.license != null) meta.license = info.license;
  if (info.author != null) meta.author = info.author;
  if (info.keywords != null) meta.keywords = info.keywords.join(", ");
  if (info.repository != null) meta.repository = info.repository;
  return meta;
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
  let buildResult: BuildResult = { pkgList: [], entries: [] };

  async function build(root: string): Promise<BuildResult> {
    if (!options.packages) return { pkgList: [], entries: [] };
    const { include, template, outDir = "", exclude = DEFAULT_PAGES_EXCLUDE } = options.packages;
    const excludeSet = new Set(exclude.map((f) => f.toLowerCase()));
    const md = await getMd();

    const templateHtml = template
      ? fs.readFileSync(path.resolve(root, template), "utf-8")
      : null;

    const dirs = await resolveDirectories(include, root);
    const pkgList: MonorepoPackage[] = [];
    const entries: PageEntry[] = [];

    for (const dir of dirs) {
      const pkgInfo = readPackageJson(dir);
      const templateMeta = pkgInfoToTemplateMeta(pkgInfo);
      const pkgPages: PageMeta[] = [];

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

        const frontmatterAttrs = Object.fromEntries(
          Object.entries(parsed.attributes)
            .filter(([, v]) => v != null)
            .map(([k, v]) => [k, typeof v === "string" ? v : JSON.stringify(v)]),
        );

        // package.json fields are base defaults; frontmatter overrides them
        const mergedAttrs: Record<string, unknown> = { ...pkgInfo, ...parsed.attributes };
        const title = (mergedAttrs.title as string | undefined) ?? defaultTitle;

        const relOutputPath = dirRelPath ? `${dirRelPath}/${outputName}` : outputName;
        const outputPath = outDir ? `${outDir}/${relOutputPath}` : relOutputPath;
        const url = `./${outputPath}`;

        const page: Record<string, string> = {
          ...templateMeta,
          ...frontmatterAttrs,
          content: html,
          title,
          url,
        };
        page.meta = buildMetaTags(page);
        const renderedHtml = interpolate(templateHtml ?? DEFAULT_TEMPLATE, page);

        const pageMeta: PageMeta = { url, title, attributes: mergedAttrs };
        pkgPages.push(pageMeta);
        entries.push({ ...pageMeta, outputPath, renderedHtml });
      }

      pkgList.push({ ...pkgInfo, pages: pkgPages });
    }

    return { pkgList, entries };
  }

  return {
    name: "vite-plugin-monorepo-site",

    configResolved(config) {
      resolvedConfig = config;
    },

    async buildStart() {
      buildResult = await build(resolvedConfig?.root ?? process.cwd());
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
      if (id === VIRTUAL_MONOREPO_ID) return RESOLVED_VIRTUAL_MONOREPO_ID;
    },

    load(id) {
      if (id !== RESOLVED_VIRTUAL_MONOREPO_ID) return;
      const pages: PageMeta[] = buildResult.entries.map(
        ({ url, title, attributes }) => ({ url, title, attributes }),
      );
      return [
        `export default ${JSON.stringify(buildResult.pkgList)};`,
        `export const pages = ${JSON.stringify(pages)};`,
      ].join("\n");
    },

    async generateBundle() {
      if (!options.packages) return;
      for (const entry of buildResult.entries) {
        this.emitFile({
          type: "asset",
          fileName: entry.outputPath,
          source: entry.renderedHtml,
        });
      }
    },

    configureServer(server) {
      if (!options.packages) return;
      const templatePath = options.packages.template
        ? path.resolve(resolvedConfig.root, options.packages.template)
        : null;

      if (templatePath) server.watcher.add(templatePath);

      server.watcher.on("change", async (file) => {
        const isTemplate = templatePath !== null && file === templatePath;
        const isPkgJson = file.endsWith("package.json");
        if (!file.endsWith(".md") && !isTemplate && !isPkgJson) return;
        buildResult = await build(resolvedConfig.root);
        const mod = server.moduleGraph.getModuleById(RESOLVED_VIRTUAL_MONOREPO_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.hot.send({ type: "full-reload" });
      });

      server.middlewares.use(async (req, res, next) => {
        const rawUrl = req.url?.split("?")[0] ?? "/";
        let url = rawUrl;
        if (url.endsWith("/")) url += "index.html";
        else if (!path.extname(url)) url += "/index.html";
        if (!url.endsWith(".html")) return next();
        const match = buildResult.entries.find((e) => `/${e.outputPath}` === url);
        if (!match) return next();
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Cache-Control", "no-store");
        res.end(match.renderedHtml);
      });
    },
  };
}
