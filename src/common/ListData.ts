export interface List {
  name: string;
  id: string;
  setup: boolean; // true if the list is fully set up
  faction: string;
  formation: string;
  regiments: ListRegiment[];

  faction_terrain?: string;
  spell_lore?: string;
  prayer_lore?: string;
  manifestation_lore?: string;

  auxiallary_units?: ListUnit[];
}

export interface ListRegiment {
  leader: ListUnit;
  units: ListUnit[];
}

export interface ListUnit {
  name: string;
  general?: boolean;

  heroic_trait?: string;
  artifact?: string;

  reinforced?: boolean;

  weapon_options?: Map<string, ListUnitWeaponOption[]>;

  // TODO: other enhancements
}

export interface ListUnitWeaponOption {
  name: string;
  count?: number;
}

export const POINTS_CAP = 2000;
