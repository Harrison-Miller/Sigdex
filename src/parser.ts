// parser.ts
// XML parser for converting XML data to Unit classes
import type { Unit } from './UnitData';
import type { Ability } from './CommonData';
import { determineUnitCategory } from './UnitData';

// Add jsdom support for DOMParser in Vitest/node
declare const global: any;
if (typeof window === 'undefined' && typeof global.DOMParser === 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { DOMParser } = require('xmldom');
  global.DOMParser = DOMParser;
}

// Helper to recursively find the first element by tag and attribute value
function findElementByTagAndAttr(root: any, tag: string, attr: string, value: string): any {
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr) === value) return root;
  if (!root.childNodes) return null;
  for (let i = 0; i < root.childNodes.length; i++) {
    const found = findElementByTagAndAttr(root.childNodes[i], tag, attr, value);
    if (found) return found;
  }
  return null;
}

// Helper to get all elements by tag and attribute value
function findAllElementsByTagAndAttr(root: any, tag: string, attr: string, value: string): any[] {
  let results: any[] = [];
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr)?.startsWith(value)) results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(findAllElementsByTagAndAttr(root.childNodes[i], tag, attr, value));
  }
  return results;
}

// Helper to get all elements by tag and attribute value endsWith
function findAllElementsByTagAndAttrEndsWith(root: any, tag: string, attr: string, value: string): any[] {
  let results: any[] = [];
  if (root.nodeType === 1 && root.tagName === tag && root.getAttribute(attr)?.endsWith(value)) results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(findAllElementsByTagAndAttrEndsWith(root.childNodes[i], tag, attr, value));
  }
  return results;
}

// Helper to get all elements by tag
function findAllElementsByTag(root: any, tag: string): any[] {
  let results: any[] = [];
  if (root.nodeType === 1 && root.tagName === tag) results.push(root);
  if (!root.childNodes) return results;
  for (let i = 0; i < root.childNodes.length; i++) {
    results = results.concat(findAllElementsByTag(root.childNodes[i], tag));
  }
  return results;
}

export function parseUnit(xml: string | Element): Unit {
  let root: any;
  if (typeof xml === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    root = doc.documentElement;
  } else {
    root = xml;
  }

  // Parse stats
  const stats: any = {};
  // Try to find a profile with typeName 'Unit', otherwise fallback to first profile
  let statsProfile = findElementByTagAndAttr(root, 'profile', 'typeName', 'Unit');
  if (!statsProfile) {
    // fallback: use first <profile> if present
    const profiles = findAllElementsByTag(root, 'profile');
    if (profiles.length > 0) statsProfile = profiles[0];
  }
  if (statsProfile) {
    findAllElementsByTag(statsProfile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (name && c.textContent) {
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
      }
    });
  }

  // Parse abilities
  const abilities: Ability[] = [];
  findAllElementsByTagAndAttr(root, 'profile', 'typeName', 'Ability').forEach((profile) => {
    const ability: Ability = {
      name: profile.getAttribute('name') || '',
      timing: '',
      color: '',
      type: '',
      text: '',
      keywords: [],
    };
    findAllElementsByTag(profile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'timing') ability.timing = c.textContent || '';
      if (name === 'effect') ability.text = c.textContent || '';
      if (name === 'declare') ability.declare = c.textContent || '';
      if (name === 'casting value') ability.castingValue = c.textContent || '';
      if (name === 'cost') ability.cost = c.textContent || '';
      if (name === 'keywords' && c.textContent) ability.keywords = c.textContent.split(',').map((k: string) => k.trim());
    });
    findAllElementsByTag(profile, 'attribute').forEach((a) => {
      const name = a.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'color') ability.color = a.textContent || '';
      if (name === 'type') ability.type = a.textContent || '';
    });
    // If timing is empty and typeName contains 'passive', set timing to 'Passive'
    if (!ability.timing && (profile.getAttribute('typeName') || '').toLowerCase().includes('passive')) {
      ability.timing = 'Passive';
    }
    abilities.push(ability);
  });

  // Parse weapons
  const melee_weapons: any[] = [];
  const ranged_weapons: any[] = [];
  findAllElementsByTagAndAttrEndsWith(root, 'profile', 'typeName', 'Weapon').forEach((profile) => {
    const weapon: any = {
      name: profile.getAttribute('name') || '',
      abilities: [],
      attacks: '',
      hit: '',
      wound: '',
      rend: '',
      damage: '',
    };
    findAllElementsByTag(profile, 'characteristic').forEach((c) => {
      const name = c.getAttribute('name')?.toLowerCase();
      if (!name) return;
      if (name === 'atk' || name === 'attacks') weapon.attacks = c.textContent || '';
      if (name === 'hit' ) weapon.hit = c.textContent || '';
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

  // Parse keywords from categoryLinks
  const keywords: string[] = [];
  findAllElementsByTag(root, 'categoryLink').forEach((cat) => {
    const name = cat.getAttribute('name');
    if (name) keywords.push(name);
  });

  // Compose unit
  const unit: Unit = {
    name: root.getAttribute('name') || '',
    stats,
    melee_weapons,
    ranged_weapons,
    abilities,
    keywords,
    // points and unit_size can be added if present in XML
  };
  unit.category = determineUnitCategory(unit);
  return unit;
}

export function parseUnits(xml: string | Element): Unit[] {
  let root: any;
  if (typeof xml === 'string') {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    root = doc.documentElement;
  } else {
    root = xml;
  }
  // Find all <selectionEntry type="unit">
  const units: Unit[] = [];
  function findUnitEntries(node: any) {
    if (node.nodeType === 1 && node.tagName === 'selectionEntry' && node.getAttribute('type') === 'unit') {
      const unit = parseUnit(node);
      // Exclude units with category 'Other' or with 'Legends' keyword
      if (unit.category !== 'Other' && !unit.keywords.map(k => k.toLowerCase()).includes('legends')) {
        units.push(unit);
      }
    }
    if (node.childNodes) {
      for (let i = 0; i < node.childNodes.length; i++) {
        findUnitEntries(node.childNodes[i]);
      }
    }
  }
  findUnitEntries(root);
  return units;
}
