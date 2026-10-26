// One-off generator for vendor/cipher-crypto.js — the browser-loadable
// classic-script bundle of the vendored ESM packages in vendor/.
// The page never runs this; it is committed so the bundle can be rebuilt
// from the vendored sources. Run from the repo root:
//   rolldown -c scripts/vendor-bundle.config.mjs
// (rolldown is not a dependency of this repo; it is only used to rebuild
// the committed bundle, which is checked in and works without it.)
export default {
  input: 'scripts/vendor-bundle-entry.mjs',
  output: {
    file: 'vendor/cipher-crypto.js',
    format: 'iife',
    name: 'CipherCrypto',
    platform: 'browser',
  },
};
