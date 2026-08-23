// Resolves which village (tenant) this browser tab is pointed at.
//
// In production a village site is served from its own subdomain
// (shayala.panchayatsuvidha.in). Locally there's no real subdomain, so we
// fall back to a ?village= query param or a remembered dev choice.
//
// This is a plain module (not a React hook) because the axios request
// interceptor needs to read the slug synchronously, before any component
// has mounted.

export const KNOWN_VILLAGE_SLUGS = ['sayla', 'demo', 'kukavav'];
const DEV_STORAGE_KEY = 'devVillageSlug';

function extractSlugFromHost(hostname) {
    const parts = hostname.split('.');
    const isLocalHostLike = hostname === 'localhost' || hostname === '127.0.0.1' || parts[parts.length - 1] === 'localhost';

    if (isLocalHostLike) {
        // e.g. 'shayala.localhost' -> 'shayala'; plain 'localhost' -> none
        return parts.length > 1 ? parts[0] : null;
    }
    // e.g. 'shayala.panchayatsuvidha.in' -> 'shayala'; 'panchayatsuvidha.in' -> none
    return parts.length > 2 ? parts[0] : null;
}

function resolveInitialSlug() {
    if (typeof window === 'undefined') return KNOWN_VILLAGE_SLUGS[0];

    const fromQuery = new URLSearchParams(window.location.search).get('village');
    if (fromQuery) {
        window.localStorage.setItem(DEV_STORAGE_KEY, fromQuery);
        return fromQuery;
    }

    const fromHost = extractSlugFromHost(window.location.hostname);
    if (fromHost) return fromHost;

    // No subdomain (e.g. plain 'localhost') — use the last dev choice, or
    // default to the first known village so the app isn't blank.
    return window.localStorage.getItem(DEV_STORAGE_KEY) || KNOWN_VILLAGE_SLUGS[0];
}

let currentSlug = resolveInitialSlug();

export function getVillageSlug() {
    return currentSlug;
}

export function setVillageSlug(slug) {
    currentSlug = slug;
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(DEV_STORAGE_KEY, slug);
    }
}

// True when the slug came from a real subdomain/query param rather than the
// plain-localhost dev fallback — used to decide whether to show a village
// switcher UI.
export function isDevFallback() {
    if (typeof window === 'undefined') return false;
    return extractSlugFromHost(window.location.hostname) === null
        && !new URLSearchParams(window.location.search).get('village');
}
