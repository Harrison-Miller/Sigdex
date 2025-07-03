import type { BattleTacticCard } from '../common/BattleTacticsData';
import { findAllByTagAndAttr, findFirstByTagAndAttr } from './utils';

export function parseBattleTactics(root: Element): BattleTacticCard[] {
  const cards: BattleTacticCard[] = [];

  // <selectionEntryGroup name="Battle Tactic Cards"
  const cardsGroup = findFirstByTagAndAttr(
    root,
    'selectionEntryGroup',
    'name',
    'Battle Tactic Cards'
  );
  if (!cardsGroup) return cards;

  // <selectionEntry type="upgrade" import="true" name="Master the Paths"
  const cardEntries = findAllByTagAndAttr(cardsGroup, 'selectionEntry', 'type', 'upgrade');
  for (const entry of cardEntries) {
    const name = entry.getAttribute('name');
    if (!name) continue;

    // <profile name="Master the Paths" typeId="abf8-a239-9e66-54c1" typeName="Battle Tactic Card"
    const profile = findFirstByTagAndAttr(entry, 'profile', 'typeName', 'Battle Tactic Card');
    if (!profile) continue;

    let card = {
      name: name,
      text: '',
      affray: '',
      strike: '',
      domination: '',
    };

    card.text =
      findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Card')?.textContent?.trim() || '';
    card.affray =
      findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Affray')?.textContent?.trim() || '';
    card.strike =
      findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Strike')?.textContent?.trim() || '';
    card.domination =
      findFirstByTagAndAttr(profile, 'characteristic', 'name', 'Domination')?.textContent?.trim() ||
      '';

    cards.push(card);
  }

  return cards;
}
