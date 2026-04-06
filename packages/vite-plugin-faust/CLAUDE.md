## Commands

```sh
# Build (outputs to dist/)
npm run build

# Watch mode
npm run dev

# Manual test — compiles a sample Faust DSP through the pipeline, writes .wasm/.json to test-tmp/
bun test.ts
```

Build uses `tsup` to bundle `vitePluginFaust.ts` with `.d.ts` generation, emitting both ESM (`dist/vitePluginFaust.js`) and CJS (`dist/vitePluginFaust.cjs`).

There is no automated test runner; `test.ts` is a manual script exercising the core compilation path.

## Architecture

This is a Vite plugin that intercepts `.dsp` file imports and compiles them with the Faust compiler (via `@grame/faustwasm`) into WebAssembly + JSON metadata, then returns a JS module that loads the compiled artifacts at runtime in the browser.

**Key classes and their roles:**

- **`vitePluginFaust.ts`** — Vite plugin entry point. Hooks into `configResolved`, `load`, `buildEnd`, and `configureServer`. Delegates all real work to `FaustLoader`.

- **`FaustLoader.ts`** — Core logic. Has two modes:
  - _Dev/watch mode_ (`context.meta.watchMode === true`): emits compiled assets as virtual files served via `/@faustloader/<filename>` through a custom Express-style middleware.
  - _Build mode_: emits assets through Rollup's `context.emitFile`, which gives back `__VITE_ASSET__<handle>__` placeholders that Vite resolves to content-hashed paths.

  The `faustLoaderWasmImpl` function (exported for testing) contains the actual Faust compilation: it creates a `FaustCompiler` + `FaustMonoDspGenerator`, compiles the DSP source, and calls `emitFile` for the `.wasm` binary and `.json` metadata.

  The `codeFor` function generates the JS module returned to the importer — it `fetch`es the wasm/json URLs at runtime and creates a `FaustMonoDSP` or `FaustPolyDSP` AudioWorkletNode.

- **`LibFaustPkg.ts`** — Manages the `libfaust-wasm` native files. Because `instantiateFaustModuleFromFile` needs to read sibling files from disk, `LibFaustPkg.cpTmp()` copies the entire `libfaust-wasm/` directory from `node_modules/@grame/faustwasm` into a temp directory. `cleanup()` removes it on `buildEnd`.

- **`client.d.ts`** — Ambient module declaration for `*.dsp` imports, re-exported as `vite-plugin-faust/client`. Users add `/// <reference types="vite-plugin-faust/client" />` to their type declaration file.

**Data flow for a `.dsp` import:**

1. Vite calls `load(id)` with the absolute path to the `.dsp` file.
2. `isDspFilename` gates on `.dsp` extension.
3. Faust DSP source is read, compiled to WASM+JSON via `faustLoaderWasmImpl`.
4. WASM and JSON are emitted as assets (virtual in dev, Rollup assets in build).
5. A JS module string is returned that `fetch`es the asset URLs at runtime and instantiates the AudioWorkletNode.
