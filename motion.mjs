const activeCounters = new Set();

/** @param {number} value */
export function clampProgress(value) {
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

/** @param {string} text @returns {number | null} */
export function parseCount(text) {
    if (!/^[\d.,\s]+$/.test(text) || !/\d/.test(text)) return null;
    const value = Number(text.replace(/[^\d]/g, ''));
    return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

/** @param {number[]} positions @param {number} cursor */
export function stageAt(positions, cursor) {
    let index = 0;
    for (let i = 0; i < positions.length; i++) {
        if (positions[i] <= cursor) index = i;
        else break;
    }
    return index;
}

/** End decorative counters before language changes or a new metrics dataset. */
export function settleCounters() {
    [...activeCounters].forEach(finish => finish());
}

/** The original, accessible metric is never rewritten by the animation. */
export function animateCounter(element, window, duration = 750) {
    const visual = element.parentElement.querySelector('.counter-visual');
    const target = parseCount(element.textContent);
    if (!visual || target === null) return;
    const shell = element.parentElement;
    const formatter = new Intl.NumberFormat(element.ownerDocument.documentElement.lang);
    let frame = 0;
    const start = window.performance.now();
    const finish = () => {
        window.cancelAnimationFrame(frame);
        visual.hidden = true;
        shell.classList.remove('is-counting');
        activeCounters.delete(finish);
    };
    const tick = now => {
        const progress = clampProgress((now - start) / duration);
        visual.textContent = formatter.format(Math.round(target * (1 - (1 - progress) ** 3)));
        if (progress < 1) frame = window.requestAnimationFrame(tick);
        else finish();
    };
    visual.textContent = '0';
    visual.hidden = false;
    shell.classList.add('is-counting');
    activeCounters.add(finish);
    frame = window.requestAnimationFrame(tick);
}

function readTokens(document, window) {
    const style = window.getComputedStyle(document.documentElement);
    const number = (name, fallback) => parseFloat(style.getPropertyValue(name)) || fallback;
    return {
        duration: number('--motion-duration', 640),
        distance: number('--motion-distance', 28),
        stagger: number('--motion-stagger', 90),
        easing: style.getPropertyValue('--motion-ease').trim() || 'cubic-bezier(.22, 1, .36, 1)',
    };
}

function motionTargets(document, stagger) {
    const targets = new Map();
    const add = (element, delay = 0, scale = false) => {
        if (element) targets.set(element, { delay, scale });
    };
    document.querySelectorAll('.section-heading, .section-intro').forEach(element => {
        if (!element.closest('.hero') && !element.closest('.course-showcase-header')) add(element);
    });
    ['.project-card', '.oss-card', '.credential-card', '.course-card'].forEach(selector => {
        document.querySelectorAll(selector).forEach((element, index) => add(element, (index % 3) * stagger));
    });
    document.querySelectorAll('.story-step, .timeline-item, .course-metrics, .course-showcase-header, .contact-actions').forEach(element => add(element));
    add(document.querySelector('.architecture-panel'), stagger, true);
    add(document.querySelector('.oss-summary'));
    const hero = ['.hero h1 > span:first-child', '.hero h1 .accent', '.hero-copy', '.hero-actions', '.portrait-wrap'];
    hero.forEach((selector, index) => add(document.querySelector(selector), index * stagger, selector === '.portrait-wrap'));
    return targets;
}

function installReveals(document, window, reduced, animations) {
    const tokens = readTokens(document, window);
    const targets = motionTargets(document, tokens.stagger);
    const observer = new window.IntersectionObserver(entries => {
        const current = readTokens(document, window);
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const element = entry.target;
            observer.unobserve(element);
            element.classList.add('is-visible');
            if (reduced.matches) return;
            if (element.matches('.oss-summary')) {
                element.querySelectorAll('[data-metric]').forEach(metric => animateCounter(metric, window));
            }
            if (!element.animate || element.contains(document.activeElement)) return;
            const { delay, scale } = targets.get(element);
            const animation = element.animate([
                { opacity: .08, transform: 'translateY(' + current.distance + 'px) scale(' + (scale ? .975 : 1) + ')' },
                { opacity: 1, transform: 'translateY(0) scale(1)' },
            ], { duration: current.duration, delay: delay * current.stagger / tokens.stagger, easing: current.easing, fill: 'backwards' });
            animations.set(element, animation);
            animation.onfinish = () => animations.delete(element);
            if (element.matches('.credential-card')) revealBadge(element, current, animations);
        });
    }, { rootMargin: '0px 0px -4% 0px', threshold: .08 });
    targets.forEach((_, element) => observer.observe(element));
    return observer;
}

function revealBadge(card, tokens, animations) {
    const image = card.querySelector('img');
    if (!image?.animate) return;
    const animation = image.animate([{ transform: 'scale(.94)' }, { transform: 'scale(1)' }], {
        duration: tokens.duration, easing: tokens.easing,
    });
    animations.set(image, animation);
    animation.onfinish = () => animations.delete(image);
}

const stageComponents = {
    problem: [], solution: ['compute', 'data', 'frontend'],
    architecture: ['compute', 'data', 'infrastructure', 'delivery', 'frontend', 'integrations'],
    operations: ['infrastructure', 'delivery', 'integrations'], results: ['compute', 'frontend'],
};

function activateStory(document, key) {
    document.querySelectorAll('[data-story-step]').forEach(element => element.classList.toggle('is-active', element.dataset.storyStep === key));
    document.querySelectorAll('[data-story-marker]').forEach(element => element.classList.toggle('is-active', element.dataset.storyMarker === key));
    document.querySelectorAll('[data-component]').forEach(element => {
        element.classList.toggle('is-highlighted', stageComponents[key].includes(element.dataset.component));
    });
}

function installComponents(document) {
    const buttons = [...document.querySelectorAll('[data-component-toggle]')];
    const listeners = new Map();
    buttons.forEach(button => {
        button.hidden = false;
        const select = () => {
            const selecting = button.getAttribute('aria-pressed') !== 'true';
            buttons.forEach(other => {
                const selected = other === button && selecting;
                other.setAttribute('aria-pressed', String(selected));
                other.closest('[data-component]').classList.toggle('is-selected', selected);
            });
        };
        button.addEventListener('click', select);
        listeners.set(button, select);
    });
    return () => listeners.forEach((listener, button) => button.removeEventListener('click', listener));
}

function installScroll(document, window, reduced) {
    const root = document.documentElement;
    const header = document.querySelector('.site-header');
    const timeline = document.querySelector('.timeline');
    const panel = document.querySelector('.architecture-panel');
    const steps = [...document.querySelectorAll('[data-story-step]')];
    let geometry = null;
    let frame = 0;
    let active = -1;
    const measure = () => {
        if (document.body.classList.contains('menu-open')) return;
        const y = window.scrollY;
        const rect = timeline.getBoundingClientRect();
        geometry = { max: Math.max(1, root.scrollHeight - window.innerHeight), height: window.innerHeight,
            timelineTop: rect.top + y, timelineHeight: rect.height,
            steps: steps.map(step => step.getBoundingClientRect().top + y) };
        const panelFits = panel && panel.getBoundingClientRect().height <= window.innerHeight - 120;
        panel?.classList.toggle('can-stick', Boolean(panelFits));
        schedule();
    };
    const draw = () => {
        frame = 0;
        if (!geometry || document.body.classList.contains('menu-open')) return;
        const y = Math.max(0, window.scrollY);
        header.classList.toggle('is-scrolled', y > 24);
        root.style.setProperty('--reading-progress', reduced.matches ? '0' : String(clampProgress(y / geometry.max)));
        const line = reduced.matches ? 1 : clampProgress((y + geometry.height * .72 - geometry.timelineTop) / Math.max(1, geometry.timelineHeight));
        root.style.setProperty('--timeline-progress', String(line));
        const next = stageAt(geometry.steps, y + geometry.height * .45);
        if (next !== active && steps[next]) { active = next; activateStory(document, steps[next].dataset.storyStep); }
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(draw); };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    const resize = 'ResizeObserver' in window ? new window.ResizeObserver(measure) : null;
    resize?.observe(document.body);
    measure();
    return { measure, stop() { window.cancelAnimationFrame(frame); resize?.disconnect(); window.removeEventListener('scroll', schedule); window.removeEventListener('resize', measure); } };
}

/** Progressive enhancement: every element is visible before and without this module. */
export function initializeMotion(document, window) {
    if (!window.IntersectionObserver || !window.requestAnimationFrame) return () => {};
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const animations = new Map();
    const reveals = installReveals(document, window, reduced, animations);
    const scroll = installScroll(document, window, reduced);
    const finish = () => { animations.forEach(animation => animation.cancel()); animations.clear(); settleCounters(); };
    const preferenceChanged = () => { if (reduced.matches) finish(); scroll.measure(); };
    const focus = event => animations.forEach((animation, element) => {
        if (element.contains(event.target)) { animation.cancel(); animations.delete(element); }
    });
    const visibility = () => { if (document.hidden) finish(); };
    reduced.addEventListener('change', preferenceChanged);
    document.addEventListener('focusin', focus);
    document.addEventListener('visibilitychange', visibility);
    const stopComponents = installComponents(document);
    return () => {
        reveals.disconnect(); scroll.stop(); finish();
        reduced.removeEventListener('change', preferenceChanged);
        document.removeEventListener('focusin', focus);
        document.removeEventListener('visibilitychange', visibility);
        stopComponents();
    };
}
