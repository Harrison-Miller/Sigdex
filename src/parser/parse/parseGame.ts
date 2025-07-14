import { type IBattleTacticCard, BattleTacticCard } from '../models/game';
import { Lore } from '../models/lore';
import { findFirstByTagAndAttrs, mapTextNodesByName } from '../util';
import { parseAbility } from './parseAbility';
import { parsePoints } from './parseCommon';

export function parseBattleTacticCards(root: any): BattleTacticCard[] {
  const battleTacticCards: BattleTacticCard[] = [];

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

export function parseLores(root: any): Map<string, Lore> {
  const loreNodes = root?.sharedSelectionEntryGroups?.selectionEntryGroup || [];
  const loresMap = new Map<string, Lore>();
  loreNodes.forEach((loreNode: any) => {
    const name = loreNode['@_name'] || '';
    const points = parsePoints(loreNode);

    const spellEntires = loreNode.entryLinks?.entryLink || [];
    const spellIdToTargtetIds = new Map<string, string>();
    spellEntires.forEach((entry: any) => {
      const targetId = entry['@_targetId'];
      // <condition type="lessThan" value="1" field="selections" scope="parent" childId="0248-39ea-8a5e-7b1c" 
      const condition = findFirstByTagAndAttrs(entry, 'condition', {
        type: 'lessThan',
        field: 'selections',
      });
      const spellId = condition?.['@_childId'] || '';


      if (targetId && spellId) {
        spellIdToTargtetIds.set(spellId, targetId);
      }
    });

    const abilities =
      loreNode.selectionEntries?.selectionEntry?.map((entry: any) => {
        const ability = parseAbility(entry?.profiles?.profile?.[0]);
        const id = entry['@_id'] || '';
        if (ability.name.includes('Summon ')) {
          const targetId = spellIdToTargtetIds.get(id);
          if (targetId) {
            ability.summonedUnit = targetId;
          }
        }
        return ability;
      }) || [];


    loresMap.set(name, new Lore({ name, points, abilities }));
  });

  return loresMap;
}
