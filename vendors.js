/*
 * Vendor directory. One deploy serves many vendors; each entry is keyed
 * by the handle used in the URL, e.g. index.html?v=kushklub. The lookup
 * is lowercased and trimmed, so ?v=KushKlub and ?v= kushklub both work.
 * The first entry is the default when the URL carries no ?v=.
 * All strings are inlined demo data; nothing here is real. See README.md.
 */

'use strict';

/* ------------------------------------------------------------------ */
/*  TEMPLATE — copy one of the examples below and fill every field.    */
/* ------------------------------------------------------------------ */
/*
  '<handle>': {                       // URL key: lowercase letters, digits, hyphens
    name: '',                         // display name, shown in the header
    tagline: '',                      // one line under the name (plain text)
    verified: false,                  // true shows the verified tick
    badge: '',                        // optional chip next to the name, e.g. 'same day'
    announcement: '',                 // optional notice card under the header; '' hides it
    stats: {                          // optional trust band under the header
      proven: 0,                      // deals proven, plain integer; 0 docs the band
      source: '',                     // 'bulletin' reads "N deals proven on-chain";
                                      //   anything else labels the count "vendor-reported"
      since: '',                      // optional "around since" chip, e.g. '2023'
      link: ''                        // bulletin only: https URL buyers check the txids at
    },
    about: '',                        // optional paragraph under the menu; '' hides it
    policies: '',                     // optional second paragraph (payment/postage rules)
    theme: {                          // optional customisation; omit for the Cipher default
      background: '',                 // image URL behind a dark scrim; '' keeps the plain bg
      accent: '',                     // hex like '#22c55e'; invalid/empty falls back to default
      logo: ''                        // image URL, always rendered as a circle; '' keeps the icon
    },
    payment: {
      xpub: '',                       // BIP84 account zpub or xpub; '' uses the address list
      addresses: [                    // demo fallback pool when there is no xpub
        'bc1q...'                     //   handed out one per order, in order
      ]
    },
    items: [                          // menu, top to bottom
      {
        name: '',                     // item name
        weight: '',                   // subtitle under the name
        price: '$',                   // display price
        btc: '0.0',                   // BTC amount for the payment URI
        image: '',                    // optional image URL; '' renders a deterministic gradient
        pinned: false                 // true renders this item as the "top shelf" card
      }
    ]
  },
*/
/* ------------------------------------------------------------------ */

const VENDORS = {

  kushklub: {
    name: 'Kush Klub',
    tagline: 'btc only · dm to order',
    verified: true,
    badge: '',
    announcement: 'Orders before 8pm go out same night. No minimum.',
    // Demo trust band: vendor-reported (no bulletin yet), obviously fake.
    stats: {
      proven: 47,
      source: '',
      since: '2023',
      link: ''
    },
    about: 'Demo entry. This paragraph is where the vendor writes who they '
      + 'are and how long they have been around. Nothing here is real.',
    policies: 'Payment in bitcoin only. Same-night drop before 8pm. Any '
      + 'problems, message directly and it gets made right.',
    theme: {
      background: '',
      accent: '',
      logo: ''
    },
    payment: {
      // BIP84 reference account. Real derivations at m/0/i, bc1q, 20
      // rotating slots; the pool below is the demo fallback only.
      xpub: 'zpub6rFR7y4Q2AijBEqTUquhVz398htDFrtymD9xYYfG1m4wAcvPhXNfE3EfH1r1ADqtfSdVCToUG868RvUUkgDKf31mGDtKsAYz2oz2AGutZYs',
      addresses: [
      'bc1qwhrr0d0zwnf9pr2vwz4l7afws8kzfcmlak005p',
      'bc1qh9zkxq93j5zecy8av2dhyu436jhgyr3uzkcqvc',
      'bc1q284tar9q8kn6tkfcezqdjrk38nhkd8dwqj0ne2',
      'bc1qeumpuh3sufdat7tg03xw3kjgrwcukn86h545ua',
      'bc1q3vzwrzhpzp8z70jmhr72kkpdu07et7kp09f028',
      'bc1qdz0u95tf7ukvsvnr53za60cym0q4twv2z6rxvu',
      'bc1qx5wz2729g3uqx0lg3e9h034aas40ssk8ke9myf',
      'bc1qeyur2gq4amvte8g2egs9ras26kw4zqszsk4fqn',
      'bc1qk8klljsjrsacqwu4kntd4vsawf2lpl6rufrt79',
      'bc1qyjef8hvm664nenarrvm49y8j80ejzpas54vs8n',
      'bc1q0gzrvlwpzhydks79eurg8fampssch0ur9kyk70',
      'bc1q6pc5g7zk8uz085mh0dwfkpm9lnj4g8q5eju5kn'
    ]
    },
    items: [
      { name: 'Lemon haze',   weight: '3.5g',    price: '$60',  btc: '0.00063', image: '', pinned: false },
      { name: 'Gelato 41',    weight: '7g',      price: '$110', btc: '0.00115', image: '', pinned: true  },
      { name: 'Hash',         weight: '1g',      price: '$25',  btc: '0.00026', image: '', pinned: false },
      { name: 'Sour gummies', weight: '10x10mg', price: '$40',  btc: '0.00042', image: '', pinned: false }
    ]
  },

  northside: {
    name: 'Northside',
    tagline: 'deliveries 4pm - midnight',
    verified: false,
    badge: 'same day',
    announcement: '',
    theme: {
      background: '',
      accent: '#e11d48',
      logo: ''
    },
    payment: {
      xpub: '',                       // no xpub: the fallback pool is used
      addresses: [
      'bc1qwhrr0d0zwnf9pr2vwz4l7afws8kzfcmlak005p',
      'bc1qh9zkxq93j5zecy8av2dhyu436jhgyr3uzkcqvc',
      'bc1q284tar9q8kn6tkfcezqdjrk38nhkd8dwqj0ne2'
    ]
    },
    items: [
      { name: 'Pre-roll', weight: '1g',   price: '$15', btc: '0.00016', image: '', pinned: false },
      { name: 'Hash rosin', weight: '0.5g', price: '$45', btc: '0.00047', image: '', pinned: false }
    ]
  }

};

// Re-attach for the next script: a top-level `const` lives in the global
// lexical environment only and is not reachable as window.VENDORS, and
// app.js reads it defensively rather than assuming load order.
window.VENDORS = VENDORS;
