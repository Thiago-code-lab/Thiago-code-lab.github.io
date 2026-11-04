import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
const tags = [...html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '').matchAll(/<\/?[a-z][^>]*>/gi)].map(match => match[0]);
const attributes = tag => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(match => [match[1], match[2]]));
const nodes = tags.filter(tag => !tag.startsWith('</')).map(tag => ({ tag, attrs: attributes(tag) }));

test('HTML nesting, unique IDs and one H1', () => {
    const stack = [];
    const voids = new Set(['meta', 'link', 'img', 'br', 'hr', 'input']);
    for (const tag of tags) {
        const name = tag.match(/^<\/?([\w-]+)/)[1].toLowerCase();
        if (voids.has(name)) continue;
        if (tag.startsWith('</')) assert.equal(stack.pop(), name, 'Invalid nesting: ' + tag);
        else stack.push(name);
    }
    assert.deepEqual(stack, []);
    const ids = nodes.map(node => node.attrs.id).filter(Boolean);
    assert.equal(new Set(ids).size, ids.length);
    assert.equal(nodes.filter(node => /^<h1\b/.test(node.tag)).length, 1);
});

test('all local links, assets, and anchor destinations exist', () => {
    const ids = new Set(nodes.map(node => node.attrs.id));
    for (const { attrs } of nodes) {
        for (const url of [attrs.href, attrs.src].filter(Boolean)) {
            if (url.startsWith('#')) assert.ok(ids.has(url.slice(1)), url);
            else if (!/^(https?:|mailto:)/.test(url)) assert.ok(fs.existsSync(path.join(root, decodeURIComponent(url))), url);
        }
    }
});

test('translations are paired and accessibility translations have both languages', () => {
    const translated = nodes.filter(node => node.attrs['data-pt'] || node.attrs['data-en']);
    assert.ok(translated.length > 0);
    for (const { attrs } of translated) assert.ok(attrs['data-pt'] && attrs['data-en']);
    for (const { attrs } of nodes) {
        if (attrs['data-alt-pt']) assert.ok(attrs['data-alt-en']);
        if (attrs['data-aria-pt']) assert.ok(attrs['data-aria-en']);
    }
});

test('external tabs are isolated and all images have alternatives and dimensions', () => {
    for (const { tag, attrs } of nodes) {
        if (attrs.target === '_blank') assert.match(attrs.rel, /noopener/);
        if (tag.startsWith('<img')) {
            assert.ok(Object.hasOwn(attrs, 'alt'));
            assert.ok(Number(attrs.width) > 0 && Number(attrs.height) > 0);
        }
    }
});

test('progressive enhancement keeps content visible without JavaScript', () => {
    assert.doesNotMatch(css, /opacity:\s*0(?:[;\s}]|$)/);
    assert.match(css, /\[hidden\]\s*\{\s*display:\s*none !important/);
    assert.match(html, /id="year">2026</);
    assert.doesNotMatch(html, /250\+|20 anos|Impacto real/);
});

test('section order and preserved public destinations', () => {
    const sections = nodes.filter(node => node.tag.startsWith('<section')).map(node => node.attrs.id);
    assert.deepEqual(sections, ['inicio', 'cloudstudy', 'projetos', 'opensource', 'trajetoria', 'credenciais', 'contato']);
    const original = ['aws-certified-solutions-architect-associate-brasil', 'aws-certified-ai-practitioner-brasil', 'aws-certified-cloud-practitioner-brasil', 'aws-streaming-fraud-detection', 'data-engineering-netflix', 'referralCode=E28670B9116BA68E08A9', '1golySmWUI-0wjs3a5n0YqXnJ0bXzcupc', 'analyticsthiagocardoso', 'analyticsdev.thiago@gmail.com'];
    for (const destination of original) assert.ok(html.includes(destination), destination);
});

test('SEO has absolute canonical and correctly typed social image', () => {
    assert.match(html, /rel="canonical" href="https:\/\/thiago-code-lab.github.io\/"/);
    assert.match(html, /property="og:image" content="https:\/\/thiago-code-lab.github.io\/thiago-720.jpg"/);
    const person = JSON.parse(html.match(/id="person-data">([\s\S]*?)<\/script>/)[1]);
    assert.equal(person.jobTitle, 'Cloud Engineer');
    const image = fs.readFileSync(path.join(root, 'thiago-720.jpg'));
    assert.equal(image.subarray(0, 2).toString('hex'), 'ffd8');
    assert.match(html, /property="og:image:type" content="image\/jpeg"/);
});

test('public copy keeps context without internal implementation notes', () => {
    const body = html.slice(html.indexOf('<body>')).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.doesNotMatch(body, /snapshot|fallback|cache de|API pública|public GitHub API|componentes confirmados|confirmed components|case principal|featured case|informação do instrutor|reported by the instructor|topologia de rede|network topology/i);
    assert.match(body, /educacional.*transações sintéticas/);
    assert.match(body, /academic team project/);
    assert.match(body, /alunos no total/);
    assert.match(body, /students in total/);
    assert.match(body, /GitHub · 03\/11\/2026/);
});
