import type { Ability } from '../models/ability';
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
    const spellIdToTargtetIds = new Map<string, string[]>();
    spellEntires.forEach((entry: any) => {
      const targetId = entry['@_targetId'];
      // <condition type="lessThan" value="1" field="selections" scope="parent" childId="0248-39ea-8a5e-7b1c" 
      const condition = findFirstByTagAndAttrs(entry, 'condition', {
        type: 'lessThan',
        field: 'selections',
      });
      const spellId = condition?.['@_childId'] || '';


      if (targetId && spellId) {
        const targets = spellIdToTargtetIds.get(spellId) || [];
        targets.push(targetId);
        spellIdToTargtetIds.set(spellId, targets);
      }
    });

    const abilities =
      loreNode.selectionEntries?.selectionEntry?.map((entry: any) => {
        const ability = parseAbility(entry?.profiles?.profile?.[0]);
        const id = entry['@_id'] || '';
        if (ability.name.includes('Summon ')) {
          const targetIds = spellIdToTargtetIds.get(id);
          if (targetIds) {
            ability.summonedUnits = targetIds;
          }
        }
        return ability;
      }) || [];


    loresMap.set(name, new Lore({ name, points, abilities }));
  });

  return loresMap;
}

export function parseWeaponAbilities(root: any): Map<string, string> {
  const weaponAbilities = new Map<string, string>();
  const ruleNodes = root?.sharedRules.rule || [];
  ruleNodes.forEach((rule: any) => {
    const name = rule['@_name'] || '';
    const description = (typeof rule?.description === 'string' ? rule.description : rule?.description?.['#text']) || '';
    if (description) {
      weaponAbilities.set(name, description.trim());
    }
  });
  return weaponAbilities;
}

export function parseKeywordAbilities(root: any): Map<string, Ability> {
  const keywordAbilities = new Map<string, Ability>();
  const keywordNodes = root?.sharedProfiles?.profile || [];
  keywordNodes.forEach((keyword: any) => {
    const name = keyword['@_name'] || '';
    const ability = parseAbility(keyword);
    if (ability.name) {
      keywordAbilities.set(name, ability);
    }
  });
  return keywordAbilities;
}