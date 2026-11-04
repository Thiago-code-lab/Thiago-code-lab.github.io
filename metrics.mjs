export const CACHE_KEY = 'portfolio-github-v2';
export const CACHE_TTL = 24 * 60 * 60 * 1000;
export const REPOSITORIES = Object.freeze({
    saa: 'aws-certified-solutions-architect-associate-brasil',
    clf: 'aws-certified-cloud-practitioner-brasil',
    aif: 'aws-certified-ai-practitioner-brasil',
    fraud: 'aws-streaming-fraud-detection',
});
export const SNAPSHOT = Object.freeze({
    date: '2026-11-03',
    repos: Object.freeze({
        saa: Object.freeze({ stars: 989, forks: 254 }),
        clf: Object.freeze({ stars: 753, forks: 157 }),
        aif: Object.freeze({ stars: 463, forks: 131 }),
        fraud: Object.freeze({ stars: 49, forks: 13 }),
    }),
});

/** @param {{ getItem(key: string): string | null }} storage @param {string} key */
export function readStorage(storage, key) {
    try { return storage.getItem(key); }
    catch { return null; } // Storage may be unavailable in private or restricted contexts.
}

/** @param {{ setItem(key: string, value: string): void }} storage @param {string} key @param {string} value */
export function writeStorage(storage, key, value) {
    try { storage.setItem(key, value); return true; }
    catch { return false; } // Rendering and refresh remain functional without persistence.
}

/** @param {unknown} value */
export function validCounts(value) {
    return value !== null && typeof value === 'object'
        && Number.isSafeInteger(value.stars) && value.stars >= 0
        && Number.isSafeInteger(value.forks) && value.forks >= 0;
}

/** @param {string | null} raw @param {number} now */
export function parseCache(raw, now = Date.now()) {
    try {
        const value = JSON.parse(raw);
        const timestamp = Date.parse(value?.date);
        if (!Number.isFinite(timestamp) || timestamp > now || now - timestamp >= CACHE_TTL) return null;
        if (!Object.keys(REPOSITORIES).every(key => validCounts(value?.repos?.[key]))) return null;
        return { date: new Date(timestamp).toISOString(), repos: value.repos };
    } catch { return null; } // Corrupt or obsolete cache must never replace the verified snapshot.
}

export function totals(repos) {
    return ['saa', 'clf', 'aif'].reduce((sum, key) => ({
        stars: sum.stars + repos[key].stars,
        forks: sum.forks + repos[key].forks,
    }), { stars: 0, forks: 0 });
}

async function fetchRepository(fetcher, key, slug, signal) {
    const response = await fetcher('https://api.github.com/repos/Thiago-code-lab/' + slug, {
        headers: { Accept: 'application/vnd.github+json' }, signal,
        credentials: 'omit', referrerPolicy: 'no-referrer',
    });
    if (!response.ok) throw new Error('GitHub request failed: ' + response.status);
    const data = await response.json();
    const counts = { stars: data.stargazers_count, forks: data.forks_count };
    if (data.full_name !== 'Thiago-code-lab/' + slug || !validCounts(counts)) {
        throw new Error('Invalid GitHub repository response');
    }
    return [key, counts];
}

export async function fetchMetrics(fetcher = fetch, now = Date.now) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
        const entries = await Promise.all(Object.entries(REPOSITORIES).map(([key, slug]) =>
            fetchRepository(fetcher, key, slug, controller.signal)));
        return { date: new Date(now()).toISOString(), repos: Object.fromEntries(entries) };
    } finally {
        clearTimeout(timeout);
        controller.abort();
    }
}
