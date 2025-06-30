import type { ListUnit, ListUnitWeaponOption } from '../common/ListData';

export function serializeWeaponOptions(weaponOptions?: Map<string, ListUnitWeaponOption[]>): any {
  if (!weaponOptions) return undefined;
  // Convert Map to array of [key, value] where value is array of objects
  return Array.from(weaponOptions.entries()).map(([group, arr]) => [group, arr]);
}

export function deserializeWeaponOptions(
  obj: any
): Map<string, ListUnitWeaponOption[]> | undefined {
  if (!obj) return undefined;
  // Convert array of [key, value] back to Map
  return new Map(obj);
}

export function serializeListUnit(unit: ListUnit): any {
  const { weapon_options, ...rest } = unit;
  return {
    ...rest,
    weapon_options: serializeWeaponOptions(weapon_options),
  };
}

export function deserializeListUnit(obj: any): ListUnit {
  return {
    ...obj,
    weapon_options: deserializeWeaponOptions(obj.weapon_options),
  };
}
