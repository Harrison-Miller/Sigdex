import { parseArmy } from './parser';
import type { Army } from './ArmyData';

function getGithubBaseUrl() {
  return localStorage.getItem('GITHUB_BASE_URL') || "https://raw.githubusercontent.com";
}
function getGithubRepo() {
  return localStorage.getItem('GITHUB_REPO') || "BSData/age-of-sigmar-4th";
}
export const GITHUB_BASE_URL = getGithubBaseUrl();
export const GITHUB_REPO = getGithubRepo();

function getArmyStorageKey(armyName: string) {
  return `armyData:${armyName}`;
}
function getArmyTimestampKey(armyName: string) {
  return `armyDataTimestamp:${armyName}`;
}

/**
 * Fetches army XML data from GitHub and returns an Army instance.
 * @param armyName The name of the army (e.g. "Gloomspite Gitz - Library.cat")
 */
export async function loadArmy(armyName: string): Promise<Army> {
  const fileName = `${armyName} - Library.cat`;
  const libraryUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(fileName)}`;
  const armyInfoUrl = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(armyName)}.cat`;
  const storageKey = getArmyStorageKey(armyName);
  const timestampKey = getArmyTimestampKey(armyName);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  try {
    const cached = localStorage.getItem(storageKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    if (cached && cachedTimestamp) {
      const age = Date.now() - Number(cachedTimestamp);
      if (age < weekMs) {
        console.log(`Using cached army: ${armyName}`);
        const army = JSON.parse(cached);
        return army
      }
    }
  } catch (e) {
    // ignore localStorage errors
  }

  console.log(`Loading army: ${armyName}`);
  console.log(`Fetching army info from: ${armyInfoUrl}`);
  console.log(`Fetching library from: ${libraryUrl}`);
  const army = await parseArmy(armyInfoUrl, libraryUrl);
  try {
    localStorage.setItem(storageKey, JSON.stringify(army));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (e) {
    // ignore localStorage errors
  }
  return army;
}

export function clearBSData() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('armyData:') || k.startsWith('armyDataTimestamp:'))
    .forEach(k => localStorage.removeItem(k));
}

export function saveGithubBaseUrl(url: string) {
  localStorage.setItem('GITHUB_BASE_URL', url);
}

export function saveGithubRepo(repo: string) {
  localStorage.setItem('GITHUB_REPO', repo);
}

export const armyList = [
  "Beasts of Chaos",
  "Blades of Khorne",
  "Bonesplitterz",
  "Cities of Sigmar",
  "Daughters of Khaine",
  "Disciples of Tzeentch",
  "Flesh-eater Courts",
  "Fyreslayers",
  "Gloomspite Gitz",
  "Hedonites of Slaanesh",
  "Idoneth Deepkin",
  "Ironjawz",
  "Kharadron Overlords",
  "Kruelboyz",
  "Lumineth Realm-lords",
  "Maggotkin of Nurgle",
  "Nighthaunt",
  "Ogor Mawtribes",
  "Ossiarch Bonereapers",
  "Seraphon",
  "Skaven",
  "Slaves to Darkness",
  "Sons of Behemat",
  "Soulblight Gravelords",
  "Stormcast Eternals",
  "Sylvaneth"
];

// Mock unit data for development/demo
export const MOCK_UNIT = {
  name: 'Skragrott the Loonking',
  stats: { move: '5"', health: 5, save: '4+', control: 2 },
  melee_weapons: [
    { name: 'Moon-slicer', abilities: [], attacks: '5', hit: '4+', wound: '4+', rend: '1', damage: 'D3' },
  ],
  ranged_weapons: [
    { name: 'Spore Lobba', abilities: [], attacks: '1', hit: '5+', wound: '3+', rend: '0', damage: 'D3' },
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
