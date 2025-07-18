import { parseUnits } from './parse/parseUnit';
import { loadRepoFiles } from './load';
import type { BattleTacticCard, Game, IArmyListItem } from './models/game';
import type { Unit } from './models/unit';
import { parseBattleTacticCards, parseLores } from './parse/parseGame';
import type { Lore } from './models/lore';
import type { Ability } from './models/ability';
import type { Army, GrandAlliance } from './models/army';
import { parseArmy, parseLoresByGroup } from './parse/parseArmy';
import { parseCategories, type ICategory } from './parse/parseCommon';
import { BattleProfile, type IBattleProfile } from './models/battleProfile';
import type { RegimentOfRenown } from './models/regimentOfRenown';
import { parseRegimentsOfRenown } from './parse/parseRegimentOfRenown';

export class Parser {
  // configuration
  private githubRepo: string;
  private getFiles: (githubRepo: string) => Promise<Map<string, any>>;

  constructor(
    githubRepo: string,
    getFiles: (githubRepo: string) => Promise<Map<string, any>> = loadRepoFiles
  ) {
    this.githubRepo = githubRepo;
    this.getFiles = getFiles;
  }

  // state
  private gameFile: any;
  private loreFile: any;
  private rorFile: any;
  private libraryFiles: Map<string, any> = new Map();
  private armyFiles: Map<string, any> = new Map();
  private allFiles: any[] = [];
  private armyIds: Map<string, string> = new Map(); // id to name

  private categories: Map<string, ICategory> = new Map();
  private units: Map<string, Unit> = new Map();
  private battleTacticCards: BattleTacticCard[] = [];

  private allLores: Map<string, Lore> = new Map();

  private armies: Map<string, Army> = new Map();
  private regimentsOfRenown: Map<string, RegimentOfRenown> = new Map();

  async parse(): Promise<Game> {
    await this.initFiles();

    this.parseGameFile();

    // load all units
    [...this.libraryFiles.values(), this.gameFile, this.rorFile].forEach((xml) => {
      const units = parseUnits(xml.catalogue || xml.gameSystem);
      units.forEach((unit) => {
        if (this.units.has(unit.name)) {
          console.warn(`Duplicate unit found: ${unit.name} combining keywords`);
          const existingUnit = this.units.get(unit.name);
          if (existingUnit) {
            existingUnit.keywords = Array.from(new Set([...existingUnit.keywords, ...unit.keywords]));
          }
        } else {
          this.units.set(unit.name, unit);
        }
      });
    });

    // assign summon ability and summoned units
    this.units.forEach((unit) => {
      if (unit.category === 'MANIFESTATION' || unit.hasKeyword('MANIFESTATION')) {
        this.allLores.forEach((lore) => {
          lore.abilities.forEach((ability: Ability) => {
            if (ability.keywords.includes('**^^Summon^^**')) {
              if ((ability.summonedUnit && unit.summoningSpell?.name && ability.summonedUnit === unit.summoningSpell?.name) || ability.name.includes(unit.name)) {
                unit.summoningSpell = ability;
                ability.summonedUnit = unit.name;
                return;
              }
            }
          });
        });
      }
    });

    // look at all lores and check if any are missing a summoning spell
    this.allLores.forEach((lore) => {
      lore.abilities.forEach((ability: Ability) => {
        // check if the summoned unit looks like a uuid
        const isUUID = /^[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}$/i.test(ability.summonedUnit || '');
        if (ability.keywords.includes('**^^Summon^^**') && (!ability.summonedUnit || isUUID)) {
          // not sure why this triggers on eight fold doom-sigil, even though it is linked
          console.warn(`No unit found for summoning spell: ${ability.name} with summonedUnit ${ability.summonedUnit}`);
        }
      });
    });

    // parse armies and assign their lores
    [...this.armyFiles.values()].forEach((xml) => {
      // [this.armyFiles.get('Gloomspite Gitz.cat')].forEach((xml) => {
      const army = parseArmy(xml, this.units, this.categories);
      if (
        !army ||
        army.name === '' ||
        army.name.toLowerCase().includes('legends') ||
        army.battleProfiles.size === 0
      ) {
        return;
      }

      for (const armyLore of army.spellLores.values()) {
        const lore = this.allLores.get(armyLore.name);
        if (lore) {
          army.spellLores.set(armyLore.name, {
            ...lore,
            points: armyLore.points,
          });
        }
      }

      for (const armyLore of army.prayerLores.values()) {
        const lore = this.allLores.get(armyLore.name);
        if (lore) {
          army.prayerLores.set(armyLore.name, {
            ...lore,
            points: armyLore.points,
          });
        }
      }

      for (const armyLore of army.manifestationLores.values()) {
        const lore = this.allLores.get(armyLore.name);
        if (lore) {
          army.manifestationLores.set(armyLore.name, {
            ...lore,
            points: armyLore.points,
          });

          // create a battle profile for each manifestation ability
          for (const ability of lore.abilities) {
            const unit = this.units.get(ability.summonedUnit);
            if (!unit) continue; // skip if the unit is not found
            const battleProfile: Partial<IBattleProfile> = {
              name: unit.name,
              category: unit.category,
            };
            army.battleProfiles.set(unit.name, new BattleProfile(battleProfile));

            // update the unitList
            army.unitList.get(unit.category)?.push({
              name: unit.name,
              points: 0,
            });
          }
        }
      }

      if (this.armies.has(army.name)) {
        console.warn(`Duplicate army found: ${army.name}`);
      } else {
        this.armies.set(army.name, army);
      }
    });

    // assign list of armies of renown to each army
    this.armies.forEach((army) => {
      if (!army.isArmyOfRenown) {
        // find all armies of renown that are based on this army
        const aors = Array.from(this.armies.values())
          .filter((a) => a.baseArmyName === army.name && a.isArmyOfRenown)
          .map((a) => a.name.split(' - ')[1].trim());
        army.armiesOfRenown = aors;
      }
    });

    const universalManifestationLores = parseLoresByGroup(
      this.loreFile.catalogue,
      'Manifestation Lores'
    );
    // reassign the abilities to the ones in allLores (since those have the full data)
    universalManifestationLores.forEach((lore) => {
      const fullLore = this.allLores.get(lore.name);
      if (fullLore) {
        lore.abilities = fullLore.abilities;
      }
    });

    // deal with big waaagh manually it's an AoR but not parsed as one
    const bigWaaagh = this.armies.get('Big Waaagh!');
    // this.armies.delete('Big Waaagh!');
    if (bigWaaagh) {
      bigWaaagh.isArmyOfRenown = true;
      // bigWaaagh.baseArmyName = 'Orruck Warclans';
      // bigWaaagh.name = 'Orruck Warclans - Big Waaagh!';
      // this.armies.set(bigWaaagh.name, bigWaaagh);
    }

    // sorted list of armies by grand alliance
    const armyList: Map<GrandAlliance, IArmyListItem[]> = new Map();
    armyList.set('Order', []);
    armyList.set('Chaos', []);
    armyList.set('Death', []);
    armyList.set('Destruction', []);
    this.armies.forEach((army) => {
      if (!army.isArmyOfRenown || army.name === 'Big Waaagh!') {
        armyList.get(army.grandAlliance)?.push({
          name: army.name,
          armiesOfRenown: army.armiesOfRenown,
        });
      }
    });
    // sort the armies in each grand alliance by name
    armyList.forEach((armies, ga) => {
      armies.sort((a, b) => a.name.localeCompare(b.name));
      armyList.set(ga, armies);
    });

    // regiments of renown
    this.regimentsOfRenown = parseRegimentsOfRenown(
      this.rorFile.catalogue,
      this.gameFile.gameSystem,
      this.armyIds
    );

    // update armies with a list of regiment of renowns that it is allowed to use
    this.armies.forEach((army) => {
      const allowedRors = Array.from(this.regimentsOfRenown.values())
        .filter((ror) => ror.allowedArmies.includes(army.name))
        .map((ror) => ror.name);
      army.regimentsOfRenown = allowedRors;
    });

    return {
      battleTacticCards: this.battleTacticCards,
      weaponAbilityDescriptions: new Map(), // TODO: later
      keywordAbility: new Map(), // TODO: later
      units: this.units,
      universalManifestationLores: universalManifestationLores,
      armies: this.armies,
      armyList: armyList,
      regimentsOfRenown: this.regimentsOfRenown,
    };
  }

  private async initFiles() {
    const pathToXml = await this.getFiles(this.githubRepo);
    this.gameFile = pathToXml.get('Age of Sigmar 4.0.gst');
    this.loreFile = pathToXml.get('Lores.cat');
    this.rorFile = pathToXml.get('Regiments of Renown.cat');

    if (!this.gameFile) throw new Error('Age of Sigmar 4.0.gst file not found');
    if (!this.loreFile) throw new Error('Lores.cat file not found');
    if (!this.rorFile) throw new Error('Regiments of Renown.cat file not found');

    // Ensure deterministic insertion order by sorting the paths
    Array.from(pathToXml.keys())
      .sort()
      .forEach((path) => {
        const xml = pathToXml.get(path);
        // not one of the special files
        if (
          path === 'Age of Sigmar 4.0.gst' ||
          path === 'Lores.cat' ||
          path === 'Regiments of Renown.cat'
        ) {
          return;
        }

        if (path.toLowerCase().includes('library')) {
          this.libraryFiles.set(path, xml);
        } else {
          this.armyFiles.set(path, xml);
          const name = xml?.catalogue['@_name'] || '';
          const id = xml?.catalogue['@_id'] || '';
          if (name && id) {
            this.armyIds.set(id, name);
          }
        }
        this.allFiles.push(xml);
      });
  }

  private parseGameFile(): void {
    this.battleTacticCards = parseBattleTacticCards(this.gameFile);
    this.categories = parseCategories(this.gameFile.gameSystem);
    this.allLores = parseLores(this.loreFile.catalogue);
  }
}
