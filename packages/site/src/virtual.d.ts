declare module "virtual:monorepo-packages" {
  type PageMeta = {
    url: string;
    title: string;
    attributes: Record<string, unknown>;
  };
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
  const packages: MonorepoPackage[];
  export default packages;
  export const pages: PageMeta[];
}
