// stats describe the core stats of a unit
export interface IStats {
  move: string;
  health: string;
  save: string;
  // control will only be used for regular units
  control: string;
  // banishment is only used for Manifestations
  banishment: string;
  // this is not a true stat, it is computed via a keyword on a unit
  ward: string;
}
