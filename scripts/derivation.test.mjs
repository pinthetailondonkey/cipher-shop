/*
 * Derivation tests. Run from the repo root:
 *   node --test scripts/derivation.test.mjs
 *
 * The BIP84 vector asserts the whole chain: zpub decode, m/0/i
 * derivation, hash160, bech32 encode.
 *
 * Vector source: the BIP84 reference wallet
 *   account zpub: zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs
 *   m/0/0:        bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

// Load derive.js (a classic script that attaches XpubAddresses to its
// global) together with the vendored bundle, in this process's global.
globalThis.CipherCrypto = new Function(
  readFileSync(join(root, 'vendor', 'cipher-crypto.js'), 'utf8') + '\nreturn CipherCrypto;'
)();
globalThis.XpubAddresses = new Function(
  readFileSync(join(root, 'derive.js'), 'utf8') +
  '\nreturn (typeof window !== "undefined" ? window : globalThis).XpubAddresses;'
)();

const { deriveAddress } = globalThis.XpubAddresses;

const ZPUB = 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs';
const INDEX0 = 'bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu';

test('BIP84 vector: zpub m/0/0 is bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu', () => {
  assert.equal(deriveAddress(ZPUB, 0), INDEX0);
});

test('BIP84 vector also passes through an equivalent plain xpub', () => {
  // Same key, xpub version 0x0488b21e (from the same BIP84 account).
  const XPUB = 'xpub6CatWdiZiodmUeTDp8LT5or8nmbKNcuyvz7WyksVFkKB4RHwCD3XyuvPEbvqAQY3rAPshWcMLoP2fMFMKHPJ4ZeZXYVUhLv1VMrjPC7PW6V';
  assert.equal(deriveAddress(XPUB, 0), INDEX0);
});

test('deterministic: same input, same address', () => {
  assert.equal(deriveAddress(ZPUB, 7), deriveAddress(ZPUB, 7));
});

test('different indexes give different addresses', () => {
  assert.notEqual(deriveAddress(ZPUB, 0), deriveAddress(ZPUB, 1));
});

test('addresses are native segwit bc1q', () => {
  for (const i of [0, 1, 5, 19]) {
    const a = deriveAddress(ZPUB, i);
    assert.match(a, /^bc1q/);
    assert.equal(typeof a, 'string');
  }
});

test('invalid xpub returns null (fallback path)', () => {
  assert.equal(deriveAddress('not-a-key', 0), null);
  assert.equal(deriveAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 0), null);
});

test('empty or wrong-type xpub returns null', () => {
  assert.equal(deriveAddress('', 0), null);
  assert.equal(deriveAddress(undefined, 0), null);
  assert.equal(deriveAddress(null, 0), null);
});

test('bad index returns null', () => {
  assert.equal(deriveAddress(ZPUB, -1), null);
  assert.equal(deriveAddress(ZPUB, 1.5), null);
});

test('mainnet only: a testnet key is rejected', () => {
  // tpub version prefix, base58check-valid.
  assert.equal(deriveAddress('tpubD6NzVbkrYhZ4XgiXtGrdW5XDAPFCL9h7we1vwNCpn8tGbBcgdV6YBZ6XmBMRLs8YuJgzCpwU7bytd9YpqTAKTsdY1KnS6pW5g8Ki5RFUbgS', 0), null);
});
