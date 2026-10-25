# SPEC — cipher-shop

A static shop page a vendor pins in a chat channel. It sells weed and coke at street prices.

## Deliverable
index.html, style.css, app.js, README.md, vendor/qrcode.js

## Stack
Plain HTML/CSS/JS. No build, no npm, no bundler. Double-clicking index.html must work — globals, not fetch. One vendored MIT QR file only.

## Screens
1. Menu — vendor "Kush Klub", a verified tick, items with name, weight, $ price.
2. Order sheet — tap an item. Item, price, a SCANNABLE QR, the BTC address in monospace, a copy button, a "message the plug" button, a back control.

## Payment
12 hardcoded BTC addresses, rotated per order, tracked in localStorage. The sheet shows the slot so the rotation is visible. The QR must encode bitcoin:<address>?amount=<btc> and must scan. Hardcoded btc amount per item; a live BTC/USD rate is a later step.

## Message the plug
Copy a prefilled order line to the clipboard, then try https://t.me/<handle>. Tatotalk's deep-link format is UNVERIFIED — say so in the README. The clipboard copy must work either way.

## Rules
See CLAUDE.md. Dark #09090b, light text, one accent. 390x844, no horizontal scroll.

## Later
- Derive addresses from the vendor's xpub instead of the hardcoded list.
- Live BTC/USD rate for the QR amount.
