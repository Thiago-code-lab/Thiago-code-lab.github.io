import test from 'node:test';
import assert from 'node:assert/strict';
import { animateCounter, clampProgress, initializeMotion, parseCount, settleCounters, stageAt } from '../motion.mjs';

function classList(initial = []) {
    const values = new Set(initial);
    return { add: value => values.add(value), remove: value => values.delete(value), contains: value => values.has(value),
        toggle(value, state) { if (state ?? !values.has(value)) values.add(value); else values.delete(value); } };
}

function clock() {
    let id = 0;
    const frames = new Map();
    return { performance: { now: () => 0 },
        requestAnimationFrame(callback) { frames.set(++id, callback); return id; },
        cancelAnimationFrame(key) { frames.delete(key); },
        flush(now) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(now)); },
        get pending() { return frames.size; },
    };
}

function counterFixture() {
    const visual = { hidden: true, textContent: '', ariaHidden: true };
    const shell = { classList: classList(), querySelector: () => visual };
    const element = { textContent: '2.205', parentElement: shell, ownerDocument: { documentElement: { lang: 'pt-BR' } } };
    return { element, visual, shell, window: clock() };
}

class Node {
    constructor(classes = [], dataset = {}) {
        this.classList = classList(classes);
        this.dataset = dataset;
        this.children = [];
        this.events = new Map();
        this.attrs = {};
        this.hidden = true;
        this.animations = [];
        this.style = { setProperty: (name, value) => { this.style[name] = value; } };
    }
    matches(selector) {
        if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
        const key = selector.slice(1, -1).replace(/^data-/, '').replace(/-([a-z])/g, (_, char) => char.toUpperCase());
        return Object.hasOwn(this.dataset, key);
    }
    contains(node) { return this === node || this.children.some(child => child.contains(node)); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    querySelectorAll(selector) { return this.children.filter(child => child.matches(selector)); }
    closest() { return this.parentElement; }
    setAttribute(key, value) { this.attrs[key] = value; }
    getAttribute(key) { return this.attrs[key] ?? null; }
    addEventListener(name, callback) { this.events.set(name, callback); }
    removeEventListener(name) { this.events.delete(name); }
    animate(keyframes, options) {
        const animation = { keyframes, options, cancelled: false, cancel() { this.cancelled = true; } };
        this.animations.push(animation);
        return animation;
    }
}

function scene(reduce = false) {
    const root = new Node();
    root.scrollHeight = 5000;
    root.lang = 'pt-BR';
    const body = new Node();
    const header = new Node(['site-header']);
    const timeline = new Node(['timeline']);
    const card = new Node(['project-card']);
    const steps = ['problem', 'solution', 'architecture', 'operations', 'results'].map(key => new Node(['story-step'], { storyStep: key }));
    const markers = steps.map(node => new Node([], { storyMarker: node.dataset.storyStep }));
    const nodes = ['compute', 'data', 'infrastructure', 'delivery', 'frontend', 'integrations'].map(key => new Node(['infra-node'], { component: key }));
    const buttons = nodes.map(node => {
        const button = new Node([], { componentToggle: node.dataset.component });
        button.parentElement = node; node.children.push(button); return button;
    });
    const elements = [header, timeline, card, ...steps, ...markers, ...nodes, ...buttons];
    const observers = [];
    const reduced = { matches: reduce, addEventListener(name, callback) { this.change = callback; }, removeEventListener() {} };
    const window = Object.assign(clock(), {
        scrollY: 0, innerHeight: 900, events: new Map(),
        matchMedia: () => reduced,
        getComputedStyle: () => ({ getPropertyValue: () => '' }),
        addEventListener(name, callback) { this.events.set(name, callback); },
        removeEventListener(name) { this.events.delete(name); },
        IntersectionObserver: class {
            constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
            observe(node) { this.observed.add(node); }
            unobserve(node) { this.observed.delete(node); }
            disconnect() { this.observed.clear(); }
            enter(node) { if (this.observed.has(node)) this.callback([{ target: node, isIntersecting: true }]); }
        },
    });
    timeline.getBoundingClientRect = () => ({ top: 2500 - window.scrollY, height: 800 });
    steps.forEach((node, index) => { node.getBoundingClientRect = () => ({ top: 500 + index * 300 - window.scrollY, height: 250 }); });
    const document = {
        documentElement: root, body, activeElement: null, hidden: false, events: new Map(),
        querySelectorAll(selector) { return elements.filter(node => selector.split(',').some(part => node.matches(part.trim()))); },
        querySelector(selector) { return this.querySelectorAll(selector)[0] || null; },
        addEventListener(name, callback) { this.events.set(name, callback); }, removeEventListener(name) { this.events.delete(name); },
    };
    return { document, window, reduced, root, card, steps, nodes, buttons, observers };
}

test('counter parsing, clamped progress and story boundaries', () => {
    assert.equal(parseCount('2.205'), 2205);
    assert.equal(parseCount('2,205'), 2205);
    for (const text of ['', '...', '-2', '200+', 'not a metric']) assert.equal(parseCount(text), null);
    assert.equal(clampProgress(-1), 0);
    assert.equal(clampProgress(3), 1);
    assert.equal(clampProgress(NaN), 0);
    assert.equal(stageAt([100, 300, 500], 299), 0);
    assert.equal(stageAt([100, 300, 500], 300), 1);
});

test('decorative count never replaces the accessible real metric', () => {
    const { element, visual, shell, window } = counterFixture();
    animateCounter(element, window);
    window.flush(300);
    assert.equal(element.textContent, '2.205');
    assert.equal(visual.hidden, false);
    window.flush(750);
    assert.equal(element.textContent, '2.205');
    assert.equal(visual.hidden, true);
    assert.equal(shell.classList.contains('is-counting'), false);
    assert.equal(window.pending, 0);
});

test('metric refresh and language changes can cancel unfinished counters', () => {
    const { element, visual, shell, window } = counterFixture();
    animateCounter(element, window);
    window.flush(200);
    settleCounters();
    assert.equal(element.textContent, '2.205');
    assert.equal(visual.hidden, true);
    assert.equal(shell.classList.contains('is-counting'), false);
    assert.equal(window.pending, 0);
});

test('reveal runs once and reduced motion keeps the content static', () => {
    for (const reduce of [false, true]) {
        const app = scene(reduce);
        const stop = initializeMotion(app.document, app.window);
        app.observers[0].enter(app.card);
        app.observers[0].enter(app.card);
        assert.equal(app.card.animations.length, reduce ? 0 : 1);
        assert.equal(app.card.classList.contains('is-visible'), true);
        stop();
        assert.equal(app.window.pending, 0);
    }
});

test('scroll batches frames and highlights only confirmed component groups', () => {
    const app = scene();
    const stop = initializeMotion(app.document, app.window);
    app.window.flush(0);
    app.window.scrollY = 800;
    app.window.events.get('scroll')(); app.window.events.get('scroll')();
    assert.equal(app.window.pending, 1);
    app.window.flush(10);
    assert.equal(app.steps[2].classList.contains('is-active'), true);
    assert.ok(app.nodes.every(node => node.classList.contains('is-highlighted')));
    app.buttons[0].events.get('click')();
    assert.equal(app.buttons[0].getAttribute('aria-pressed'), 'true');
    app.buttons[1].events.get('click')();
    assert.equal(app.buttons[0].getAttribute('aria-pressed'), 'false');
    assert.equal(app.buttons[1].getAttribute('aria-pressed'), 'true');
    stop();
});

test('focusing content or enabling reduced motion cancels entry effects', () => {
    const app = scene();
    const stop = initializeMotion(app.document, app.window);
    app.observers[0].enter(app.card);
    app.document.events.get('focusin')({ target: app.card });
    assert.equal(app.card.animations[0].cancelled, true);
    app.observers[0].enter(app.steps[0]);
    app.reduced.matches = true; app.reduced.change();
    assert.equal(app.steps[0].animations[0].cancelled, true);
    app.window.flush(0);
    assert.equal(app.root.style['--reading-progress'], '0');
    assert.equal(app.root.style['--timeline-progress'], '1');
    stop();
});

test('no observer means no visual hiding or required browser polyfill', () => {
    assert.doesNotThrow(() => initializeMotion({}, {} )());
});
