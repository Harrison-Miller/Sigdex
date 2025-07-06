export interface IAbility {
  timing: string;
  color: string;
  type: string;
  effect: string;
  keywords: string[];
  name: string;
  declare: string;
  // only present for spells
  castingValue: string;
  // only present for prayers
  chantingValue: string;
  commandPoints: string;
  points: string;

  // the name of the manifestation summoned by this spell if it is a summoning spell
  summonable: string;
}
