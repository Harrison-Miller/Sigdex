import { parseUnits } from './parse/parseUnit';
import { loadRepoFiles } from './load';
import type { IGame } from './models/game';
import type { IUnit } from './models/unit';

export class Parser {
  // configuration
  private githubRepo: string;
  private getFiles: (githubRepo: string) => Map<string, any>;

  constructor(
    githubRepo: string,
    getFiles: (githubRepo: string) => Map<string, any> = loadRepoFiles
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

  private units: Map<string, IUnit> = new Map();

  parse(): IGame {
    this.initFiles();

    // load all units
    this.allFiles.forEach((xml) => {
      const units = parseUnits(xml);
      units.forEach((unit) => {
        if (this.units.has(unit.name)) {
          console.warn(`Duplicate unit found: ${unit.name}`);
        } else {
          this.units.set(unit.name, unit);
        }
      });
    });

    return {
      battleTacticCards: [],
      weaponAbilityDescriptions: new Map(),
      keywordAbility: new Map(),
      units: this.units,
      universalManifestationsLores: new Map(),
      armies: this.armyFiles,
      regimentsOfRenown: new Map(),
    };
  }

  private initFiles(): void {
    const pathToXml = this.getFiles(this.githubRepo);
    // Use this for files that we expect to always be present
    const mustGetFile = (key: string, prop: keyof Parser) => {
      const file = pathToXml.get(key);
      if (!file) {
        throw new Error(`${key} file not found`);
      }
      this[prop] = file;
    };

    mustGetFile('Age of Sigmar 4.0.gst', this.gameFile);
    mustGetFile('Lores.cat', this.loreFile);
    mustGetFile('Regiments of Renown.cat', this.rorFile);

    pathToXml.forEach((xml, path) => {
      if (path.toLowerCase().includes('library')) {
        this.libraryFiles.set(path, xml);
      } else if (path.toLowerCase().includes('army')) {
        this.armyFiles.set(path, xml);
      }
      this.allFiles.push(xml);
    });
  }
}
