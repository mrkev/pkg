import { cpSync } from "node:fs";
import os from "node:os";
import path from "path";

export function nullthrows<T>(val: T | null | undefined, message?: string): T {
  if (val == null) {
    throw new Error(message || `Expected ${val} to be non nil.`);
  }
  return val;
}

export function asTmpDirSync(originalPath: string) {
  const tempDir = path.join(os.tmpdir(), "faust-");
  cpSync(originalPath, tempDir, { recursive: true });
  return tempDir;
}

export const isDspFilename = (id: string) => /\.(dsp)$/.test(id);
