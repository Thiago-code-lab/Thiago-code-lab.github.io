import { CACHE_KEY, SNAPSHOT, fetchMetrics, parseCache, readStorage, totals, writeStorage } from './metrics.mjs';
import { initializeMotion, settleCounters } from './motion.mjs';

const storage = {
    getItem: key => window.localStorage.getItem(key),
    setItem: (key, value) => window.localStorage.setItem(key, value),
};
const menuButton = document.querySelector('.menu-toggle');
const languageButton = document.querySelector('.lang-toggle');
const navigation = document.getElementById('nav-links');
const mobile = window.matchMedia('(max-width: 1040px)');
const metricStatus = document.getElementById('metrics-status');
const refreshButton = document.getElementById('refresh-metrics');
const translations = document.querySelectorAll('[data-pt][data-en]');
let language = 'pt';
let metrics = parseCache(readStorage(storage, CACHE_KEY)) || SNAPSHOT;
let metricsState = metrics === SNAPSHOT ? 'snapshot' : 'cache';
let requesting = false;
let lockedScrollY = 0;

const choose = (pt, en) => language === 'pt' ? pt : en;
const locale = () => language === 'pt' ? 'pt-BR' : 'en-US';

function renderMetrics() {
    settleCounters();
    const values = { ...metrics.repos, total: totals(metrics.repos) };
    document.querySelectorAll('[data-metric]').forEach(element => {
        const [key, type] = element.dataset.metric.split('-');
        element.textContent = values[key][type].toLocaleString(locale());
    });
    const date = new Date(metrics.date).toLocaleDateString(locale(), { timeZone: 'UTC' });
    const messages = {
        snapshot: '', cache: '', live: '',
        loading: choose(' · Atualizando…', ' · Updating…'),
        error: choose(' · Não foi possível atualizar agora.', ' · Could not update right now.'),
    };
    const reference = 'GitHub · ' + date;
    metricStatus.textContent = reference + messages[metricsState];
    document.querySelector('[data-fraud-reference]').textContent = reference;
}

function updateMetadata() {
    const title = choose('Thiago Cardoso — Cloud Engineer | AWS e infraestrutura', 'Thiago Cardoso — Cloud Engineer | AWS infrastructure');
    const description = choose(
        'Cloud Engineer com foco em AWS, arquitetura, infraestrutura e automação. Fundador da CloudStudy, com experiência em Cloud e DevSecOps, projetos de dados e open source.',
        'Cloud Engineer focused on AWS, architecture, infrastructure, and automation. CloudStudy founder with Cloud and DevSecOps experience, data projects, and open source work.');
    document.title = title;
    ['meta[name="description"]', 'meta[property="og:description"]', 'meta[name="twitter:description"]'].forEach(selector => document.querySelector(selector).content = description);
    ['meta[property="og:title"]', 'meta[name="twitter:title"]'].forEach(selector => document.querySelector(selector).content = title);
    document.querySelector('meta[property="og:locale"]').content = choose('pt_BR', 'en_US');
    document.querySelector('meta[property="og:locale:alternate"]').content = choose('en_US', 'pt_BR');
    const portraitAlt = choose('Retrato profissional de Thiago Cardoso', 'Professional portrait of Thiago Cardoso');
    ['meta[property="og:image:alt"]', 'meta[name="twitter:image:alt"]'].forEach(selector => document.querySelector(selector).content = portraitAlt);
    const person = document.getElementById('person-data');
    const data = JSON.parse(person.textContent);
    data.description = description;
    person.textContent = JSON.stringify(data);
}

function updateMenuLabel() {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-label', open ? choose('Fechar menu', 'Close menu') : choose('Abrir menu', 'Open menu'));
}

function setLanguage(next) {
    language = next === 'en' ? 'en' : 'pt';
    document.documentElement.lang = choose('pt-BR', 'en');
    translations.forEach(element => { element.textContent = element.dataset[language]; });
    document.querySelectorAll('[data-aria-pt]').forEach(element => element.setAttribute('aria-label', element.dataset[language === 'pt' ? 'ariaPt' : 'ariaEn']));
    document.querySelectorAll('[data-alt-pt]').forEach(element => element.alt = element.dataset[language === 'pt' ? 'altPt' : 'altEn']);
    languageButton.textContent = choose('EN', 'PT');
    languageButton.setAttribute('aria-label', choose('Change language to English', 'Mudar idioma para português'));
    writeStorage(storage, 'portfolio-language', language);
    updateMenuLabel();
    updateMetadata();
    renderMetrics();
}

function lockPageScroll() {
    if (document.body.classList.contains('menu-open')) return;
    lockedScrollY = Math.max(0, window.scrollY);
    document.body.style.top = '-' + lockedScrollY + 'px';
    document.body.classList.add('menu-open');
}

function unlockPageScroll() {
    if (!document.body.classList.contains('menu-open')) return;
    const rootStyle = document.documentElement.style;
    const previousBehavior = rootStyle.scrollBehavior;
    rootStyle.scrollBehavior = 'auto';
    document.body.classList.remove('menu-open');
    document.body.style.top = '';
    window.scrollTo(0, lockedScrollY);
    rootStyle.scrollBehavior = previousBehavior;
}

function closeMenu(restoreFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    navigation.hidden = mobile.matches;
    navigation.inert = mobile.matches;
    unlockPageScroll();
    updateMenuLabel();
    if (restoreFocus && mobile.matches) menuButton.focus();
}

function syncMenu() {
    const wasFocused = navigation.contains(document.activeElement);
    menuButton.hidden = !mobile.matches;
    closeMenu(wasFocused && mobile.matches);
}

function toggleMenu() {
    if (!mobile.matches) return;
    if (menuButton.getAttribute('aria-expanded') === 'true') return closeMenu(true);
    navigation.hidden = false;
    navigation.inert = false;
    navigation.classList.add('open');
    menuButton.setAttribute('aria-expanded', 'true');
    lockPageScroll();
    updateMenuLabel();
    navigation.querySelector('a').focus();
}

function handleMenuKeys(event) {
    if (!mobile.matches || menuButton.getAttribute('aria-expanded') !== 'true') return;
    if (event.key === 'Escape') { event.preventDefault(); closeMenu(true); return; }
    if (event.key !== 'Tab') return;
    const controls = [document.querySelector('.brand'), menuButton, ...navigation.querySelectorAll('a'), languageButton];
    const current = controls.indexOf(document.activeElement);
    if (event.shiftKey && current <= 0) { event.preventDefault(); controls.at(-1).focus(); }
    else if (!event.shiftKey && (current === controls.length - 1 || current === -1)) {
        event.preventDefault(); controls[0].focus();
    }
}

async function refreshMetrics() {
    if (requesting) return;
    const cache = parseCache(readStorage(storage, CACHE_KEY));
    if (cache) { metrics = cache; metricsState = 'cache'; renderMetrics(); return; }
    requesting = true;
    refreshButton.disabled = true;
    refreshButton.setAttribute('aria-busy', 'true');
    metricsState = 'loading';
    renderMetrics();
    try {
        metrics = await fetchMetrics();
        metricsState = 'live';
        writeStorage(storage, CACHE_KEY, JSON.stringify(metrics));
    } catch {
        metricsState = 'error'; // Keep the last complete dataset; never mix reference dates.
    } finally {
        requesting = false;
        refreshButton.disabled = false;
        refreshButton.removeAttribute('aria-busy');
        renderMetrics();
    }
}

function observeSections() {
    if (!('IntersectionObserver' in window)) return;
    const anchors = [...navigation.querySelectorAll('a[href^="#"]')];
    const observer = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        anchors.forEach(anchor => {
            if (anchor.hash === '#' + visible.target.id) anchor.setAttribute('aria-current', 'location');
            else anchor.removeAttribute('aria-current');
        });
    }, { rootMargin: '-15% 0px -50% 0px', threshold: [0, .25, .5] });
    anchors.forEach(anchor => { const section = document.querySelector(anchor.hash); if (section) observer.observe(section); });
}

function activateSection(anchor) {
    closeMenu();
    const target = document.querySelector(anchor.hash);
    if (!target) return;
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
}

function initialize() {
    const preferred = new URLSearchParams(window.location.search).get('lang');
    setLanguage(preferred === 'pt' || preferred === 'en' ? preferred : readStorage(storage, 'portfolio-language'));
    document.documentElement.classList.add('js');
    languageButton.hidden = false;
    refreshButton.hidden = false;
    syncMenu();
    menuButton.addEventListener('click', toggleMenu);
    languageButton.addEventListener('click', () => setLanguage(language === 'pt' ? 'en' : 'pt'));
    refreshButton.addEventListener('click', refreshMetrics);
    document.addEventListener('keydown', handleMenuKeys);
    mobile.addEventListener('change', syncMenu);
    navigation.querySelectorAll('a').forEach(anchor => anchor.addEventListener('click', () => activateSection(anchor)));
    const brand = document.querySelector('.brand');
    brand.addEventListener('click', () => activateSection(brand));
    document.getElementById('year').textContent = new Date().getFullYear();
    observeSections();
}

initialize();
initializeMotion(document, window);
