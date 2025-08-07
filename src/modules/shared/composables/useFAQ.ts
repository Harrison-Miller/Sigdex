import { ref } from 'vue';
import { openDB } from 'idb';
import type { IFAQData } from '../faq/types';

const FAQ_URL = import.meta.env.DEV
    ? '/api/faq'
    : 'https://pdfdata.sigdex.io/data/faq.json';
const FAQ_DB_NAME = 'sigdex-faq-db';
const FAQ_STORE = 'faq';
const FAQ_KEY = 'faq';
const FAQ_TIMESTAMP_KEY = 'faqTimestamp';

const _faq = ref<IFAQData | null>(null);
const _loading = ref(false);
const _error = ref<string | null>(null);
let _loadPromise: Promise<void> | null = null;

function getLastWednesday10am(now = new Date()): Date {
    // Find last Wednesday 10am before now
    const d = new Date(now);
    d.setHours(10, 0, 0, 0);
    const day = d.getDay();
    const diff = (day >= 3) ? day - 3 : 7 - (3 - day); // 3 = Wednesday
    d.setDate(d.getDate() - diff);
    if (d > now) d.setDate(d.getDate() - 7); // If it's in the future, go back a week
    return d;
}

function isFAQStale(): boolean {
    const ts = localStorage.getItem(FAQ_TIMESTAMP_KEY);
    if (!ts) return true;
    const lastFetched = new Date(ts);
    const now = new Date();
    const lastWed = getLastWednesday10am(now);
    // If lastFetched < lastWed + 7 days, it's stale
    return lastFetched < lastWed;
}

async function getDB() {
    return openDB(FAQ_DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(FAQ_STORE)) {
                db.createObjectStore(FAQ_STORE);
            }
        },
    });
}

export function clearFAQCache() {
    _faq.value = null;
    _loading.value = false;
    _error.value = null;
    _loadPromise = null;
    localStorage.removeItem(FAQ_TIMESTAMP_KEY);
    getDB().then(db => db.clear(FAQ_STORE));
}

export function useFAQ() {
    if (!_faq.value && !_loading.value && !_loadPromise) {
        loadFAQ();
    }
    return {
        faq: _faq,
        loading: _loading,
        error: _error,
    };
}

async function loadFAQ() {
    _loading.value = true;
    try {
        const db = await getDB();
        const needsUpdate = isFAQStale();
        const cached = await db.get(FAQ_STORE, FAQ_KEY);
        if (!needsUpdate && cached) {
            _faq.value = cached as IFAQData;
            _loading.value = false;
            return;
        }
        // Fetch from remote
        const resp = await fetch(FAQ_URL);
        if (!resp.ok) throw new Error('Failed to fetch FAQ');
        const data = await resp.json();
        _faq.value = data as IFAQData;
        await db.put(FAQ_STORE, data, FAQ_KEY);
        localStorage.setItem(FAQ_TIMESTAMP_KEY, new Date().toISOString());
        _loading.value = false;
    } catch (e: any) {
        _error.value = e.message || 'Failed to load FAQ';
        _loading.value = false;
    }
}
