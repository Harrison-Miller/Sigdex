import { parseUnits } from './parser';
import type { Unit } from './UnitData';

export const GITHUB_BASE_URL = "https://raw.githubusercontent.com";
export const GITHUB_REPO = "BSData/age-of-sigmar-4th";

export class Army {
  units: Unit[];
  constructor(units: Unit[]) {
    this.units = units;
  }
}

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
  const url = `${GITHUB_BASE_URL}/${GITHUB_REPO}/refs/heads/main/${encodeURIComponent(fileName)}`;
  const storageKey = getArmyStorageKey(armyName);
  const timestampKey = getArmyTimestampKey(armyName);
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  try {
    const cached = localStorage.getItem(storageKey);
    const cachedTimestamp = localStorage.getItem(timestampKey);
    if (cached && cachedTimestamp) {
      const age = Date.now() - Number(cachedTimestamp);
      if (age < weekMs) {
        const units = JSON.parse(cached);
        return new Army(units);
      }
    }
  } catch (e) {
    // ignore localStorage errors
  }
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch army data: ${response.statusText}`);
  const xml = await response.text();
  const units = parseUnits(xml);
  try {
    localStorage.setItem(storageKey, JSON.stringify(units));
    localStorage.setItem(timestampKey, Date.now().toString());
  } catch (e) {
    // ignore localStorage errors
  }
  return new Army(units);
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
