import { ListUnit } from './unit';

export interface IListRegiment {
  leader: ListUnit;
  units: ListUnit[];
}

export class ListRegiment implements IListRegiment {
  leader: ListUnit;
  units: ListUnit[];

  constructor(data?: Partial<IListRegiment>) {
    this.leader = data?.leader ?? new ListUnit({ name: '' });
    this.units = data?.units ?? [];
  }
}
