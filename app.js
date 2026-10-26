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
// ?v= is lowercased and trimmed, so ?v=KushKlub and ?v= kushklub work.
const RAW_HANDLE = new URLSearchParams(window.location.search).get('v') || '';
const REQUESTED_HANDLE = RAW_HANDLE.toLowerCase().trim();

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
// Theme — optional vendor customisation. A vendor with no theme keeps
// the Cipher default; that is the most-seen version.
// ---------------------------------------------------------------------

function clamp8(v) { return Math.max(0, Math.min(255, v)); }

// '#rgb'/'#rrggbb' -> [r,g,b], or null when it is not a valid hex colour.
function parseHex(hex) {
  if (typeof hex !== 'string') return null;
  const s = hex.trim();
  let m = /^#([0-9a-f]{6})$/i.exec(s);
  if (m) {
    const n = parseInt(m[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  m = /^#([0-9a-f]{3})$/i.exec(s);
  if (m) {
    return m[1].split('').map(function (c) { return parseInt(c + c, 16); });
  }
  return null;
}

// WCAG relative luminance -> pick white or near-black accent text.
function onColorFor(rgb) {
  const lum = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
  return lum > 150 ? '#09090b' : '#ffffff';
}

function applyTheme(v) {
  const rootStyle = document.documentElement.style;
  const theme = v && v.theme ? v.theme : {};
  const accentRgb = parseHex(theme.accent);

  if (accentRgb) {
    rootStyle.setProperty('--accent', 'rgb(' + accentRgb.join(',') + ')');
    rootStyle.setProperty('--on-accent', onColorFor(accentRgb));
    // soft fill + hover shade derived from the same accent
    rootStyle.setProperty('--accent-soft',
      'rgba(' + accentRgb.join(',') + ',0.12)');
    rootStyle.setProperty('--accent-hover',
      'rgb(' + accentRgb.map(function (c) { return clamp8(Math.round(c + (255 - c) * 0.25)); }).join(',') + ')');
  }

  const bg = theme.background;
  if (typeof bg === 'string' && bg) {
    rootStyle.setProperty('--bg-image', 'url("' + bg.replace(/"/g, '%22') + '")');
    document.body.classList.add('has-theme-bg');
  }

  const logo = theme.logo;
  if (typeof logo === 'string' && logo) {
    const img = document.createElement('img');
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    img.src = logo;
    const badge = $('brand-badge');
    badge.textContent = '';
    badge.appendChild(img);
  }
}

// ---------------------------------------------------------------------
// Address selection — xpub derivation with a fallback pool.
//
// With payment.xpub: derive at m/0/i (native segwit, bc1q) for index
// i in 0..19; the index advances per order, tracked in localStorage per
// vendor. Without an xpub (or an invalid one): hand out the hardcoded
// pool addresses in order, cycling. Nothing here talks to the network;
// with an xpub the addresses are real derivations, without one they are
// demo samples.
// ---------------------------------------------------------------------

const ADDR_KEY = 'shop.' + HANDLE + '.addrIndex';
const POOL_SIZE = 20; // xpub path: slots 0..19, shown as "slot n / 20"
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

// Derive at m/0/index from the vendor's xpub, or null when there is no
// xpub, the engine is missing, or the derivation fails. The bc1q check
// is belt and braces: a malformed result must never reach the sheet.
function xpubDerive(vendor, index) {
  const api = window.XpubAddresses;
  if (!api || typeof api.deriveAddress !== 'function') return null;
  const xpub = vendor && vendor.payment && vendor.payment.xpub;
  if (!xpub) return null;
  let addr = null;
  try { addr = api.deriveAddress(xpub, index); } catch (e) { addr = null; }
  return /^bc1q[0-9a-z]+$/i.test(String(addr)) ? addr : null;
}

function nextAddress(vendor) {
  const index = loadIndex();
  saveIndex(index + 1);
  const derived = xpubDerive(vendor, index % POOL_SIZE);
  if (derived) {
    return { address: derived, slot: (index % POOL_SIZE) + 1, total: POOL_SIZE, cycled: false };
  }
  const pool = (vendor && vendor.payment && vendor.payment.addresses) || [];
  if (!pool.length) {
    return { address: '', slot: 0, total: 0, cycled: false };
  }
  return {
    address: pool[index % pool.length],
    slot: index + 1,
    total: pool.length,
    cycled: index >= pool.length
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

// Deterministic pastel gradient from a hash of the item name: an item
// with no image never looks broken.
function itemGradient(name) {
  let h = 5381;
  for (let i = 0; i < name.length; i++) {
    h = ((h << 5) + h + name.charCodeAt(i)) | 0;
  }
  const hue = ((h >>> 0) % 360 + 360) % 360;
  const hue2 = (hue + 40 + ((h >>> 8) % 60)) % 360;
  return 'linear-gradient(135deg, '
    + 'hsl(' + hue + ', 38%, 26%), '
    + 'hsl(' + hue2 + ', 42%, 18%))';
}

function thumbHtml(item) {
  if (item.image) {
    return '<span class="item-thumb"><img src="' + item.image.replace(/"/g, '%22')
      + '" alt="" referrerpolicy="no-referrer" loading="lazy"></span>';
  }
  return '<span class="item-thumb" aria-hidden="true"></span>';
}

function itemButton(item, cls) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = cls;
  btn.innerHTML =
    thumbHtml(item)
    + '<span class="item-info">'
    + (cls === 'topshelf' ? '<span class="topshelf-tag">Top shelf</span>' : '')
    + '<p class="item-name"></p>'
    + '<p class="item-sub"></p>'
    + '</span>'
    + '<span class="price"></span>'
    + svgChevron();
  btn.querySelector('.item-name').textContent = item.name;
  btn.querySelector('.item-sub').textContent = item.weight;
  btn.querySelector('.price').textContent = item.price;
  if (!item.image) {
    btn.querySelector('.item-thumb').style.background = itemGradient(item.name);
  }
  btn.addEventListener('click', () => openOrder(item));
  return btn;
}

function buildMenu() {
  const list = $('item-list');
  const shelf = $('topshelf-holder');
  list.innerHTML = '';
  shelf.innerHTML = '';
  shelf.hidden = true;

  const pinned = VENDOR.items.find((item) => item.pinned);
  if (pinned) {
    shelf.hidden = false;
    shelf.appendChild(itemButton(pinned, 'topshelf'));
  }

  VENDOR.items.forEach((item) => {
    if (item === pinned) return;
    const li = document.createElement('li');
    li.appendChild(itemButton(item, 'item'));
    list.appendChild(li);
  });
}

let currentUri = '';

function openOrder(item) {
  const pick = nextAddress(VENDOR);
  currentUri = pick.address ? 'bitcoin:' + pick.address + '?amount=' + item.btc : '';

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
  if (currentUri) {
    const qr = qrcode(0, 'M'); // 0 = pick smallest fitting QR version
    qr.addData(currentUri, 'Byte');
    qr.make();
    holder.innerHTML = qr.createSvgTag({
      cellSize: 4,
      margin: 2,
      scalable: true,
      alt: 'Bitcoin payment QR code for this order'
    });
  }

  showScreen('order');
}

function showScreen(name) {
  $('screen-menu').hidden = name !== 'menu';
  $('screen-order').hidden = name !== 'order';
  $('screen-unknown').hidden = name !== 'unknown';
}

// Fill the header, badge, announcement and the tab title from the
// vendor entry, since one index.html serves several vendors.
function paintBrand() {
  document.title = VENDOR.name + ' · Cipher';
  $('brand-name').textContent = VENDOR.name;
  $('brand-sub').textContent = VENDOR.tagline;
  // The template shape nests the pool under payment.addresses.
  $('brand-verified').style.display = VENDOR.verified ? '' : 'none';

  const badge = $('vendor-badge');
  if (VENDOR.badge) {
    badge.hidden = false;
    badge.textContent = VENDOR.badge;
  } else {
    badge.hidden = true;
  }

  const ann = $('announcement');
  if (VENDOR.announcement) {
    ann.hidden = false;
    $('announcement-text').textContent = VENDOR.announcement;
  } else {
    ann.hidden = true;
  }
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
  const addr = $('order-addr').textContent;
  if (!addr) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(addr)
      .then(flashCopied)
      .catch(() => copyViaTextarea());
  } else {
    copyViaTextarea();
  }
}

function copyViaTextarea(text, onDone) {
  const ta = document.createElement('textarea');
  ta.value = text !== undefined ? text : $('order-addr').textContent;
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

let plugTimer = null;
function flashPlug() {
  clearTimeout(plugTimer);
  const btn = $('btn-msg-plug');
  btn.classList.add('copied');
  $('msg-plug-label').textContent = 'Copied — paste it in the chat';
  plugTimer = setTimeout(function () {
    btn.classList.remove('copied');
    $('msg-plug-label').textContent = 'Message the plug';
  }, 2200);
}

// "Message the plug": copy an order message for the vendor's channel.
function msgPlugClick() {
  const item = $('order-item-name').textContent;
  const price = $('order-item-price').textContent;
  const addr = $('order-addr').textContent;
  const msg = 'hi ' + (VENDOR.name || '') + ', just ordered the ' + item
    + ' (' + price + ') and paid to ' + addr;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(msg).then(flashPlug, function () { copyViaTextarea(msg, flashPlug); });
  } else {
    copyViaTextarea(msg, flashPlug);
  }
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
  applyTheme(VENDOR);
  buildMenu();
  $('btn-back').addEventListener('click', () => showScreen('menu'));
  $('btn-copy').addEventListener('click', copyAddress);
  $('btn-msg-plug').addEventListener('click', msgPlugClick);
  showScreen('menu');
});
