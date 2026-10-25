/*
 * Vendor shop — one-page order demo, rendered for the vendor picked by
 * ?v= in the URL (see vendors.js). No fetch, so double-clicking
 * index.html just works; no ?v= falls back to the first vendor.
 * This is a mock/demo: the addresses and BTC amounts are hardcoded samples
 * and nothing here talks to the Bitcoin network. See README.md.
 */

'use strict';

// ---------------------------------------------------------------------
// Vendor selection (data lives in vendors.js, loaded before this script)
// ---------------------------------------------------------------------

const VENDOR_LIST = window.VENDORS || {};
const DEFAULT_HANDLE = Object.keys(VENDOR_LIST)[0] || '';

// Handle comes from ?v=. Set and known -> that vendor; unset -> default.
// Set and unknown -> VENDOR stays null and the boot path shows the
// "no such vendor" state instead of a blank page.
const REQUESTED_HANDLE = new URLSearchParams(window.location.search).get('v') || '';

let VENDOR = null;
let HANDLE = '';
if (REQUESTED_HANDLE) {
  if (Object.prototype.hasOwnProperty.call(VENDOR_LIST, REQUESTED_HANDLE)) {
    VENDOR = VENDOR_LIST[REQUESTED_HANDLE];
    HANDLE = REQUESTED_HANDLE;
  }
} else {
  VENDOR = VENDOR_LIST[DEFAULT_HANDLE];
  HANDLE = DEFAULT_HANDLE;
}

// ---------------------------------------------------------------------
// Address rotation — the vendor's next unused address, tracked in
// localStorage (per vendor, so two vendors on one deploy do not share a
// counter) so a reload does not reuse one. Storage failure (private
// mode, blocked site data) falls back to an in-memory counter.
// ---------------------------------------------------------------------

const ADDR_KEY = 'shop.' + HANDLE + '.addrIndex';
const ADDRESSES = VENDOR ? VENDOR.addresses : [];
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
  $('screen-unknown').hidden = name !== 'unknown';
}

// Fill the header (name, verified tick, tagline) and the tab title from
// the vendor entry, since one index.html now serves several vendors.
function paintBrand() {
  document.title = VENDOR.name;
  $('brand-name').textContent = VENDOR.name;
  $('brand-sub').textContent = VENDOR.tagline;
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
  if (!VENDOR) {
    // ?v= named a handle that is not in vendors.js.
    document.title = 'Vendor not found';
    showScreen('unknown');
    return;
  }
  paintBrand();
  buildMenu();
  $('btn-back').addEventListener('click', () => showScreen('menu'));
  $('btn-copy').addEventListener('click', copyAddress);
  showScreen('menu');
});
