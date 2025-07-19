import SuperJSON from "superjson";
import { BattleTacticCard, Game } from "./parser/models/game";
import { Ability } from "./parser/models/ability";
import { Unit } from "./parser/models/unit";
import { Stats } from "./parser/models/stats";
import { Weapon } from "./parser/models/weapon";
import { Model } from "./parser/models/model";
import { WeaponOption } from "./parser/models/weaponOption";
import { Lore } from "./parser/models/lore";
import { Army, ArmyOption, Enhancement, EnhancementTable, Formation } from "./parser/models/army";
import { BattleProfile, RegimentOption } from "./parser/models/battleProfile";
import { RegimentOfRenown } from "./parser/models/regimentOfRenown";
import { List } from "./list/models/list";
import { ListRegiment } from "./list/models/regiment";
import { ListUnit } from "./list/models/unit";

export function registerSuperJSONClasses(): void {
	// parser models
	SuperJSON.registerClass(Game, { identifier: 'Game' });
	SuperJSON.registerClass(BattleTacticCard, { identifier: 'BattleTacticCard' });
	SuperJSON.registerClass(Ability, { identifier: 'Ability' });
	SuperJSON.registerClass(Formation, { identifier: 'Formation' });
	SuperJSON.registerClass(Unit, { identifier: 'Unit' });
	SuperJSON.registerClass(Stats, { identifier: 'Stats' });
	SuperJSON.registerClass(Weapon, { identifier: 'Weapon' });
	SuperJSON.registerClass(Model, { identifier: 'Model' });
	SuperJSON.registerClass(WeaponOption, { identifier: 'WeaponOption' });
	SuperJSON.registerClass(Lore, { identifier: 'Lore' });
	SuperJSON.registerClass(Army, { identifier: 'Army' });
	SuperJSON.registerClass(EnhancementTable, { identifier: 'EnhancementTable' });
	SuperJSON.registerClass(Enhancement, { identifier: 'Enhancement' });
	SuperJSON.registerClass(BattleProfile, { identifier: 'BattleProfile' });
	SuperJSON.registerClass(RegimentOption, { identifier: 'RegimentOption' });
	SuperJSON.registerClass(RegimentOfRenown, { identifier: 'RegimentOfRenown' });
	SuperJSON.registerClass(ArmyOption, { identifier: 'ArmyOption' });

	// list models
	SuperJSON.registerClass(List, { identifier: 'List' });
	SuperJSON.registerClass(ListRegiment, { identifier: 'ListRegiment' });
	SuperJSON.registerClass(ListUnit, { identifier: 'ListUnit' });

	// Register built-in types if needed
	// SuperJSON.registerClass(Date, { identifier: 'Date' });
}