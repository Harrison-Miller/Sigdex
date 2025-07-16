import { computed, toValue } from 'vue';
import { useStorage, type MaybeRefOrGetter } from '@vueuse/core';
import { getDefaultWeaponOptions, ListUnit } from '../../../list/models/unit';
import type { Unit } from '../../../parser/models/unit';
import SuperJSON from 'superjson';

export const UNIT_SETTINGS_KEY = 'unitSettings';

/**
 * useUnitSettings composable
 * Gets and sets ListUnit settings for a given unit name in a Map<string, ListUnit> stored in localStorage.
 * If the unit is not present, returns a new ListUnit and sets it in the map.
 * Usage:
 *   const unitSettings = useUnitSettings(unitName);
 */
export function useUnitSettings(unitData: MaybeRefOrGetter<Unit>) {
	// Use VueUse useStorage to persist the settings map
	const unitSettingsMap = useStorage(UNIT_SETTINGS_KEY, new Map<string, ListUnit>(), undefined, {
		serializer: {
			read: (v) => {
				try {
					if (!v) return new Map<string, ListUnit>();
					return SuperJSON.parse(v);
				} catch {
					return new Map<string, ListUnit>();
				}
			},
			write: (v) => SuperJSON.stringify(v),
		},
	});

	const data = computed(() => toValue(unitData));

	const unitSettings = computed({
		get() {
			if (!data.value) return new ListUnit();
			let unit = unitSettingsMap.value.get(data.value.name);
			if (!unit) {
				unit = new ListUnit({
					name: data.value.name,
					reinforced: false,
					weaponOptions: data.value ? getDefaultWeaponOptions(data.value) : undefined,
				});
			}
			return unit;
		},
		set(val: ListUnit) {
			if (!data.value) return;
			unitSettingsMap.value.set(data.value.name, val);
		},
	});

	return unitSettings;
}
