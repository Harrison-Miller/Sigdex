import type { List } from '../list/models/list';
import type { Game } from '../parser/models/game';
import { aorChecks } from './checks/aor';
import { basicChecks } from './checks/basic';
import { regimentOptionsChecks } from './checks/regimentOptions';
import { sanityChecks } from './checks/sanity';
import { sogChecks } from './checks/sog';
import { unitConfigurationChecks } from './checks/unitConfiguration';
import type { ListValidator } from './validator';

export const baseValidators: ListValidator[] = [
  ...sanityChecks,
  ...basicChecks,
  ...unitConfigurationChecks,
  ...regimentOptionsChecks,
  ...sogChecks,
  ...aorChecks,
];

function getValidatorsForList(_: List): ListValidator[] {
  const validators = [...baseValidators];
  // Add any list-specific validators here
  return validators;
}

export function validateList(list: List, game: Game): string[] {
  return getValidatorsForList(list).flatMap((validator) => validator(list, game));
}
