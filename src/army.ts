import { parseArmy } from './parser/army';
import { Army } from './common/ArmyData';
import { SIGDEX_VERSION } from './version';
import { cleanObject } from './utils/cleanObject';
import { parseLores } from './parser/lores';
import type { Ability } from './common/Ability';

function getGithubBaseUrl() {
  return localStorage.getItem('GITHUB_BASE_URL') || 'https://raw.githubusercontent.com';
}
function getGithubRepo() {
  return localStorage.getItem('GITHUB_REPO') || 'BSData/age-of-sigmar-4th';
}
export const GITHUB_BASE_URL = getGithubBaseUrl();
export const GITHUB_REPO = getGithubRepo();

function getDataStorageKey(type: 'army' | 'lore', name?: string) {
  if (type === 'army' && name) return `armyData:${name}`;
  if (type === 'lore') return 'loreData';
  throw new Error('Invalid type or missing name');
}
function getDataTimestampKey(type: 'army' | 'lore', name?: string) {
  if (type === 'army' && name) return `armyDataTimestamp:${name}`;
  if (type === 'lore') return 'loreDataTimestamp';
  throw new Error('Invalid type or missing name');
}

// Returns true if the app version in localStorage does not match the current version
export function needsMigration(): boolean {
  const storedVersion = localStorage.getItem('SIGDEX_VERSION');
  if (!storedVersion) return true;
  // Compare only major.minor, ignore bugfix version
  const [major, minor] = SIGDEX_VERSION.split('.');
  const [storedMajor, storedMinor] = storedVersion.split('.');
  return major !== storedMajor || minor !== storedMinor;
}

function fetchXml(url: string): Promise<Element> {
  return fetch(url)
    .then((res) => {
      if (!res.ok) {
        console.error(`Failed to fetch XML from ${url}: ${res.statusText}`);
        throw new Error(`Failed to fetch XML: ${res.statusText}`);
      }
      return res.text();
    })
    .then((xmlText) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlText, 'text/xml');
      return doc.documentElement;
    });
}

function isCacheOutOfDate(
  timestampKey: string,
  maxAgeMs: number = 7 * 24 * 60 * 60 * 1000
): boolean {
  const cachedTimestamp = localStorage.getItem(timestampKey);
  if (!cachedTimestamp) return true;
  const age = Date.now() - Number(cachedTimestamp);
  return age >= maxAgeMs;
}

/**
 * Fetches army XML data from GitHub and returns an Army instance.
 * @param armyName The name of the army (e.g. "Gloomspite Gitz - Library.cat")
 */
export async function loadArmy(armyName: string): Promise<Army> {
  if (needsMigration()) {
    clearBSData();
  }
  // Always ensure lores are loaded/cached when loading an army
  await loadLores();
  const fileName = `${armyName} - Library.cat`;
  const libraryUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(fileName)}`;
  const armyInfoUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(armyName)}.cat`;
  const storageKey = getDataStorageKey('army', armyName);
  const timestampKey = getDataTimestampKey('army', armyName);
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached && !isCacheOutOfDate(timestampKey)) {
      const obj = JSON.parse(cached);
      return Army.fromJson(obj);
    }
  } catch (e) {
    // ignore localStorage errors
  }
  const unitLibrary = await fetchXml(libraryUrl);
  if (!unitLibrary) {
    console.error(`Failed to load unit library from ${libraryUrl}`);
    throw new Error(`Failed to load unit library from ${libraryUrl}`);
  }
  const armyInfo = await fetchXml(armyInfoUrl);
  if (!armyInfo) {
    console.error(`Failed to load army info from ${armyInfoUrl}`);
    throw new Error(`Failed to load army info from ${armyInfoUrl}`);
  }
  const army = await parseArmy(unitLibrary, armyInfo);
  if (!army) {
    console.error(`Failed to parse army from ${armyInfoUrl}`);
    throw new Error(`Failed to parse army from ${armyInfoUrl}`);
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(cleanObject(army.toJSON())));
    localStorage.setItem(timestampKey, Date.now().toString());
    localStorage.setItem('SIGDEX_VERSION', SIGDEX_VERSION);
  } catch (e) {
    // ignore localStorage errors
  }
  return army;
}

export async function loadLores(): Promise<Map<string, Ability[]>> {
  const storageKey = getDataStorageKey('lore');
  const timestampKey = getDataTimestampKey('lore');
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached && !isCacheOutOfDate(timestampKey)) {
      const arr = JSON.parse(cached);
      return new Map(arr);
    }
  } catch (e) {
    // ignore localStorage errors
  }
  const loresUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/Lores.cat`;
  const loresXml = await fetchXml(loresUrl);
  if (!loresXml) {
    console.error(`Failed to load lores from ${loresUrl}`);
    throw new Error(`Failed to load lores from ${loresUrl}`);
  }
  const lores = parseLores(loresXml);
  try {
    localStorage.setItem(storageKey, JSON.stringify(Array.from(lores.entries())));
    localStorage.setItem(timestampKey, Date.now().toString());
    localStorage.setItem('SIGDEX_VERSION', SIGDEX_VERSION);
  } catch (e) {
    // ignore localStorage errors
  }
  return lores;
}

export function clearBSData() {
  Object.keys(localStorage)
    .filter(
      (k) =>
        k.startsWith('armyData:') ||
        k.startsWith('armyDataTimestamp:') ||
        k === 'loreData' ||
        k === 'loreDataTimestamp'
    )
    .forEach((k) => localStorage.removeItem(k));
}

export function saveGithubBaseUrl(url: string) {
  localStorage.setItem('GITHUB_BASE_URL', url);
}

export function saveGithubRepo(repo: string) {
  localStorage.setItem('GITHUB_REPO', repo);
}

export const armyList = [
  'Beasts of Chaos',
  'Blades of Khorne',
  'Bonesplitterz',
  'Cities of Sigmar',
  'Daughters of Khaine',
  'Disciples of Tzeentch',
  'Flesh-eater Courts',
  'Fyreslayers',
  'Gloomspite Gitz',
  'Hedonites of Slaanesh',
  'Idoneth Deepkin',
  'Ironjawz',
  'Kharadron Overlords',
  'Kruelboyz',
  'Lumineth Realm-lords',
  'Maggotkin of Nurgle',
  'Nighthaunt',
  'Ogor Mawtribes',
  'Ossiarch Bonereapers',
  'Seraphon',
  'Skaven',
  'Slaves to Darkness',
  'Sons of Behemat',
  'Soulblight Gravelords',
  'Stormcast Eternals',
  'Sylvaneth',
];

// Mock unit data for development/demo
export const MOCK_UNIT = {
  name: 'Skragrott the Loonking',
  stats: { move: '5"', health: 5, save: '4+', control: 2 },
  melee_weapons: [
    {
      name: 'Moon-slicer',
      abilities: [],
      attacks: '5',
      hit: '4+',
      wound: '4+',
      rend: '1',
      damage: 'D3',
    },
  ],
  ranged_weapons: [
    {
      name: 'Spore Lobba',
      abilities: [],
      attacks: '1',
      hit: '5+',
      wound: '3+',
      rend: '0',
      damage: 'D3',
    },
  ],
  abilities: [
    {
      timing: 'Your Hero Phase',
      color: 'yellow',
      type: 'Special',
      text: 'Roll a dice. On a 2+, pick one of the following effects...',
      keywords: [],
    },
    {
      timing: 'Reaction: Fight',
      color: 'red',
      type: 'Offensive',
      text: 'Pick a friendly non-Hero Moonclan Infantry unit...',
      keywords: ['Cool'],
    },
  ],
  keywords: ['HERO', 'MOONCLAN', 'INFANTRY'],
};
