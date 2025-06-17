import type { Unit } from './UnitData';

export class Army {
	units: Unit[];
	constructor(units: Unit[]) {
		this.units = units;
	}
}