# cipher-shop

A static shop page a vendor pins in a chat channel. Plain HTML/CSS/JS.

## Rules
- No build step, no npm, no bundler. Double-clicking index.html must work — use globals, not fetch.
- One change per commit. Push each.
- No emoji. Inline SVG only.
- Mobile first: 390x844, no horizontal scroll.
- Dark: #09090b background, light text, one accent.
- Keep the gzipped payload under 40KB (raised from 25KB for the xpub
  derivation work; raw bytes do not matter).
- No new dependencies except vendored files in vendor/ (the QR
  generator and the MIT crypto packages: @scure/bip32, @scure/base,
  @noble/curves, @noble/hashes).

## How to work
- Do not summarise the task back to me. Write files, then report.
- Do not ask permission. Decide, and put assumptions in README.md under "assumptions".
- Report at the end in five lines: files, commit SHA, whether you rendered it, what is unverified.
