export interface IWeaponOption {
  name: string;
  // default weapon will always have a max of 0. All models in the group have this weapon unless replaced.
  // optional weapon will always have a max set and may have replaces set
  // grouped weapon will always have group and max set. The max will be equal to the number of models in the group.
  type: 'default' | 'optional' | 'grouped';
  max: number;
  replaces: string[];
  group: string;
}

export class WeaponOption implements IWeaponOption {
  name: string;
  type: 'default' | 'optional' | 'grouped';
  max: number;
  replaces: string[];
  group: string;

  constructor(data?: Partial<IWeaponOption>) {
    this.name = data?.name ?? '';
    this.max = data?.max ?? 0;
    this.replaces = data?.replaces ?? [];
    this.group = data?.group ?? '';

    if (this.group) {
      this.type = 'grouped';
    } else if (this.max > 0) {
      this.type = 'optional';
    } else {
      this.type = 'default';
    }
  }
}
