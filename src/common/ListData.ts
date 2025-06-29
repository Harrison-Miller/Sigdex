export interface List {
  name: string;
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

  // TODO: weapon options, other enhancements
}
