import type { PluginOption, ResolvedConfig } from "vite";
import { FaustLoader } from "./FaustLoader.js";
import { LibFaustPkg } from "./LibFaustPkg.js";

export default function faustLoader(): PluginOption {
  const loader = new FaustLoader();
  return {
    name: "faust-lodaer-plugin",

    configResolved(resolvedConfig: ResolvedConfig) {
      return loader.configResolved(resolvedConfig);
    },

    async transform(_src, id) {
      return loader.transform(_src, id);
    },

    async load(id: string) {
      console.log("this", this);
      return loader.load(id, this);
    },

    buildStart() {
      const libfaustTmp = LibFaustPkg.cpTmp();
      loader.libFaustPkg = libfaustTmp;
    },

    buildEnd() {
      loader.libFaustPkg?.cleanup();
    },

    configureServer(server) {
      return loader.configureServer(server);
    },
  };
}
