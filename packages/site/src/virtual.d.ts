declare module "virtual:markdown-pages" {
  import type { PageMeta } from "vite-plugin-monorepo-site";
  const pages: PageMeta[];
  export default pages;
}
