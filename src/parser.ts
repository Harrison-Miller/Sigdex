// parser.ts
// XML parser for converting XML data to Unit classes
import type { Unit } from './UnitData';
import type { Ability } from './CommonData';
import { determineUnitCategory } from './UnitData';
import { Army } from './ArmyData';
import {
  findFirstByTagAndAttr,
  findAllByTagAndAttr,
  findAllByTagAndAttrEndsWith,
  findAllByTag
} from './domUtils';
import { DOMParser as XmldomDOMParser } from 'xmldom';
import { parsePoints } from './parsePoints';

// Add jsdom support for DOMParser in Vitest/node
declare const global: any;
if (typeof window === 'undefined' && typeof global.DOMParser === 'undefined') {
  global.DOMParser = XmldomDOMParser;
}

// --- Parse stats ---
function parseStats(root: Element): any {
  let statsProfile = findFirstByTagAndAttr(root, 'profile', 'typeName', 'Unit');
  if (!statsProfile) {
    const profiles = findAllByTag(root, 'profile');
    if (profiles.length > 0) statsProfile = profiles[0];
  }
  const stats: any = {};
  if (statsProfile) {
    findAllByTag(statsProfile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (!name || !c.textContent) return;
      if (name === 'move') stats.move = c.textContent;
      if (name === 'health') stats.health = Number(c.textContent);
      if (name === 'save') stats.save = c.textContent;
      if (name === 'control') {
        const val = c.textContent.trim();
        stats.control = val === '-' ? '-' : val;
      }
      if (name === 'banishment') {
        const val = c.textContent.trim();
        stats.banishment = val === '-' ? '-' : val;
      }
    });
  }
  return stats;
}

// --- Parse abilities ---
function parseAbilities(root: Element): Ability[] {
  const abilities: Ability[] = [];
  findAllByTagAndAttr(root, 'profile', 'typeName', 'Ability').forEach((profile) => {
    const ability: Ability = {
      name: profile.getAttribute('name') || '',
      timing: '',
      color: '',
      type: '',
      text: '',
      keywords: [],
    };
    findAllByTag(profile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'timing') ability.timing = c.textContent || '';
      if (name === 'effect') ability.text = c.textContent || '';
      if (name === 'declare') ability.declare = c.textContent || '';
      if (name === 'casting value') ability.castingValue = c.textContent || '';
      if (name === 'cost') ability.cost = c.textContent || '';
      if (name === 'keywords' && c.textContent) ability.keywords = c.textContent.split(',').map((k: string) => k.trim());
    });
    findAllByTag(profile, 'attribute').forEach((a) => {
      const name = a.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'color') ability.color = a.textContent || '';
      if (name === 'type') ability.type = a.textContent || '';
    });
    if (!ability.timing && (profile.getAttribute('typeName') || '').toLowerCase().includes('passive')) {
      ability.timing = 'Passive';
    }
    abilities.push(ability);
  });
  return abilities;
}

// --- Parse weapons ---
function parseWeapons(root: Element): { melee_weapons: any[]; ranged_weapons: any[] } {
  const melee_weapons: any[] = [];
  const ranged_weapons: any[] = [];
  findAllByTagAndAttrEndsWith(root, 'profile', 'typeName', 'Weapon').forEach((profile) => {
    const weapon: any = {
      name: profile.getAttribute('name') || '',
      abilities: [],
      attacks: '',
      hit: '',
      wound: '',
      rend: '',
      damage: '',
    };
    findAllByTag(profile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'atk' || name === 'attacks') weapon.attacks = c.textContent || '';
      if (name === 'hit') weapon.hit = c.textContent || '';
      if (name === 'wnd' || name === 'wound') weapon.wound = c.textContent || '';
      if (name === 'rnd' || name === 'rend') weapon.rend = c.textContent || '';
      if (name === 'dmg' || name === 'damage') weapon.damage = c.textContent || '';
      if (name === 'ability' && c.textContent && c.textContent !== '-') weapon.abilities.push(c.textContent);
    });
    if ((profile.getAttribute('typeName') || '').toLowerCase().includes('melee')) {
      melee_weapons.push(weapon);
    } else {
      ranged_weapons.push(weapon);
    }
  });
  return { melee_weapons, ranged_weapons };
}

// --- Parse keywords ---
function parseKeywords(root: Element): string[] {
  const keywords: string[] = [];
  findAllByTag(root, 'categoryLink').forEach((cat) => {
    const name = cat.getAttribute('name');
    if (name) keywords.push(name);
  });
  return keywords;
}

// New: parseArmy fetches both .cat and - Library.cat, parses points, then units with points
export async function parseArmy(catUrl: string, libraryCatUrl: string): Promise<Army> {
  // Fetch the army info file (cat)
  const catRes = await fetch(catUrl);
  if (!catRes.ok) throw new Error(`Failed to fetch army info: ${catRes.statusText}`);
  const catXml = await catRes.text();
  // Parse points from army info
  const pointsMap = parsePoints(catXml);

  // Fetch the army library file
  const libRes = await fetch(libraryCatUrl);
  if (!libRes.ok) throw new Error(`Failed to fetch army library: ${libRes.statusText}`);
  const libXml = await libRes.text();

  // Call parseUnits with pointsMap (to be added as a parameter)
  const units = parseUnits(libXml, pointsMap);
  return new Army(units);
}

export function parseUnit(xml: string | Element): Unit {
  let root: Element;
  if (typeof xml === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    root = doc.documentElement;
  } else {
    root = xml;
  }
  const stats = parseStats(root);
  const abilities = parseAbilities(root);
  const { melee_weapons, ranged_weapons } = parseWeapons(root);
  const keywords = parseKeywords(root);
  const unit: Unit = {
    name: root.getAttribute('name') || '',
    stats,
    melee_weapons,
    ranged_weapons,
    abilities,
    keywords,
  };
  unit.category = determineUnitCategory(unit);
  return unit;
}

// Update parseUnits to accept pointsMap and set unit.points
export function parseUnits(xml: string | Element, pointsMap?: Map<string, number>): Unit[] {
  let root: Element;
  if (typeof xml === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    root = doc.documentElement;
  } else {
    root = xml;
  }
  const units: Unit[] = [];
  function findUnitEntries(node: Element) {
    if (node.nodeType === 1 && node.tagName === 'selectionEntry' && node.getAttribute('type') === 'unit') {
      const unit = parseUnit(node);
      if (pointsMap) {
        const pts = pointsMap.get(unit.name);
        if (typeof pts === 'number') {
          unit.points = pts;
        } else {
          unit.points = 0;
          // eslint-disable-next-line no-console
          console.warn(`No points found for unit: ${unit.name}`);
        }
      }
      if (unit.category !== 'Other' && !unit.keywords.map(k => k.toLowerCase()).includes('legends')) {
        units.push(unit);
      }
    }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        findUnitEntries(node.childNodes[i] as Element);
      }
    }
  }
  findUnitEntries(root);
  return units;
}

export { parseStats, parseAbilities, parseWeapons, parseKeywords };
