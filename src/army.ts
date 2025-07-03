import { parseArmy } from './parser/army';
import { Army } from './common/ArmyData';
import { SIGDEX_VERSION } from './version';
import { cleanObject } from './utils/cleanObject';
import { parseLores } from './parser/lores';
import type { Unit } from './common/UnitData';
import { DOMParser } from 'xmldom';
import type { Lore } from './common/ManifestationData';
import { parseBattleTactics } from './parser/battletactics';
import type { BattleTacticCard } from './common/BattleTacticsData';

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
  const [major, minor] = SIGDEX_VERSION.split('.').map(Number);
  const [storedMajor, storedMinor] = storedVersion.split('.').map(Number);
  if (isNaN(major) || isNaN(minor) || isNaN(storedMajor) || isNaN(storedMinor)) return true;
  // Only return true if the current version is greater than the stored version
  return major > storedMajor || (major === storedMajor && minor > storedMinor);
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
  // Also ensure universal units are loaded/cached
  await loadUniversalUnits();
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

  // get the game file
  const gameInfoUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/Age%20of%20Sigmar%204.0.gst`;
  const gameInfo = await fetchXml(gameInfoUrl);
  if (!gameInfo) {
    console.error(`Failed to load game file from ${gameInfoUrl}`);
    throw new Error(`Failed to load game file from ${gameInfoUrl}`);
  }

  // const armiesOfRenown = await listArmiesOfRenown(armyName);
  // if (armiesOfRenown.length > 0) {
  //   for (const aor of armiesOfRenown) {
  //     const aorUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(armyName)} - ${aor}.cat`;
  //     const aorXml = await fetchXml(aorUrl);
  //     if (aorXml) {
  //       const aorArmy = await parseArmy(unitLibrary, aorXml); // TODO: parsing an AoR should just keep tracking of unit names allowed and stuff that's link to the library
  //       console.log(`Loaded Army of Renown: ${aor}: `, aorArmy);
  //     } else {
  //       console.warn(`Failed to load Army of Renown XML: ${aorUrl}`);
  //     }
  //   }
  // }

  const army = await parseArmy(gameInfo, unitLibrary, armyInfo);
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

export async function loadLores(): Promise<Map<string, Lore>> {
  if (needsMigration()) {
    clearBSData();
  }

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

/**
 * Lists Armies of Renown for a given army by inspecting the GitHub repo directory using the GitHub Trees API.
 * @param armyName The name of the army (e.g. "Gloomspite Gitz")
 * @returns Promise<string[]> Array of Army of Renown names
 */
export async function listArmiesOfRenown(armyName: string): Promise<string[]> {
  // Use the GitHub Trees API to get all files in the repo
  // e.g. https://api.github.com/repos/BSData/age-of-sigmar-4th/git/trees/main?recursive=1
  const treesUrl = `https://api.github.com/repos/${GITHUB_REPO}/git/trees/main?recursive=1`;
  try {
    const res = await fetch(treesUrl);
    if (!res.ok) {
      console.error(`Failed to fetch tree from ${treesUrl}: ${res.statusText}`);
      return [];
    }
    const data = await res.json();
    const files = data.tree || [];
    const pattern = new RegExp(`^${armyName} - (.+)\\.cat$`, 'i');
    const results: string[] = [];
    for (const file of files) {
      if (file.type !== 'blob' || !file.path.endsWith('.cat')) continue;
      const filename = file.path.split('/').pop();
      if (!filename) continue;
      const match = filename.match(pattern);
      if (match) {
        const renownName = match[1];
        if (
          renownName.toLowerCase().includes('library') ||
          renownName.toLowerCase().includes('legends')
        ) {
          continue;
        }
        results.push(renownName.trim());
      }
    }
    return results;
  } catch (e) {
    console.error('Error listing armies of renown:', e);
    return [];
  }
}

/**
 * Loads universal units from the GST file and caches them in localStorage.
 * @returns Promise<Unit[]> Array of universal units
 */
export async function loadUniversalUnits(): Promise<Unit[]> {
  const storageKey = 'universalUnitsData';
  const timestampKey = 'universalUnitsDataTimestamp';
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached && !isCacheOutOfDate(timestampKey)) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore localStorage errors
  }
  const gstUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/Age%20of%20Sigmar%204.0.gst`;
  const gstXml = await fetchXml(gstUrl);
  if (!gstXml) {
    console.error(`Failed to load universal units from ${gstUrl}`);
    throw new Error(`Failed to load universal units from ${gstUrl}`);
  }
  // Use the existing parseArmy function to extract units from the GST file
  // The GST file may not have the same structure as a normal army, so you may need a custom parser if parseArmy doesn't work
  // For now, try to use parseArmy and fallback to an empty array if it fails
  let units: Unit[] = [];
  try {
    // parseArmy expects a library and an army XML, so pass gstXml for both
    const army = await parseArmy(gstXml, gstXml, gstXml);
    units = army.units || [];
  } catch (e) {
    console.error('Failed to parse universal units:', e);
    units = [];
  }
  try {
    localStorage.setItem(storageKey, JSON.stringify(units));
    localStorage.setItem(timestampKey, Date.now().toString());
    localStorage.setItem('SIGDEX_VERSION', SIGDEX_VERSION);
  } catch (e) {
    // ignore localStorage errors
  }
  return units;
}

export async function loadBattleTacticCards(): Promise<BattleTacticCard[]> {
  const storageKey = 'battleTacticCardsData';
  const timestampKey = 'battleTacticCardsDataTimestamp';
  try {
    const cached = localStorage.getItem(storageKey);
    if (cached && !isCacheOutOfDate(timestampKey)) {
      return JSON.parse(cached);
    }
  } catch (e) {
    // ignore localStorage errors
  }

  const gstUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/Age%20of%20Sigmar%204.0.gst`;
  const gstXml = await fetchXml(gstUrl);
  if (!gstXml) {
    console.error(`Failed to load battle tactic cards from ${gstUrl}`);
    throw new Error(`Failed to load battle tactic cards from ${gstUrl}`);
  }

  const cards = await parseBattleTactics(gstXml);
  if (!cards || cards.length === 0) {
    console.error(`Failed to parse battle tactic cards from ${gstXml}`);
    throw new Error(`Failed to parse battle tactic cards from ${gstXml}`);
  }

  try {
    localStorage.setItem(storageKey, JSON.stringify(cards));
    localStorage.setItem(timestampKey, Date.now().toString());
    localStorage.setItem('SIGDEX_VERSION', SIGDEX_VERSION);
  } catch (e) {
    // ignore localStorage errors
  }

  return cards;
}

export function clearBSData() {
  Object.keys(localStorage)
    .filter(
      (k) =>
        k.startsWith('armyData:') ||
        k.startsWith('armyDataTimestamp:') ||
        k === 'loreData' ||
        k === 'loreDataTimestamp' ||
        k === 'universalUnitsData' ||
        k === 'universalUnitsDataTimestamp'
    )
    .forEach((k) => localStorage.removeItem(k));
}

export function saveGithubBaseUrl(url: string) {
  localStorage.setItem('GITHUB_BASE_URL', url);
}

export function saveGithubRepo(repo: string) {
  localStorage.setItem('GITHUB_REPO', repo);
}

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
