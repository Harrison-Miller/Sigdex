import type { List } from '../list/models/list';
import type { Game } from '../parser/models/game';
import { aorChecks } from './checks/aor';
import { basicChecks } from './checks/basic';
import { highlanderChecks } from './checks/highlander';
import { regimentOptionsChecks } from './checks/regimentOptions';
import { rorChecks } from './checks/ror';
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
  ...rorChecks,
];

function getValidatorsForList(list: List): ListValidator[] {
  if (list.validator === 'disabled') {
    return [];
  }

  const validators = [...baseValidators];
  if (list.validator === 'highlander') validators.push(...highlanderChecks);
  return validators;
}

export function validateList(list: List, game: Game): string[] {
  return getValidatorsForList(list).flatMap((validator) => validator(list, game));
}
