# Vendor shop — multi-vendor demo

A standalone, static one-page shop for vendors — the kind of link you
would pin in a Telegram-style channel. ONE deploy serves ALL vendors:
each is an entry in `vendors.js`, keyed by handle, and the URL picks
which one renders. Mobile-first, dark, minimal. Pure HTML/CSS/JS, no
build step, no dependencies beyond one vendored QR generator.

**This is a demo. Nothing on this page is real.**

## Open it

Double-click `index.html` in any modern browser. There is no server, no
build step, and no network activity: the vendor data is inlined in
`vendors.js`, and the page works from the `file://` origin.

## URL format

- `index.html` — no `?v=`, falls back to the first entry in `vendors.js`.
- `index.html?v=kushklub` — renders the vendor whose key in `vendors.js`
  is `kushklub` (what the vendor pins in their channel). The lookup is
  lowercased and trimmed, so `?v=KushKlub` and `?v= kushklub` work too.
- `index.html?v=someone-else` — a handle that is not in `vendors.js`
  shows a clean "No such vendor" state, never a blank page.

## Adding a vendor

1. Open `vendors.js`, copy the TEMPLATE block (or either example) and
   fill every field, keyed by the handle the vendor will put after
   `?v=`. Lowercase letters, digits and hyphens keep URLs clean. The
   first entry in the object is the default for no-`?v=` visitors —
   leave it in place.
2. Fill in `name` and `tagline` (plain text; everything is set with
   `textContent`, so no HTML), `verified` (shows the tick), an optional
   `badge` (a chip next to the name, e.g. "same day"), an optional
   `announcement` (a notice card under the header; empty hides it), an
   optional `stats` trust band and `about`/`policies` paragraphs (see
   "Trust band"), an optional `theme` (see below), `payment` — a BIP84
   `xpub`/`zpub` for
   real rotating addresses, or a demo `addresses` pool (see "Getting
   an xpub") — and `items` (`name`, `weight`, `price`, `btc`, optional
   `image`, optional `pinned`).
3. Hand the vendor their link: `<wherever this is hosted>/index.html?v=<handle>`.

### Theme

A vendor entry may carry a `theme` object; omitting it (or any field in
it) keeps the Cipher default:

- `background` — an image URL rendered behind a fixed dark scrim
  (`linear-gradient(rgba(9,9,11,.78), rgba(9,9,11,.92))`), so light text
  always reads no matter how bright the image is.
- `accent` — a hex colour (`#22c55e`, or the short `#2c5` form). An
  invalid or empty value falls back to the default blue; the page never
  breaks on a bad colour. Text on accent-filled controls is chosen from
  the accent's WCAG luminance (dark text on light accents, white on
  dark ones).
- `logo` — an image URL, always forced to a circle (`object-fit: cover`)
  so any aspect ratio works.

### Item images and the top shelf

An item may carry an `image` URL (rendered as a square thumb,
`referrerPolicy: no-referrer`). An item with no image gets a
deterministic two-colour gradient derived from a hash of its name, so
it never looks broken and always looks the same. One item may set
`pinned: true` — it renders as a larger "top shelf" card above the
list instead of a row.

**Vendor-supplied images are the only third-party requests this page
can make** — the only thing that learns a visitor's IP address besides
the shop's own host. Everything else (fonts, icons, QR, crypto) is
inlined or vendored. Choose image hosts accordingly.

Address rotation is tracked per vendor under `shop.<handle>.addrIndex`
in `localStorage`, so vendors on this one deploy never share a slot
counter.

## Getting an xpub

The page derives order addresses at `m/0/i` from a BIP84 account-level
extended public key. Paste it into `payment.xpub` in `vendors.js`;
leave it `''` to use the fallback address pool instead. Every wallet:
account → tap the three dots / account settings → "show xpub" /
"account information" → copy the string starting `zpub` (or `xpub`).

- **BlueWallet** — open the wallet → three-dot menu → "Show wallet
  xpub" → copy the `zpub`. (Enable "Export/Show xpub" in settings if
  the entry is hidden.)
- **Sparrow** — open the wallet → **Accounts** tab (first, "Unknown"
  account) → the "Extended Public Key" field → copy the `zpub`.
- **Electrum** — Wallet → Information → "Master Public Key" → copy the
  `xpub`. (Set the key type to p2wpkh / SegWit bech32 when creating the
  wallet, or the derivation will not match.)

## What it does

- **Menu screen** — vendor name with a verified tick (only when the
  vendor entry says `verified: true`), an optional status badge and
  announcement card, a trust band (see below), a pinned "top shelf"
  card when an item sets `pinned: true`, then the item list (thumb,
  name, weight, price), then the vendor's own about/policies paragraph.
  The tab title reads `<name> · Cipher`. Tapping an item opens the
  order sheet.
- **Order sheet** — shows the item and price, a scannable QR code, the
  Bitcoin address in monospace with a copy button, a "message the plug"
  button (copies a ready-made order message for the vendor's channel)
  and a status pill reading "waiting for payment". A back control
  returns to the menu.
- **Get screen** — reached from the footer's "powered by Cipher" line
  on every menu: the three-line pitch (no phone number, no account,
  your own menu) and either the download link or an honest "not out
  yet" note (see `GET_URL` under Assumptions). A back control returns
  to the menu.
- **Footer** — every screen carries "powered by Cipher".

### Trust band

An optional `stats` object renders a chip row under the header. The
display contract follows the txid-bulletin device on Cipher main
(`src/lib/vendorStats.js` at `e374cc9`): a proved count is the txids
themselves, published so anyone can check them; the BTC banner phrasing
is "N deals proven. One tap shows the txids." and is fixed there, not
reinvented here.

- `proven` (plain integer) + `source: 'bulletin'` — the count shows with
  the verbatim BTC banner phrasing, and `link` (an `https` URL buyers
  check the txids at) renders as the "One tap" sentence.
- `proven` with any other (or absent) `source` — the count still shows,
  but labelled `N deals · vendor-reported`, muted. A number without
  published txids never reads as proven.
- `since` (a string) adds an "around since" chip. All fields are
  optional; an empty or absent `stats` renders no band at all.

Both demo figures are fake demo data.

## What is fake

- **Addresses: real derivation, demo xpub.** When a vendor's
  `payment.xpub` is set, the order sheet derives a fresh address at
  `m/0/i` (native segwit, `bc1q`) with the vendored BIP32 code — slots
  0–19, tracked per vendor in `localStorage`, shown as
  `slot n / 20`. The kushklub example uses the BIP84 reference account,
  so its addresses are genuine derivations — but of a public test key,
  not anyone's wallet. Without an xpub (or if derivation fails for any
  reason) the page falls back to the hardcoded demo pool, cycling with
  a `(cycled)` marker, and never breaks. Nothing talks to the Bitcoin
  network either way.
- **The status pill does not watch the chain.** It always reads
  "waiting for payment"; there is no node, no Electrum server, no
  broadcast or confirmation logic of any kind.

## Files

- `index.html` — the four screens (menu, order sheet, get Cipher,
  vendor-not-found); inline SVG icons only. The brand name, badge,
  announcement, trust band, about section, tab title
  and menu are filled in by JS from the vendor entry, since one page
  serves many vendors.
- `style.css` — dark, mobile-first styles; fits a 390x844 phone with no
  horizontal scrolling.
- `vendors.js` — the vendor directory: every vendor keyed by handle,
  plus its demo address pool and menu. Add vendors here.
- `app.js` — `?v=` selection, address rotation with `localStorage`,
  QR building, copy button.
- `vendor/qrcode.js` — vendored [qrcode-generator 1.4.4] by Kazuhiko
  Arase, single file, MIT licensed. The QR codes encode a real
  `bitcoin:` URI (`bitcoin:<address>?amount=<btc>`) and scan with any
  wallet camera, though the addresses themselves are demo samples.
- `vendor/cipher-crypto.js` — a classic-script bundle generated from
  the vendored ESM trees in `vendor/` (`@scure/bip32`, `@scure/base`,
  `@noble/curves`, `@noble/hashes` — all MIT). The page cannot load
  ES modules from `file://` (browsers block them on that origin), so
  the bundle is what actually runs in the browser; the ESM sources are
  committed alongside it for provenance and for the node tests. It is
  rebuilt with `rolldown -c scripts/vendor-bundle.config.mjs` — a
  one-off tool, not a dependency of this repo.
- `derive.js` — xpub → bc1q address derivation (m/0/i, native segwit),
  exposed as `window.XpubAddresses`.
- `scripts/derivation.test.mjs` — node tests for the derivation. Run
  from the repo root: `node --test scripts/derivation.test.mjs`. The
  headline assertion is the BIP84 reference vector: the account
  `zpub6rFR…ZYs` at m/0/0 must produce
  `bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu`. Also covers plain
  xpubs, determinism, distinct indexes, address format, and that
  invalid keys, bad indexes and testnet keys return `null` (which
  sends the page down the fallback-pool path) rather than throwing.

[qrcode-generator 1.4.4]: https://www.npmjs.com/package/qrcode-generator

## Assumptions

- The design tokens are copied values from the Cipher app at main
  `0a322cb` (see the header comment in `style.css`). Two deliberate
  deviations: the background stays `#09090b` (the shop spec) rather
  than Cipher's `#000000`, and the accent is `#2563eb` (blue-600, what
  the app's primary buttons actually render per UI-INVENTORY).
- An invalid or unknown-shaped `theme` value is ignored field by field;
  there is no all-or-nothing validation, so a bad `accent` with a good
  `background` still themes the background.
- A vendor without a `theme` at all renders exactly like the default —
  the no-theme path is the most-seen version and is exercised by the
  first example vendor.
- Item thumbs and vendor logos are plain `<img>` requests with
  `referrerpolicy="no-referrer"`; nothing else about the request
  (caching, hotlink protection) is controlled by this page.
- "Message the plug" copies a plain-text order message to the
  clipboard; it does not open any chat app or send anything.
- "Gzipped payload under 40KB" (the raised budget) is measured over
  this repo's own files — `index.html`, `style.css`, `app.js`,
  `vendors.js`, `derive.js` (~13KB gzipped in total). The vendored
  third-party code in `vendor/` (QR + crypto bundle) is excluded, the
  same way vendor-supplied images are.
- The xpub path rotates 20 slots and then cycles them; it does not
  refuse to serve an order after 20, because a broken pay button is
  worse than a reused address in a demo.
- The trust band mirrors the txid-bulletin contract of Cipher main
  (`src/lib/vendorStats.js` at `e374cc9`). The static page has no
  relays and no fetch, so it cannot fetch a vendor's bulletin itself:
  the vendor entry's `stats.source` says whether a bulletin backs the
  number, and nothing checks that here — an owner who sets
  `'bulletin'` in `vendors.js` without a live bulletin owns that. The
  vendor-reported fallback label is the locked shape until this page
  grows a way to read bulletins. The "one tap" link is the whole
  self-check rail for now; when the txids are needed inline (a copied
  txid list, or a copy button), that is the next slice.
- `GET_URL` in `app.js` is the download link behind the get screen and
  is intentionally empty: the screen shows the pitch and an honest
  "not out yet" note instead of a dead button. Whoever deploys sets it
  to a real `https` URL; any other shape leaves the note up.
- The demo `stats`/`about`/`policies` values in `vendors.js` are fake
  demo data like everything else on the page; real vendor entries
  carry real (vendor-entered) text.
- Trust-band placement is under the header, before the announcement
  card, because a buyer decides from the header + band row first.
  Order elsewhere was not locked; moving it is one line in
  `index.html`.
