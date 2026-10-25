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
  is `kushklub` (what the vendor pins in their channel).
- `index.html?v=someone-else` — a handle that is not in `vendors.js`
  shows a clean "No such vendor" state, never a blank page.

## Adding a vendor

1. Open `vendors.js` and add an entry to `VENDORS`, keyed by the handle
   the vendor will put after `?v=`. Lowercase letters, digits and
   hyphens keep URLs clean. The first entry in the object is also the
   default that no-`?v=` visitors get, so leave it in place.
2. Give each entry: `name`, `tagline` (plain text; it is set with
   `textContent`, so no HTML), `addresses` (demo address strings) and
   `items` (`id`, `name`, `weight`, `price`, `btc`).
3. Hand the vendor their link: `<wherever this is hosted>/index.html?v=<handle>`.

Address rotation is tracked per vendor under
`shop.<handle>.addrIndex` in `localStorage`, so vendors on this one
deploy never share a slot counter.

## What it does

- **Menu screen** — vendor name with a verified tick, and four items
  (name, weight, price). Tapping an item opens the order sheet.
- **Order sheet** — shows the item and price, a scannable QR code, the
  Bitcoin address in monospace with a copy button, and a status pill
  reading "waiting for payment". A back control returns to the menu.

## What is fake

- **The addresses are pre-derived.** Twelve demo address strings are
  hardcoded per vendor in `vendors.js` and handed out one per order
  — the next unused one is
  tracked in `localStorage`, so reloading the page does not reuse an
  address. The pool is demo sample data, 12 deep; once exhausted it
  cycles, and the sheet shows `slot n / 12` so you can see the rotation.
  When the pool runs dry it cycles, and the sheet shows `(cycled)`.
- **The status pill does not watch the chain.** It always reads
  "waiting for payment"; there is no node, no Electrum server, no
  broadcast or confirmation logic of any kind.
- **A later version will derive addresses from the vendor's xpub**
  (fresh address per order) instead of shipping a fixed pool.

## Files

- `index.html` — the three screens (menu, order sheet, vendor-not-found);
  inline SVG icons only. The brand name, tagline and tab title are filled
  in by JS from the vendor entry, since one page serves many vendors.
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
