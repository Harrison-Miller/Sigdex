import type { Stats } from '../common/UnitData';
import { findFirstByTagAndAttr } from './utils';

export function parseStats(root: Element): Stats {
  const stats: Stats = {
    move: '',
    health: 0,
    save: '',
    control: undefined,
    banishment: undefined,
  };

  const profile =
    findFirstByTagAndAttr(root, 'profile', 'typeName', 'Unit') ||
    findFirstByTagAndAttr(root, 'profile', 'typeName', 'Manifestation');

  if (!profile) {
    return stats; // No profile found, return empty stats
  }

  stats.move = findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Move')?.textContent || '';
  stats.health =
    Number(findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Health')?.textContent) || 0;
  stats.save = findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Save')?.textContent || '';
  stats.control =
    findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Control')?.textContent?.trim() ||
    undefined;
  stats.banishment =
    findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Banishment')?.textContent?.trim() ||
    undefined;

  return stats;
}
