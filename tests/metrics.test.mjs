import test from 'node:test';
import assert from 'node:assert/strict';
import { CACHE_TTL, REPOSITORIES, SNAPSHOT, fetchMetrics, parseCache, readStorage, totals, validCounts, writeStorage } from '../metrics.mjs';

const now = Date.parse('2026-11-03T18:00:00Z');
const cached = age => JSON.stringify({ date: new Date(now - age).toISOString(), repos: SNAPSHOT.repos });

test('open source total excludes Fraud Detection', () => {
    assert.deepEqual(totals(SNAPSHOT.repos), { stars: 2205, forks: 542 });
});

test('cache expires at 24 hours and rejects future timestamps', () => {
    assert.ok(parseCache(cached(CACHE_TTL - 1), now));
    assert.equal(parseCache(cached(CACHE_TTL), now), null);
    assert.equal(parseCache(cached(-1), now), null);
});

test('malformed and incomplete caches cannot replace fallback', () => {
    for (const raw of [null, 'invalid', '{}', '{"date":"2026-11-03T17:00:00Z","repos":{}}']) {
        assert.equal(parseCache(raw, now), null);
    }
});

test('counts must be nonnegative safe integers', () => {
    for (const stars of [-1, 1.5, '989', NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) {
        assert.equal(validCounts({ stars, forks: 1 }), false);
    }
    assert.equal(validCounts({ stars: 0, forks: 0 }), true);
});

test('blocked storage does not stop the page', () => {
    const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
    assert.equal(readStorage(blocked, 'language'), null);
    assert.equal(writeStorage(blocked, 'language', 'en'), false);
});

test('refresh validates all four repositories in one complete dataset', async () => {
    const calls = [];
    const result = await fetchMetrics(async (url, options) => {
        calls.push({ url, options });
        return { ok: true, json: async () => ({ full_name: url.split('/repos/')[1], stargazers_count: 10, forks_count: 2 }) };
    }, () => now);
    assert.equal(calls.length, 4);
    assert.equal(result.date, new Date(now).toISOString());
    assert.deepEqual(totals(result.repos), { stars: 30, forks: 6 });
    assert.ok(calls.every(call => call.options.credentials === 'omit'));
});

test('rate limiting rejects refresh instead of producing partial totals', async () => {
    await assert.rejects(fetchMetrics(async url => ({
        ok: !url.endsWith(REPOSITORIES.fraud), status: 403,
        json: async () => ({ full_name: url.split('/repos/')[1], stargazers_count: 1, forks_count: 1 }),
    })), /403/);
    assert.deepEqual(totals(SNAPSHOT.repos), { stars: 2205, forks: 542 });
});

test('wrong repository identity and malformed API counts are rejected', async () => {
    for (const data of [
        { full_name: 'other/repository', stargazers_count: 1, forks_count: 1 },
        { full_name: 'Thiago-code-lab/' + REPOSITORIES.saa, stargazers_count: '1', forks_count: 1 },
    ]) {
        await assert.rejects(fetchMetrics(async () => ({ ok: true, json: async () => data })), /Invalid/);
    }
});
