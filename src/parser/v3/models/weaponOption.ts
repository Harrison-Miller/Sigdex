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
