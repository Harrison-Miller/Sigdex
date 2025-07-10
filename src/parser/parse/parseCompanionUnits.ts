import { findFirstByTagAndAttrs } from '../util';
import { parsePoints, type ICategory } from './parseCommon';

export function parseCompanionUnitLeader(
  bpNode: any,
  bpCategories: Map<string, ICategory>
): string {
  const points = parsePoints(bpNode);

  // companion units don't have points cost
  if (points === 0) {
    const unitConstraint = findFirstByTagAndAttrs(bpNode, 'constraint', {
      type: 'min',
      value: '-1',
      scope: 'force',
    });

    const constraintId = unitConstraint?.['@_id'];

    const companionMod = findFirstByTagAndAttrs(bpNode, 'modifier', {
      type: 'set',
      value: '1',
      field: constraintId,
    });

    const companionCondition = findFirstByTagAndAttrs(companionMod, 'condition', {
      type: 'atLeast',
      value: '1',
      scope: 'force',
    });

    if (companionCondition) {
      const childId = companionCondition?.['@_childId'];
      const companionUnitLeader = bpCategories.get(childId);
      if (companionUnitLeader) {
        const companionLeaderName = companionUnitLeader.name;
        if (companionLeaderName) {
          return companionLeaderName;
        }
      }
    } else {
      const companionConditionGroup = findFirstByTagAndAttrs(companionMod, 'localConditionGroup', {
        type: 'atLeast',
        value: '1',
        scope: 'force',
      });

      const childConditions = companionConditionGroup?.conditions?.condition || [];
      for (const condition of childConditions) {
        const childId = condition['@_childId'];
        const companionUnitLeader = bpCategories.get(childId);
        if (companionUnitLeader && !companionUnitLeader.name.toLowerCase().includes('regiment')) {
          const companionLeaderName = companionUnitLeader.name;
          if (companionLeaderName) {
            return companionLeaderName;
          }
        }
      }
    }
  }

  return ''; // no companion unit leader found
}
