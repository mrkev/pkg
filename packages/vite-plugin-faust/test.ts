#!/usr/bin/env bun

import {
  instantiateFaustModuleFromFile,
  LibFaust,
} from "@grame/faustwasm/dist/esm/index.js";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";
import { faustLoaderWasmImpl } from "./FaustLoader.js";
import { LibFaustPkg } from "./LibFaustPkg.js";

const dattorro = `
declare name "dattorro";
declare version "0.1";
declare author "Jakob Zerbian";
declare description "Dattorro demo application.";

import("stdfaust.lib");

process = dm.dattorro_rev_demo;
`;

// Minimal stereo generator: two detuned oscillators, left and right.
const stereoOsc = `
import("stdfaust.lib");
process = os.osc(440) * 0.5, os.osc(441) * 0.5;
`;

const TEST_DIR = resolve(`${__dirname}/test-tmp`);

main().catch(console.error);
async function main() {
  if (!existsSync(TEST_DIR)) {
    mkdirSync(TEST_DIR);
  }
  const pkg = LibFaustPkg.cpTmp();
  const faustModule = await instantiateFaustModuleFromFile(pkg.jsFile());
  const libFaust = new LibFaust(faustModule);

  const collected: Record<string, string> = {};
  const emit = (name: string, source: string | Uint8Array, contentType?: string) => {
    writeFileSync(resolve(TEST_DIR, name), source);
    if (name.endsWith(".json")) collected[name] = source as string;
    console.log("//// emitFile", name, typeof source === "string" ? source.length : source.byteLength, contentType);
    return "__VITE_ASSET__TEST";
  };

  await faustLoaderWasmImpl(libFaust, emit, "dattorro", dattorro);
  await faustLoaderWasmImpl(libFaust, emit, "stereoOsc", stereoOsc);

  // Verify channel counts from compiled metadata.
  function check(jsonName: string, expectedIn: number, expectedOut: number) {
    const meta = JSON.parse(collected[jsonName]);
    const ok = meta.inputs === expectedIn && meta.outputs === expectedOut;
    console.log(
      ok ? "PASS" : "FAIL",
      jsonName,
      `inputs=${meta.inputs} outputs=${meta.outputs}`,
      ok ? "" : `(expected inputs=${expectedIn} outputs=${expectedOut})`,
    );
    if (!ok) process.exit(1);
  }

  check("dattorro.json", 2, 2);
  check("stereoOsc.json", 0, 2);
}
