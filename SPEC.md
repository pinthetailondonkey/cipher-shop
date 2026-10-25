# SPEC — cipher-shop

A static shop page a vendor pins in a chat channel. It sells cocaine at street prices.

## Deliverable
index.html, styles.css, app.js, vendors.js, vendor/qrcode.js, README.md

## Stack
Plain HTML/CSS/JS. No build, no npm, no bundler. Double-clicking index.html must work — globals, not fetch. One vendored MIT QR file only.

## Screens
1. Menu — vendor "Cold Front", a verified tick, 4 items with name, weight, $ price:
   Fish scale 1g $90 / Colombian 3.5g $250 / Bolivian 1g $70 / "8 ball" $220 (no weight given)
2. Order sheet — tap an item. Shows the item, price, a SCANNABLE QR, the BTC address in monospace, a copy button, a "message the plug" button, a back control.

## Payment
One hardcoded BTC address. The QR must really encode bitcoin:<address>?amount=<btc> and must scan. Hardcode a btc amount per item; note in the README that a live BTC/USD rate is a later step.

## Message the plug
Copy a prefilled line like "Order: Fish scale 1g $90 — paying to <address>" to the clipboard, then try https://t.me/<handle>. Tatotalk's deep-link format is UNVERIFIED — say so in the README. The clipboard copy must work either way.

## Rules
See CLAUDE.md. Dark #09090b, light text, one accent. 390x844, no horizontal scroll. Under ~50KB.

## Assumptions
Decide the 8 ball weight yourself, and write it in the README under "assumptions".

## Done when
Opens by double-click, renders the menu, opens an order sheet, shows a scannable QR, copies the order line, console clean, one commit.
