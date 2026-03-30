import { rmSync } from "node:fs";
import { createRequire } from "node:module";
import path from "path";
import { asTmpDirSync } from "./utils";

const require = createRequire(import.meta.url);
const FAUST_MODULE_PATH =
  require.resolve("@grame/faustwasm/libfaust-wasm/libfaust-wasm");

/**
 * represents a libfaust directory
 */
export class LibFaustPkg {
  private constructor(readonly dirPath: string) {}

  /**
   * @returns the main js module entry file for libfaust
   */
  jsFile() {
    return path.join(this.dirPath, path.basename(FAUST_MODULE_PATH));
  }

  /**
   * copies libfaust to a tmp dir, and returns a LibFaustPkg
   */
  static cpTmp() {
    const LIBFAUST_PATH = path.dirname(FAUST_MODULE_PATH);
    const tmpDir = asTmpDirSync(LIBFAUST_PATH);
    return new LibFaustPkg(tmpDir);
  }

  /**
   * cleans up the tmp dir
   */
  cleanup() {
    rmSync(this.dirPath, { recursive: true, force: true });
  }
}
