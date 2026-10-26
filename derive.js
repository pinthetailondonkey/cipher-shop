/*
 * xpub -> address derivation for the order sheet. Runs on the vendored
 * @scure/bip32 + @scure/base + @noble/hashes ESM sources in vendor/ and
 * also in the browser via the generated classic-script bundle
 * vendor/cipher-crypto.js (window.CipherCrypto exposes the same names).
 *
 * A zpub (BIP84 account xpub, version 0x04b24746) or a standard xpub is
 * accepted; the key is normalised to an xpub before HDKey parses it.
 * Address path is m/0/<i> per the spec, native segwit v0, bech32 only.
 */
'use strict';

(function (root) {
  function make(lib) {
    const HDKey = lib.HDKey;
    const base58check = lib.base58check;
    const bech32 = lib.bech32;
    const sha256 = lib.sha256;
    const ripemd160 = lib.ripemd160;

    const XPUB_VERSION = new Uint8Array([0x04, 0x88, 0xb2, 0x1e]);
    const MAINNET_ZPUB = 0x04b24746;

    function readU32(b, o) {
      return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
    }

    // Accept an xpub or a mainnet zpub; return the HDKey or null.
    function fromExtendedKeyString(keyStr) {
      let b58c;
      try { b58c = base58check(sha256); } catch (e) { return null; }
      let raw;
      try { raw = b58c.decode(keyStr); } catch (e) { return null; }
      if (!raw || raw.length !== 78) return null;
      const version = readU32(raw, 0);
      if (version === 0x0488b21e) {
        // already an xpub; hand the original string straight to HDKey
        try { return HDKey.fromExtendedKey(keyStr); } catch (e) { return null; }
      }
      if (version === MAINNET_ZPUB) {
        // re-encode with the xpub version so HDKey accepts it
        const out = new Uint8Array(78);
        out.set(XPUB_VERSION);
        out.set(raw.subarray(4), 4);
        let reencoded;
        try { reencoded = b58c.encode(out); } catch (e) { return null; }
        try { return HDKey.fromExtendedKey(reencoded); } catch (e) { return null; }
      }
      return null;
    }

    function hash160(bytes) {
      return ripemd160(sha256(bytes));
    }

    function p2wpkhAddress(pubKeyBytes) {
      const h = hash160(pubKeyBytes);
      const words = bech32.toWords(h);
      words.unshift(0); // witness version 0
      return bech32.encode('bc', words);
    }

    // Derive the address at m/0/i from an account-level extended key.
    // Returns null when the key is missing or invalid.
    function deriveAddress(xpub, index) {
      if (typeof xpub !== 'string' || !xpub.length) return null;
      if (!Number.isInteger(index) || index < 0) return null;
      const hd = fromExtendedKeyString(xpub);
      if (!hd) return null;
      let child;
      try { child = hd.derive('m/0/' + index); } catch (e) { return null; }
      if (!child || !child.publicKey) return null;
      try { return p2wpkhAddress(child.publicKey); } catch (e) { return null; }
    }

    return { deriveAddress, fromExtendedKeyString, p2wpkhAddress };
  }

  const api = make({
    HDKey: root.CipherCrypto && root.CipherCrypto.HDKey,
    base58check: root.CipherCrypto && root.CipherCrypto.base58check,
    bech32: root.CipherCrypto && root.CipherCrypto.bech32,
    sha256: root.CipherCrypto && root.CipherCrypto.sha256,
    ripemd160: root.CipherCrypto && root.CipherCrypto.ripemd160
  });

  root.XpubAddresses = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
