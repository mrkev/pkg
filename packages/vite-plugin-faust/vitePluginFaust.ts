import type { PluginOption, ResolvedConfig } from "vite";
import { FaustLoader } from "./FaustLoader.js";
import { LibFaustPkg } from "./LibFaustPkg.js";
import { nullthrows } from "./utils.js";

export default function faustLoader(): PluginOption {
  const context = {
    _loader: null as FaustLoader | null,
    loader() {
      return nullthrows(this._loader);
    },
  };

  return {
    name: "faust-lodaer-plugin",

    async configResolved(resolvedConfig: ResolvedConfig) {
      context._loader = await FaustLoader.ofConfigResolved(
        resolvedConfig,
        LibFaustPkg.cpTmp(),
      );
    },

    async load(id: string) {
      return context.loader().load(id, this);
    },

    buildEnd() {
      context.loader().libFaustPkg.cleanup();
    },

    configureServer(server) {
      return context.loader().configureServer(server);
    },
  };
}
