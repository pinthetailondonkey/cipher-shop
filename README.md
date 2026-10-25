# Kush Klub — vendor page demo

A standalone, static, one-page shop for a single vendor — the kind of link
you would pin in a Telegram-style channel. Mobile-first, dark, minimal.
Pure HTML/CSS/JS, no build step, no dependencies beyond one vendored QR
generator.

**This is a demo. Nothing on this page is real.**

## Open it

Double-click `index.html` in any modern browser. There is no server, no
build step, and no network activity: the vendor data is inlined in
`app.js`, and the page works from the `file://` origin.

## What it does

- **Menu screen** — vendor name with a verified tick, and four items
  (name, weight, price). Tapping an item opens the order sheet.
- **Order sheet** — shows the item and price, a scannable QR code, the
  Bitcoin address in monospace with a copy button, and a status pill
  reading "waiting for payment". A back control returns to the menu.

## What is fake

- **The addresses are pre-derived.** Twelve address strings are hardcoded
  in `app.js` and handed out one per order — the next unused one is
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

- `index.html` — the two screens, inline SVG icons only.
- `style.css` — dark, mobile-first styles; fits a 390x844 phone with no
  horizontal scrolling.
- `app.js` — inlined vendor data, address rotation with `localStorage`,
  QR building, copy button.
- `vendor/qrcode.js` — vendored [qrcode-generator 1.4.4] by Kazuhiko
  Arase, single file, MIT licensed. The QR codes encode a real
  `bitcoin:` URI (`bitcoin:<address>?amount=<btc>`) and scan with any
  wallet camera, though the addresses themselves are demo samples.

[qrcode-generator 1.4.4]: https://www.npmjs.com/package/qrcode-generator
