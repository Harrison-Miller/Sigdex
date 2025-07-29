import pluralize, { isPlural } from 'pluralize';
import type { Model } from '../parser/models/model';
import type { Unit } from '../parser/models/unit';
import type { WeaponOption } from '../parser/models/weaponOption';
import type { RegimentOption } from '../parser/models/battleProfile';
import type { ArmyOption } from '../parser/models/army';

export function formatText(text: string): string {
  if (!text) return '';

  // // Replace all newlines with <br>
  text = text.replace(/\n/g, '<br>');

  // bullet point
  text = text.replace(/•\s*/g, '<br>•');

  // add a bullet point if we've got \n**{sometext}**: basically the start of a rule subsection
  text = text.replace(/\n\s*\*\*([^\n]+):\*\*/g, '<br>• <b>$1</b>:'); // Add bullet point for new lines

  // **text** => bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  // *text* => italics
  text = text.replace(/\*(?!\*)(.+?)\*(?!\*)/g, '<i>$1</i>');
  // ^^text^^ => small caps
  text = text.replace(/\^\^(.+?)\^\^/g, '<span style="font-variant: small-caps;">$1</span>');




  // // Replace any number of sequential <br>'s (with optional whitespace between) with a single <br>
  text = text.replace(/(<br>\s*)+/g, '<br>');

  return text;
}

export function formatModelGroups(modelGroups: Model[], unit: Unit): string {
  // contains champion keyword case insensitive
  const hasChampion = unit.keywords
    ? unit.keywords.some((k) => k.toLowerCase() === 'champion')
    : false;

  const isOneGroup = modelGroups.length == 1;

  let text = '';
  if (!isOneGroup) {
    text += '<ul>';
  }

  for (const group of modelGroups) {
    const groupText = formatModelGroup(unit.unitSize, group, hasChampion);
    if (!isOneGroup) {
      text += `<li>${groupText}</li>`;
    } else {
      text += groupText;
    }
  }

  if (!isOneGroup) {
    text += '</ul>';
  }

  return text;
}

function formatModelGroup(unitSize: number, group: Model, hasChampion: boolean): string {
  const isOneModel = group.count === 1;
  const isGroupSize = unitSize === group.count;
  let text = '<i>';

  if (isOneModel) {
    if (!isGroupSize) {
      text += `1 model is a <b>${group.name}</b>`;
    } else {
      text += `<b>${group.name}</b>`;
    }
  } else if (isGroupSize) {
    text += `each <b>${group.name}</b>`;
  } else {
    text += `${group.count} in ${unitSize} models are <b>${pluralize(group.name)}</b>`;
  }

  const weaponArray = Array.from(group.weapons.values());
  const defaultWeapons = weaponArray.filter((w) => w.type === 'default').map((w) => w.name);
  if (defaultWeapons.length > 0) {
    if (!isOneModel && !isGroupSize) {
      text += ' each';
    }
    if ((isOneModel && isGroupSize) || !isOneModel) {
      text += ' is';
    }

    text += ' armed with';
    // weapon1,weapon2...and weaponN`;
    if (defaultWeapons.length == 1) {
      text += ` ${formatWeaponName(defaultWeapons[0])}`;
    } else if (defaultWeapons.length > 1) {
      text += ` ${defaultWeapons
        .map((w) => formatWeaponName(w))
        .join(', ')
        .replace(/, ([^,]*)$/, ' and $1')}`;
    }
  }
  text += '</i>';

  // now in a bullet list write out optional weapons
  const optionalWeapons = weaponArray.filter((w) => w.type === 'optional');
  if (optionalWeapons.length > 0) {
    text += '<ul>';
    for (const weapon of optionalWeapons) {
      const isOptionGroupSize = weapon.max === group.count;
      text += '<li>';
      if (isOneModel) {
        text += `<i>it may be armed with ${formatWeaponName(weapon.name)}`;
      } else if (isOptionGroupSize) {
        text += `<i>each may be armed with ${formatWeaponName(weapon.name)}`;
      } else {
        text += `<i>${weapon.max} in ${group.count} may be armed with ${formatWeaponName(weapon.name)}`;
      }

      // replacesAll true if all replaces options are the same as defaultWeapons
      if (weapon.replaces && weapon.replaces.length > 0) {
        const replacesAll = defaultWeapons.every(
          (w) => weapon.replaces && weapon.replaces.includes(w)
        );
        if (replacesAll) {
          text += ' instead';
        } else {
          text += ` instead of ${weapon.replaces.map((w) => formatWeaponName(w)).join(' and ')}`;
        }
      }

      text += '</i></li>';
    }

    if (hasChampion) {
      text += '<li><i>The champion cannot replace their weapon</i></li>';
    }

    text += '</ul>';
  }

  // grouped weapons
  const groupedWeapons: Map<string, WeaponOption[]> = new Map();
  for (const weapon of weaponArray) {
    if (weapon.type === 'grouped' && weapon.group) {
      if (!groupedWeapons.has(weapon.group)) {
        groupedWeapons.set(weapon.group, []);
      }
      groupedWeapons.get(weapon.group)?.push(weapon);
    }
  }

  for (const [_, weapons] of groupedWeapons.entries()) {
    text += '<br>';
    text += '<i>It may be armed with 1 of the following options:</i>';
    text += '<ul>';
    for (const weapon of weapons) {
      text += `<li><i> ${formatWeaponName(weapon.name)} </i></li>`;
    }
    text += '</ul>';
  }

  return text;
}

function formatWeaponName(name: string): string {
  if (isPlural(name)) {
    return `<b>${name}</b>`;
  }
  // decide a or an
  const firstLetter = name.charAt(0).toLowerCase();
  const article = ['a', 'e', 'i', 'o', 'u'].includes(firstLetter) ? 'an' : 'a';
  return `${article} <b>${name}</b>`;
}

export function formatSubHeroTags(tags: string[]): string {
  if (!tags || tags.length === 0) return '';
  return `<i>This <b>Hero</b> can join an eligible regiment as a ${tags.map((tag) => `<b>${tag}</b>`).join(', ')}.</i>`;
}

export function formatRegimentOptions(options: RegimentOption[]): string {
  const formatItems = (opts: RegimentOption[]) =>
    opts
      .map((opt) => {
        if (opt.names.length > 1) {
          const optNames = opt.names.map((name) => `<b>${name}</b>`).join(' or ');
          return `<li><i>${opt.min}-${opt.max} ${optNames}</i></li>`;
        } else if (opt.names.length === 1) {
          if (opt.min > 0 && opt.max == opt.min) {
            return `<li><i>${opt.min} <b>${opt.names[0]}</b> (required)</i></li>`;
          } else if (opt.min > 0 && opt.max > 0) {
            return `<li><i>${opt.min}-${opt.max} <b>${opt.names[0]}</b></i></li>`;
          } else if (opt.min === 0 && opt.max > 0) {
            return `<li><i>0-${opt.max} <b>${opt.names[0]}</b></i></li>`;
          } else {
            return `<li><i>any <b>${opt.names[0]}</b></i></li>`;
          }
        }
      })
      .join('');

  let html = '';
  if (options.length > 0) {
    html += '<div style=\'font-weight:600;margin-bottom:0.2em;\'>Regiment Options:</div>';
    html += `<ul style='margin:0 0 0 1.2em;padding:0;font-size:0.97em;'>${formatItems(options)}</ul>`;
  }

  return html;
}

export function formatArmyOptions(options: ArmyOption[]): string {
  let out = '';
  for (const option of options) {
    out += `<li>`;
    switch (option.type) {
      case 'requiredGeneral':
        out += formatRequiredGeneral(option.units);
        break;
      case 'generalIfIncluded':
        out += formatMustBeGeneralIfIncluded(option.units);
        break;
      case 'mustBeIncluded':
        out += formatMustBeIncluded(option);
        break;
      default:
        out += `Unknown army option type: ${option.type}`;
    }
    out += `</li>`;
  }
  return out
}

function formatRequiredGeneral(requiredGeneral: string[]): string {
  if (requiredGeneral.length === 1) {
    return `<strong>${requiredGeneral[0]}</strong> must be the general.`;
  } else if (requiredGeneral.length > 1) {
    return `One of the following units must be the general: <strong>${requiredGeneral.join(', ')}</strong>`;
  }
  return '';
}

function formatMustBeGeneralIfIncluded(units: string[]): string {
  if (!units || units.length === 0) return '';
  if (units.length === 1) {
    return `<strong>${units[0]}</strong> must be the general if included.`;
  } else {
    return `One of the following must be the general if included: <strong>${units.join(', ')}</strong>`;
  }
}

function formatMustBeIncluded(option: ArmyOption): string {
  if (option.min === 0 && option.max === 0) {
    return `No units must be included.`;
  } else if (option.min === option.max) {
    return `exactly ${option.min} <strong>${option.units.join(', ')}</strong> must be included.`;
  } else {
    return `${option.min}-${option.max} <strong>${option.units.join(', ')}</strong> must be included.`;
  }
}
