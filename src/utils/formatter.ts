import type { ModelGroup, Unit } from '../common/UnitData';

export function formatText(text: string): string {
  if (!text) return '';
  // Add newline before every bullet (•)
  text = text.replace(/\s*•/g, '<br>•');
  // ***text*** => bullet bold with newline
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<br>• <b>$1</b>');
  // **number *text*** => bolded number - text, newline before
  text = text.replace(/\*\*(\d+) \*(.+?)\*\*\*/g, '<br><b>$1 - $2</b>');
  // **^^text^^** => bold italics
  text = text.replace(/\*\*\^\^(.+?)\^\^\*\*/g, '<b><i>$1</i></b>');
  // ^^text** => bold italics
  text = text.replace(/\^\^(.+?)\*\*/g, '<b><i>$1</i></b>');
  // **text** => bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // ^^text^^ => italics
  text = text.replace(/\^\^(.+?)\^\^/g, '<i>$1</i>');
  // *text* => italics (must be after bold rules)
  text = text.replace(/\*(?!\*)([^*]+?)\*(?!\*)/g, '<i>$1</i>');
  // Replace all newlines with <br>
  text = text.replace(/\n/g, '<br>');
  // Replace any number of sequential <br>'s (with optional whitespace between) with a single <br>
  text = text.replace(/(<br>\s*)+/g, '<br>');
  return text;
}

export function formatModelGroups(modelGroups: ModelGroup[], unit: Unit): string {
  console.log(`Formatting model groups for unit`, unit);
  console.log(`ranged weapons:`, unit.ranged_weapons);
  console.log(`melee weapons:`, unit.melee_weapons);
  const rangedWeapons = unit.ranged_weapons ? unit.ranged_weapons.map((w) => w.name) : [];
  const meleeWeapons = unit.melee_weapons ? unit.melee_weapons.map((w) => w.name) : [];

  // contains champion keyword case insensitive
  const hasChampion = unit.keywords
    ? unit.keywords.some((k) => k.toLowerCase() === 'champion')
    : false;

  const unitSize = modelGroups.reduce((sum, group) => sum + group.count, 0);
  const isOneGroup = modelGroups.length == 1;

  let text = ``;
  if (!isOneGroup) {
    text += `<ul>`;
  } else {
  }

  for (const group of modelGroups) {
    const groupText = formatModelGroup(unitSize, group, hasChampion, rangedWeapons, meleeWeapons);
    if (!isOneGroup) {
      text += `<li>${groupText}</li>`;
    } else {
      text += groupText;
    }
  }

  if (!isOneGroup) {
    text += `</ul>`;
  }

  return text;
}

function formatModelGroup(
  unitSize: number,
  group: ModelGroup,
  hasChampion: boolean,
  rangedWeapons: string[],
  meleeWeapons: string[]
): string {
  const isOneModel = group.count === 1;
  const isGroupSize = unitSize === group.count;
  let text = `<i>`;

  if (isOneModel) {
    if (!isGroupSize) {
      text += `1 model is a <b>${group.name}</b>`;
    } else {
      text += `<b>${group.name}</b>`;
    }
  } else if (isGroupSize) {
    text += `each <b>${group.name}</b>`;
  } else {
    text += `${group.count} in ${unitSize} models are <b>${group.name}</b>`; // TODO: pluralize
  }
  const defaultWeapons = group.weapons.filter((w) => !w.max).map((w) => w.name);
  const defaultRanged = defaultWeapons.filter((w) => rangedWeapons.includes(w));
  const defaultMelee = defaultWeapons.filter((w) => meleeWeapons.includes(w));
  if (defaultWeapons.length > 0) {
    if (!isOneModel && !isGroupSize) {
      text += ` each`;
    }
    if ((isOneModel && isGroupSize) || !isOneModel) {
      text += ` is`;
    }

    text += ` armed with <b>${defaultWeapons.join('</b> and <b>')}</b></i>`;
  }

  // now in a bullet list write out optional weapons
  const optionalWeapons = group.weapons.filter((w) => w.max);
  if (optionalWeapons.length > 0) {
    text += '<ul>';
    for (const weapon of optionalWeapons) {
      const isOptionGroupSize = weapon.max === group.count;
      const isRanged = rangedWeapons.includes(weapon.name);
      text += `<li>`;
      if (isOneModel) {
        text += `<i>it may be armed with <b>${weapon.name}</b>`;
      } else if (isOptionGroupSize) {
        text += `<i>each may be armed with <b>${weapon.name}</b>`;
      } else {
        text += `<i>${weapon.max} in ${group.count} may be armed with <b>${weapon.name}</b>`;
      }

      if (isRanged && defaultRanged.length > 0) {
        text += ` instead of <b>${defaultRanged.join('</b> or <b>')}</b>`;
      } else if (!isRanged && defaultMelee.length > 0) {
        text += ` instead of <b>${defaultMelee.join('</b> or <b>')}</b>`;
      }
      text += `</i></li>`;
    }

    if (hasChampion) {
      text += `<li><i>The champion cannot replace their weapon</i></li>`;
    }

    text += '</ul>';
  }

  return text;
}
