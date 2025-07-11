import { ListUnit, type IListUnit } from './unit';

export interface IListRegiment {
  leader: IListUnit;
  units: IListUnit[];
}

export class ListRegiment implements IListRegiment {
  leader: IListUnit;
  units: IListUnit[];

  constructor(data?: Partial<IListRegiment>) {
    this.leader = data?.leader ?? new ListUnit({ name: '' });
    this.units = data?.units ?? [];
  }
}
