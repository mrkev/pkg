// adapted from: https://www.npmjs.com/package/@mheedev/rollup-plugin-markdown?activeTab=code
import { createFilter, type FilterPattern } from "@rollup/pluginutils";
import frontmatter from "front-matter";
import MarkdownIt from "markdown-it";
import type { Options as MarkdownItOptions } from "markdown-it";
import path from "path";
import { bundledLanguages, createHighlighter, type BundledTheme } from "shiki";

type Options = {
  theme?: BundledTheme;
  include?: FilterPattern;
  exclude?: FilterPattern;
  markdown?: MarkdownItOptions;
};

type MarkdownPlugin = {
  name: string;
  transform(
    code: string,
    id: string,
  ): Promise<{ code: string; map: { mappings: string } } | undefined>;
};

export default function markdownPlugin(options: Options = {}): MarkdownPlugin {
  const filter = createFilter(options.include ?? ["**/*.md"], options.exclude);
  const theme = options.theme ?? "nord";

  // initialize once for the entire build
  const highlighterPromise = createHighlighter({
    themes: [theme],
    langs: Object.keys(bundledLanguages),
  });

  return {
    name: "vite-plugin-markdown",

    async transform(code: string, id: string) {
      if (!filter(id)) return;
      if (path.extname(id) !== ".md") return;

      const highlighter = await highlighterPromise;
      const parsed = frontmatter<Record<string, unknown>>(code);

      const md = new MarkdownIt({
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
  };
}
