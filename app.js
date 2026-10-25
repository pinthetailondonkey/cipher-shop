/*
 * Kush Klub — one-page vendor shop demo.
 * All data is inlined (no fetch) so double-clicking index.html just works.
 * This is a mock/demo: the addresses and BTC amounts are hardcoded samples
 * and nothing here talks to the Bitcoin network. See README.md.
 */

'use strict';

// ---------------------------------------------------------------------
// Vendor data (inlined mock data)
// ---------------------------------------------------------------------

const VENDOR = {
  name: 'Kush Klub',
  items: [
    { id: 'lemon-haze', name: 'Lemon haze',   weight: '3.5g',    price: '$60',  btc: '0.00063' },
    { id: 'gelato-41',  name: 'Gelato 41',    weight: '7g',      price: '$110', btc: '0.00115' },
    { id: 'hash-1g',    name: 'Hash',         weight: '1g',      price: '$25',  btc: '0.00026' },
    { id: 'gummies',    name: 'Sour gummies', weight: '10x10mg', price: '$40',  btc: '0.00042' }
  ]
};

// 12 pre-derived mock addresses. A later version will derive these from
// the vendor's xpub; for the demo they are hardcoded sample strings and
// each of the first 12 orders gets a different one (after that it cycles).
const ADDRESSES = [
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
];

// ---------------------------------------------------------------------
// Address rotation — the next unused address, tracked in localStorage so a
// reload does not reuse one. Storage failure (private mode, blocked site
// data) falls back to an in-memory counter.
// ---------------------------------------------------------------------

const ADDR_KEY = 'kushklub.addrIndex';
let memIndex = 0;

function loadIndex() {
  try {
    const v = window.localStorage.getItem(ADDR_KEY);
    const n = v === null ? 0 : parseInt(v, 10);
    return Number.isInteger(n) && n >= 0 ? n : 0;
  } catch (e) {
    return memIndex;
  }
}

function saveIndex(n) {
  memIndex = n;
  try {
    window.localStorage.setItem(ADDR_KEY, String(n));
  } catch (e) { /* fall back to the in-memory counter */ }
}

function nextAddress() {
  const index = loadIndex();
  const addr = ADDRESSES[index % ADDRESSES.length];
  saveIndex(index + 1);
  return {
    address: addr,
    slot: index + 1,
    total: ADDRESSES.length,
    cycled: index >= ADDRESSES.length
  };
}

// ---------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------

const $ = (id) => document.getElementById(id);

function svgChevron() {
  return '<svg class="chev" viewBox="0 0 24 24" width="18" height="18" fill="none" '
    + 'stroke="currentColor" stroke-width="2" stroke-linecap="round" '
    + 'stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
}

function buildMenu() {
  const list = $('item-list');
  list.innerHTML = '';
  VENDOR.items.forEach((item) => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'item';
    btn.innerHTML =
      '<span class="item-info">'
      + '<p class="item-name"></p>'
      + '<p class="item-sub"></p>'
      + '</span>'
      + '<span class="price"></span>'
      + svgChevron();
    btn.querySelector('.item-name').textContent = item.name;
    btn.querySelector('.item-sub').textContent = item.weight;
    btn.querySelector('.price').textContent = item.price;
    btn.addEventListener('click', () => openOrder(item));
    li.appendChild(btn);
    list.appendChild(li);
  });
}

let currentUri = '';

function openOrder(item) {
  const pick = nextAddress();
  currentUri = 'bitcoin:' + pick.address + '?amount=' + item.btc;

  $('order-item-name').textContent = item.name;
  $('order-item-weight').textContent = item.weight;
  $('order-item-price').textContent = item.price;
  $('order-addr').textContent = pick.address;
  $('order-slot').textContent = pick.cycled
    ? 'slot ' + pick.slot + ' (cycled)'
    : 'slot ' + pick.slot + ' / ' + pick.total;
  resetCopyButton();

  const holder = $('qr-holder');
  holder.innerHTML = '';
  const qr = qrcode(0, 'M'); // 0 = pick smallest fitting QR version
  qr.addData(currentUri, 'Byte');
  qr.make();
  holder.innerHTML = qr.createSvgTag({
    cellSize: 4,
    margin: 2,
    scalable: true,
    alt: 'Bitcoin payment QR code for this order'
  });

  showScreen('order');
}

function showScreen(name) {
  $('screen-menu').hidden = name !== 'menu';
  $('screen-order').hidden = name !== 'order';
}

// ---------------------------------------------------------------------
// Copy button (clipboard API with a textarea fallback for file://)
// ---------------------------------------------------------------------

let copyTimer = null;

function resetCopyButton() {
  clearTimeout(copyTimer);
  const btn = $('btn-copy');
  btn.classList.remove('copied');
  $('copy-label').textContent = 'Copy address';
}

function flashCopied() {
  const btn = $('btn-copy');
  btn.classList.add('copied');
  $('copy-label').textContent = 'Copied';
  copyTimer = setTimeout(resetCopyButton, 1600);
}

function copyAddress() {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText($('order-addr').textContent)
      .then(flashCopied)
      .catch(() => copyViaTextarea());
  } else {
    copyViaTextarea();
  }
}

function copyViaTextarea() {
  const ta = document.createElement('textarea');
  ta.value = $('order-addr').textContent;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    flashCopied();
  } catch (e) {
    // Nothing else to try; leave the button alone so the user can select manually.
  }
  document.body.removeChild(ta);
}

// ---------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  buildMenu();
  $('btn-back').addEventListener('click', () => showScreen('menu'));
  $('btn-copy').addEventListener('click', copyAddress);
  showScreen('menu');
});
