import { FaustLoader } from "./FaustLoader.js";
import { LibFaustPkg } from "./LibFaustPkg.js";
import { nullthrows } from "./utils.js";

type FaustPlugin = {
  name: string;
  configResolved(config: unknown): void | Promise<void>;
  load(id: string): Promise<{ map: null; code: string } | undefined>;
  buildEnd(): void;
  configureServer(server: unknown): void;
};

export default function faustLoader(): FaustPlugin {
  const context = {
    _loader: null as FaustLoader | null,
    loader() {
      return nullthrows(this._loader);
    },
  };

  return {
    name: "faust-lodaer-plugin",

    async configResolved(resolvedConfig) {
      context._loader = await FaustLoader.ofConfigResolved(
        resolvedConfig as Parameters<typeof FaustLoader.ofConfigResolved>[0],
        LibFaustPkg.cpTmp(),
      );
    },

    async load(id: string) {
      return context.loader().load(
        id,
        this as unknown as Parameters<FaustLoader["load"]>[1],
      );
    },

    buildEnd() {
      context.loader().libFaustPkg.cleanup();
    },

    configureServer(server) {
      return context.loader().configureServer(
        server as Parameters<FaustLoader["configureServer"]>[0],
      );
    },
  };
}
