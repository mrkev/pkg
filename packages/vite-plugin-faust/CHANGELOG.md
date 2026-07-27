# vite-plugin-faust

## 2.2.0

### Minor Changes

- Widen the `@grame/faustwasm` peer range to `>=0.15.7 <0.17` so apps on 0.16.x are supported. Previously the `^0.15.7` range excluded 0.16.x, and because `client.d.ts` types the `.dsp` loader's `faustNode` as `IFaustMonoWebAudioNode` from `@grame/faustwasm`, consumers on 0.16.x hit a type mismatch (0.16 added `init`, `instanceInit`, `instanceClear`, `instanceConstants`, and `instanceResetUserInterface` to that interface). The plugin now also develops against 0.16.6. No runtime behavior changed.

## 2.1.0

### Minor Changes

- fix vite-plugin-faust so it builds .dsp files correctly again

## 2.0.0

### Major Changes

- c55ef9a: Update @grame/faustwasm version and make it a peer dependency
