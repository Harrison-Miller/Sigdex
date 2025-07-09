import { type IBattleTacticCard, BattleTacticCard } from '../models/game';
import type { ILore } from '../models/lore';
import { findFirstByTagAndAttrs, mapTextNodesByName } from '../util';
import { parseAbility } from './parseAbility';
import { parsePoints } from './parseCommon';

export function parseBattleTacticCards(root: any): IBattleTacticCard[] {
  const battleTacticCards: IBattleTacticCard[] = [];

  const cardGroupNode = findFirstByTagAndAttrs(root, 'selectionEntryGroup', {
    name: 'Battle Tactic Cards',
  });

  const cardNodes =
    cardGroupNode?.selectionEntries?.selectionEntry?.filter(
      (entry: any) => entry['@_type'] === 'upgrade'
    ) || [];

  cardNodes.forEach((cardNode: any) => {
    const characteristics = mapTextNodesByName(
      cardNode?.profiles?.profile?.[0]?.characteristics,
      'characteristic'
    );
    const card: Partial<IBattleTacticCard> = {
      name: cardNode['@_name'],
      text: characteristics.get('Card'),
      affray: characteristics.get('Affray'),
      strike: characteristics.get('Strike'),
      domination: characteristics.get('Domination'),
    };
    battleTacticCards.push(new BattleTacticCard(card));
  });

  return battleTacticCards;
}

export function parseLores(root: any): Map<string, ILore> {
  const loreNodes = root?.sharedSelectionEntryGroups?.selectionEntryGroup || [];
  const loresMap = new Map<string, ILore>();
  loreNodes.forEach((loreNode: any) => {
    const name = loreNode['@_name'] || '';
    const points = parsePoints(loreNode);

    const abilities =
      loreNode.selectionEntries?.selectionEntry?.map((entry: any) => {
        return parseAbility(entry?.profiles?.profile?.[0]);
      }) || [];

    loresMap.set(name, { name, points, abilities });
  });

  return loresMap;
}
