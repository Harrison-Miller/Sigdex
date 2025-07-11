import type { Army } from '../../parser/models/army';
import { ListRegiment } from './regiment';
import type { ListUnit } from './unit';

export interface IList {
  name: string;
  id: string;
  faction: string;
  formation: string;
  regiments: ListRegiment[];

  factionTerrain: string;
  spellLore: string;
  prayerLore: string;
  manifestationLore: string;

  auxiliaryUnits: ListUnit[];

  battleTacticCard1: string;
  battleTacticCard2: string;

  pointsCap: number; // usually 2000
}

export class List implements IList {
  name: string;
  id: string;
  faction: string;
  formation: string;
  regiments: ListRegiment[];

  factionTerrain: string;
  spellLore: string;
  prayerLore: string;
  manifestationLore: string;

  auxiliaryUnits: ListUnit[];

  battleTacticCard1: string;
  battleTacticCard2: string;

  pointsCap: number; // usually 2000

  constructor(data?: Partial<IList>) {
    this.name = data?.name ?? '';
    this.id = data?.id ?? '';
    this.faction = data?.faction ?? '';
    this.formation = data?.formation ?? '';
    // create with a default empty regiment if not provided so the UI has something
    this.regiments = data?.regiments ?? [new ListRegiment()];
    this.factionTerrain = data?.factionTerrain ?? '';
    this.spellLore = data?.spellLore ?? '';
    this.prayerLore = data?.prayerLore ?? '';
    this.manifestationLore = data?.manifestationLore ?? '';
    this.auxiliaryUnits = data?.auxiliaryUnits ?? [];
    // you can
    this.battleTacticCard1 = data?.battleTacticCard1 ?? '';
    this.battleTacticCard2 = data?.battleTacticCard2 ?? '';
    this.pointsCap = data?.pointsCap ?? 2000; // default to 2000
  }

  allUnits(): ListUnit[] {
    const units: ListUnit[] = [];
    for (const regiment of this.regiments) {
      units.push(regiment.leader);
      units.push(...regiment.units);
    }
    units.push(...this.auxiliaryUnits);
    return units as ListUnit[];
  }
}

export function setDefaultArmyOptions(data: Partial<IList>, army: Army): Partial<IList> {
  if (!data.formation && army.formations.size > 0) {
    data.formation = Array.from(army.formations.keys())[0];
  }

  // Faction Terrain (first free/0pt terrain)
  if (!data.factionTerrain && army.unitList.has('FACTION TERRAIN')) {
    const terrains = army.unitList.get('FACTION TERRAIN') || [];
    const freeTerrain = terrains.find((u) => u.points === 0);
    if (freeTerrain) {
      data.factionTerrain = freeTerrain.name;
    }
  }

  // Spell Lore
  if (!data.spellLore && army.spellLores && army.spellLores.size > 0) {
    const freeSpellLore = Array.from(army.spellLores.values()).find((l) => l.points === 0);
    if (freeSpellLore) {
      data.spellLore = freeSpellLore.name;
    }
  }

  // Prayer Lore
  if (!data.prayerLore && army.prayerLores && army.prayerLores.size > 0) {
    const freePrayerLore = Array.from(army.prayerLores.values()).find((l) => l.points === 0);
    if (freePrayerLore) {
      data.prayerLore = freePrayerLore.name;
    }
  }

  // Manifestation Lore
  if (!data.manifestationLore && army.manifestationLores && army.manifestationLores.size > 0) {
    const freeManifestationLore = Array.from(army.manifestationLores.values()).find(
      (l) => l.points === 0
    );
    if (freeManifestationLore) {
      data.manifestationLore = freeManifestationLore.name;
    }
  }

  return data;
}
