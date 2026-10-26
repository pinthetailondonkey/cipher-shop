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
   optional `theme` (see below), the demo `addresses` under `payment`,
   and `items` (`name`, `weight`, `price`, `btc`, optional `image`,
   optional `pinned`).
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

Not used by the page yet (a later version will derive fresh addresses
from it), but this is where each wallet hides it. Every wallet: account
→ tap the three dots / account settings → "show xpub" / "account
information" → copy the string starting `zpub` (or `xpub`).

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
  announcement card, a pinned "top shelf" card when an item sets
  `pinned: true`, then the item list (thumb, name, weight, price).
  The tab title reads `<name> · Cipher`. Tapping an item opens the
  order sheet.
- **Order sheet** — shows the item and price, a scannable QR code, the
  Bitcoin address in monospace with a copy button, a "message the plug"
  button (copies a ready-made order message for the vendor's channel)
  and a status pill reading "waiting for payment". A back control
  returns to the menu.
- **Footer** — every screen carries "powered by Cipher".

## What is fake

- **The addresses are pre-derived.** Demo address strings are hardcoded
  per vendor in `vendors.js` and handed out one per order — the next
  unused one is tracked in `localStorage`, so reloading the page does
  not reuse an address. Once exhausted the pool cycles, and the sheet
  shows `slot n / 12` (or the pool's depth) so you can see the rotation.
- **The status pill does not watch the chain.** It always reads
  "waiting for payment"; there is no node, no Electrum server, no
  broadcast or confirmation logic of any kind.
- **A later version will derive addresses from the vendor's xpub**
  (fresh address per order) instead of shipping a fixed pool.

## Files

- `index.html` — the three screens (menu, order sheet, vendor-not-found);
  inline SVG icons only. The brand name, badge, announcement, tab title
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
