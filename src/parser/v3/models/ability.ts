export interface IAbility {
  name: string;
  timing: string;
  color: string;
  type: string;
  effect: string;
  declare: string;
  // only present for spells
  castingValue: string;
  // only present for prayers
  chantingValue: string;
  // only present for command abilities
  commandPoints: string;

  keywords: string[];

  // the name of the manifestation summoned by this spell if it is a summoning spell
  summonedUnit: string;
}

const DEFAULT_ABILITY_COLOR = 'Gray';

export class Ability implements IAbility {
  name: string;
  // TODO: decide if it's worth making timing/color/type union types
  timing: string;
  color: string;
  type: string;
  effect: string;
  declare: string;
  castingValue: string;
  chantingValue: string;
  commandPoints: string;
  keywords: string[];
  summonedUnit: string;

  constructor(data?: Partial<IAbility>) {
    this.name = data?.name ?? '';
    this.timing = data?.timing ?? '';
    this.color = data?.color || DEFAULT_ABILITY_COLOR;
    this.type = data?.type ?? '';
    this.effect = data?.effect ?? '';
    this.declare = data?.declare ?? '';
    this.castingValue = data?.castingValue ?? '';
    this.chantingValue = data?.chantingValue ?? '';
    this.commandPoints = data?.commandPoints ?? '';
    this.keywords = data?.keywords ?? [];
    this.summonedUnit = data?.summonedUnit ?? '';

    if (this.color == 'Grey') {
      this.color = 'Gray';
    }
  }
}
