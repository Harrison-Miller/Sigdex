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

export class Stats implements IStats {
  move: string;
  health: string;
  save: string;
  control: string;
  banishment: string;
  ward: string;

  constructor(data?: Partial<IStats>) {
    this.move = data?.move ?? '';
    this.health = data?.health ?? '';
    this.save = data?.save ?? '';
    this.control = data?.control ?? '';
    this.banishment = data?.banishment ?? '';
    this.ward = data?.ward ?? '';
  }
}
