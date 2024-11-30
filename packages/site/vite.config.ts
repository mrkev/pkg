// import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
// import highlight from "rehype-highlight";
import { defineConfig } from "vite";
// from: https://mikebifulco.com/posts/mdx-auto-link-headings-with-rehype-slug
// add IDs to any h1-h6 tag that doesn't have one, using a slug made from its text
// import rehypeSlug from "rehype-slug";
// import { Mode, plugin as markdown } from "vite-plugin-markdown";
import { resolve } from "path";
import markdownPlugin from "@mheedev/rollup-plugin-markdown";

// Builds the site
// https://vitejs.dev/config/
export default defineConfig({
  appType: "mpa",
  plugins: [
    react(),
    // markdown({ mode: [Mode.HTML] }),
    markdownPlugin(),
    // mdx({
    //   format: "mdx",
    //   recmaPlugins: [highlight, rehypeSlug],
    // }) as any,
  ],
  build: {
    outDir: "../../docs",
    rollupOptions: {
      input: {
        site: "./index.html",
        vitePluginFaust: resolve(__dirname, "./vite-plugin-faust.html"),
      },
    },
    // minify: false,
  },
  // instead of having absolute paths pointing at assets in `index.html`, use
  // relative paths. Works better with github pages where /assets/foobar.js
  // referes to another site
  base: "./",
});
