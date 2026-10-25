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
    theme: {                          // optional customisation; omit for the Cipher default
      background: '',                 // image URL behind a dark scrim; '' keeps the plain bg
      accent: '',                     // hex like '#22c55e'; invalid/empty falls back to default
      logo: ''                        // image URL, always rendered as a circle; '' keeps the icon
    },
    addresses: [                      // demo address pool, handed out one per order
      'bc1q...'                       //   in order; cycles when exhausted
    ],
    items: [                          // menu, top to bottom
      {
        name: '',                     // item name
        weight: '',                   // subtitle under the name
        price: '$',                   // display price
        btc: '0.0'                    // BTC amount for the payment URI
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
    theme: {
      background: '',
      accent: '',
      logo: ''
    },
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
    ],
    items: [
      { name: 'Lemon haze',   weight: '3.5g',    price: '$60',  btc: '0.00063' },
      { name: 'Gelato 41',    weight: '7g',      price: '$110', btc: '0.00115' },
      { name: 'Hash',         weight: '1g',      price: '$25',  btc: '0.00026' },
      { name: 'Sour gummies', weight: '10x10mg', price: '$40',  btc: '0.00042' }
    ]
  },

  northside: {
    name: 'Northside',
    tagline: 'deliveries 4pm - midnight',
    verified: false,
    theme: {
      background: '',
      accent: '#e11d48',
      logo: ''
    },
    addresses: [
      'bc1qwhrr0d0zwnf9pr2vwz4l7afws8kzfcmlak005p',
      'bc1qh9zkxq93j5zecy8av2dhyu436jhgyr3uzkcqvc',
      'bc1q284tar9q8kn6tkfcezqdjrk38nhkd8dwqj0ne2'
    ],
    items: [
      { name: 'Pre-roll', weight: '1g',   price: '$15', btc: '0.00016' },
      { name: 'Hash rosin', weight: '0.5g', price: '$45', btc: '0.00047' }
    ]
  }

};

// Re-attach for the next script: a top-level `const` lives in the global
// lexical environment only and is not reachable as window.VENDORS, and
// app.js reads it defensively rather than assuming load order.
window.VENDORS = VENDORS;
