import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as metrics from '../metrics.mjs';

const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const source = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8').replace(/^import[^\n]+\n/gm, '');
const decode = value => value.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&lt;', '<').replaceAll('&gt;', '>');

class Element {
    constructor(tag, attrs, document) {
        this.tagName = tag;
        this.attributes = { ...attrs };
        this.dataset = {};
        this.document = document;
        this.events = {};
        this.hidden = false;
        this.textContent = '';
        this.style = { top: '', scrollBehavior: '' };
        for (const [key, value] of Object.entries(attrs)) {
            if (key.startsWith('data-')) this.dataset[key.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = decode(value);
        }
        const classes = new Set((attrs.class || '').split(' '));
        this.classList = { add: value => classes.add(value), remove: value => classes.delete(value), contains: value => classes.has(value) };
        this.hash = attrs.href?.startsWith('#') ? attrs.href : '';
    }
    getAttribute(key) { return this.attributes[key] ?? null; }
    setAttribute(key, value) { this.attributes[key] = value; }
    removeAttribute(key) { delete this.attributes[key]; }
    addEventListener(name, listener) { this.events[name] = listener; }
    focus() { this.document.activeElement = this; }
    querySelectorAll(selector) { return this.document.querySelectorAll(selector).filter(node => node.container === this); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    contains(node) { return node?.container === this; }
}

function matches(node, selector) {
    const tag = selector.match(/^[a-z]+/);
    if (tag && node.tagName !== tag[0]) return false;
    if (selector.startsWith('.')) return node.classList.contains(selector.slice(1));
    if (selector.startsWith('#')) return node.attributes.id === selector.slice(1);
    const attrs = [...selector.matchAll(/\[([\w-]+)(?:(\^?=)"([^"]*)")?\]/g)];
    return attrs.every(([, key, operator, value]) => Object.hasOwn(node.attributes, key)
        && (!operator || (operator === '^=' ? node.attributes[key].startsWith(value) : node.attributes[key] === value)));
}

function fixture({ lang = '', blockedStorage = false, mobile = true, scrollY = 0 } = {}) {
    const document = {
        activeElement: null, events: {}, nodes: [],
        querySelectorAll(selector) { return this.nodes.filter(node => matches(node, selector)); },
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
        getElementById(id) { return this.querySelector('#' + id); },
        addEventListener(name, listener) { this.events[name] = listener; },
    };
    for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*)>/g)) {
        const attrs = Object.fromEntries([...match[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(value => [value[1], value[2]]));
        for (const bare of match[2].matchAll(/\s(data-[\w-]+|hidden)(?=\s|$)/g)) attrs[bare[1]] = '';
        document.nodes.push(new Element(match[1], attrs, document));
    }
    document.documentElement = document.querySelector('html');
    document.body = document.querySelector('body');
    document.getElementById('person-data').textContent = html.match(/id="person-data">([\s\S]*?)<\/script>/)[1];
    const navigation = document.getElementById('nav-links');
    const navIds = ['inicio', 'cloudstudy', 'projetos', 'opensource', 'trajetoria', 'credenciais', 'contato'];
    for (const node of document.nodes) {
        if (node.tagName === 'a' && node.dataset.pt && navIds.includes(node.hash.slice(1))) node.container = navigation;
    }
    const media = { matches: mobile, addEventListener(name, listener) { this.change = listener; } };
    const memory = new Map();
    const window = { scrollY, scrollTo(x, y) { this.scrollY = y; }, location: { search: lang }, matchMedia: () => media, localStorage: {
        getItem(key) { if (blockedStorage) throw new Error('SecurityError'); return memory.get(key) ?? null; },
        setItem(key, value) { if (blockedStorage) throw new Error('QuotaExceeded'); memory.set(key, value); },
    } };
    let requests = 0;
    vm.runInNewContext(source, { ...metrics, document, window, URLSearchParams, Date,
        initializeMotion() {}, settleCounters() {},
        fetchMetrics: async () => { requests++; throw new Error('offline'); } });
    return { document, media, window, requests: () => requests };
}

test('initialization survives blocked storage and never fetches metrics on load', () => {
    const app = fixture({ blockedStorage: true });
    assert.equal(app.document.documentElement.lang, 'pt-BR');
    assert.equal(app.document.getElementById('nav-links').hidden, true);
    assert.equal(app.requests(), 0);
    assert.equal(app.document.querySelector('[data-metric="total-stars"]').textContent, '2.205');
    assert.match(app.document.getElementById('metrics-status').textContent, /^GitHub · 03\/11\/2026$/);
});

test('English query translates every text, portrait alternative, and menu labels', () => {
    const { document } = fixture({ lang: '?lang=en' });
    for (const node of document.querySelectorAll('[data-pt][data-en]')) {
        if (!Object.hasOwn(node.attributes, 'data-fraud-reference')) assert.equal(node.textContent, node.dataset.en);
    }
    assert.match(document.querySelector('[data-fraud-reference]').textContent, /^GitHub · 11\/3\/2026$/);
    assert.equal(document.documentElement.lang, 'en');
    assert.equal(document.querySelector('[data-alt-pt]').alt, 'Professional portrait of Thiago Cardoso');
    assert.equal(document.querySelector('.menu-toggle').getAttribute('aria-label'), 'Open menu');
    assert.match(document.title, /AWS infrastructure/);
});

test('mobile menu moves focus, wraps Tab, closes on Escape, and resets at desktop', () => {
    const { document, media } = fixture();
    const button = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('nav-links');
    button.events.click();
    assert.equal(navigation.hidden, false);
    assert.equal(navigation.inert, false);
    assert.equal(document.activeElement, navigation.querySelector('a'));
    const language = document.querySelector('.lang-toggle');
    language.focus();
    let prevented = false;
    document.events.keydown({ key: 'Tab', shiftKey: false, preventDefault() { prevented = true; } });
    assert.equal(prevented, true);
    assert.equal(document.activeElement, document.querySelector('.brand'));
    document.events.keydown({ key: 'Escape', preventDefault() {} });
    assert.equal(navigation.hidden, true);
    assert.equal(document.activeElement, button);
    button.events.click();
    media.matches = false;
    media.change();
    assert.equal(navigation.hidden, false);
    assert.equal(navigation.inert, false);
    assert.equal(document.body.classList.contains('menu-open'), false);
    assert.equal(button.hidden, true);
});

test('offline manual refresh retains fallback counts and announces failure', async () => {
    const app = fixture();
    await app.document.getElementById('refresh-metrics').events.click();
    assert.equal(app.requests(), 1);
    assert.equal(app.document.querySelector('[data-metric="total-stars"]').textContent, '2.205');
    assert.match(app.document.getElementById('metrics-status').textContent, /Não foi possível atualizar agora/);
    assert.doesNotMatch(app.document.getElementById('metrics-status').textContent, /snapshot|cache|fallback|API/i);
    assert.equal(app.document.getElementById('refresh-metrics').disabled, false);
});

test('English refresh feedback is concise and retains the metric reference date', async () => {
    const app = fixture({ lang: '?lang=en' });
    await app.document.getElementById('refresh-metrics').events.click();
    const message = app.document.getElementById('metrics-status').textContent;
    assert.equal(message, 'GitHub · 11/3/2026 · Could not update right now.');
    assert.doesNotMatch(message, /snapshot|cache|fallback|API/i);
});

test('menu locks the current scroll position and restores it on close', () => {
    const { document, window } = fixture({ scrollY: 1250 });
    const button = document.querySelector('.menu-toggle');
    button.events.click();
    assert.equal(document.body.style.top, '-1250px');
    assert.equal(document.body.classList.contains('menu-open'), true);
    window.scrollY = 0; // Fixed-body layouts can reset the viewport scroll offset.
    button.events.click();
    assert.equal(window.scrollY, 1250);
    assert.equal(document.body.style.top, '');
    assert.equal(document.body.classList.contains('menu-open'), false);
    assert.equal(document.documentElement.style.scrollBehavior, '');
});

test('selecting an anchor closes the menu and focuses its section', () => {
    const { document } = fixture();
    document.querySelector('.menu-toggle').events.click();
    const anchor = document.getElementById('nav-links').querySelectorAll('a')[1];
    anchor.events.click();
    assert.equal(document.getElementById('nav-links').hidden, true);
    assert.equal(document.body.classList.contains('menu-open'), false);
    assert.equal(document.activeElement, document.querySelector(anchor.hash));
});

test('changing language while the mobile menu is open preserves its state', () => {
    const { document } = fixture();
    const button = document.querySelector('.menu-toggle');
    button.events.click();
    document.querySelector('.lang-toggle').events.click();
    assert.equal(button.getAttribute('aria-label'), 'Close menu');
    assert.equal(button.getAttribute('aria-expanded'), 'true');
    assert.equal(document.getElementById('nav-links').hidden, false);
    document.events.keydown({ key: 'Escape', preventDefault() {} });
    assert.equal(button.getAttribute('aria-label'), 'Open menu');
});

test('brand returns to the hero and closes the menu', () => {
    const { document } = fixture();
    document.querySelector('.menu-toggle').events.click();
    document.querySelector('.brand').events.click();
    assert.equal(document.getElementById('nav-links').hidden, true);
    assert.equal(document.activeElement, document.getElementById('inicio'));
});

test('Safari overscroll offsets cannot produce an invalid fixed-body position', () => {
    const { document, window } = fixture({ scrollY: -20 });
    const button = document.querySelector('.menu-toggle');
    button.events.click();
    assert.equal(document.body.style.top, '-0px');
    button.events.click();
    assert.equal(window.scrollY, 0);
});
