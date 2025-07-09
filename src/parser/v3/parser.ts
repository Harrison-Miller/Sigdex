import { parseUnits } from './parse/parseUnit';
import { loadRepoFiles } from './load';
import type { IBattleTacticCard, IGame } from './models/game';
import type { IUnit } from './models/unit';
import { parseBattleTacticCards, parseLores } from './parse/parseGame';
import type { ILore } from './models/lore';
import type { IAbility } from './models/ability';
import type { GrandAlliance, IArmy } from './models/army';
import { parseArmy, parseLoresByGroup } from './parse/parseArmy';
import { parseCategories, type ICategory } from './parse/parseCommon';
import { BattleProfile, type IBattleProfile } from './models/battleProfile';

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

  private categories: Map<string, ICategory> = new Map();
  private units: Map<string, IUnit> = new Map();
  private battleTacticCards: IBattleTacticCard[] = [];

  private allLores: Map<string, ILore> = new Map();

  private armies: Map<string, IArmy> = new Map();

  async parse(): Promise<IGame> {
    await this.initFiles();

    this.parseGameFile();

    // load all units
    [...this.libraryFiles.values(), this.gameFile, this.rorFile].forEach((xml) => {
      // [this.libraryFiles.get('Gloomspite Gitz - Library.cat')].forEach((xml) => {
      let units = parseUnits(xml.catalogue || xml.gameSystem);
      units.forEach((unit) => {
        if (this.units.has(unit.name)) {
          console.warn(`Duplicate unit found: ${unit.name}`);
        } else {
          this.units.set(unit.name, unit);
        }
      });
    });

    // assign summon ability and summoned units
    this.units.forEach((unit) => {
      if (unit.category === 'MANIFESTATION') {
        this.allLores.forEach((lore) => {
          lore.abilities.forEach((ability: IAbility) => {
            if (ability.keywords.includes('**^^Summon^^**')) {
              if (ability.name.includes(unit.name)) {
                unit.summoningSpell = ability;
                ability.summonedUnit = unit.name;
                return;
              }
            }
          });
        });
      }
    });

    // parse armies and assign their lores
    [...this.armyFiles.values()].forEach((xml) => {
      // [this.armyFiles.get('Gloomspite Gitz.cat')].forEach((xml) => {
      let army = parseArmy(xml, this.units, this.categories);
      if (
        !army ||
        army.name === '' ||
        army.name.toLowerCase().includes('legends') ||
        army.battleProfiles.size === 0
      ) {
        console.warn(
          `Skipping invalid army: ${xml.catalogue?.['@_name'] || xml.gameSystem?.['@_name']}`
        );
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
            console.log(`Adding bp for manifestation: ${ability.name}`);
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
          .map((a) => a.name);
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

    // sorted list of armies by grand alliance
    const armyList: Map<GrandAlliance, string[]> = new Map();
    armyList.set('Order', []);
    armyList.set('Chaos', []);
    armyList.set('Death', []);
    armyList.set('Destruction', []);
    this.armies.forEach((army) => {
      armyList.get(army.grandAlliance)?.push(army.name);
    });
    // sort the armies in each grand alliance by name
    armyList.forEach((armies, ga) => {
      armies.sort((a, b) => a.localeCompare(b));
      armyList.set(ga, armies);
    });

    return {
      battleTacticCards: this.battleTacticCards,
      weaponAbilityDescriptions: new Map(), // TODO: later
      keywordAbility: new Map(), // TODO: later
      units: this.units,
      universalManifestationsLores: universalManifestationLores,
      armies: this.armies,
      armyList: armyList,
      regimentsOfRenown: new Map(), // TODO: later
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
