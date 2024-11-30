# vite-plugin-faust

Vite plugin to transform Faust DSP files into React importable JavaScript (+ wasm) modules. Uses [faustwasm](https://github.com/grame-cncm/faustwasm) under the hood.

## Installation

```sh
# npm
npm install --save-dev vite-plugin-faust

# yarn
yarn add -D vite-plugin-faust

# pnpm
pnpm add -D vite-plugin-faust
```

## Usage

```js
// vite.config.js
import faust from "vite-plugin-svgr";

export default {
  // ...
  plugins: [faust()],
};
```

Then DSP files can be imported as modules:

```js
import createReverb from "./Reverb.dsp";

// ...
const reverb = await createReverb(liveAudioContext());
reverb.faustNode; // is an AudioWorkletNode
reverb.dspMeta; // contains a bunch of meta information about this node
```

If you are using TypeScript, there is also a declaration helper for better type inference. Add the following to `vite-env.d.ts` (or `env.d.ts`, or whatever declaration file you chose to use):

```ts
/// <reference types="vite-plugin-faust/client" />
```

## Options

None at the moment!

## License

MIT
