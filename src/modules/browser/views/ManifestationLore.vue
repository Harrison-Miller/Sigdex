<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { loadLores, loadUniversalUnits } from '../../../army';
import type { Unit } from '../../../common/UnitData';
import type { Lore } from '../../../common/ManifestationData';
import ListButton from '../../shared/components/ListButton.vue';
import BackButton from '../../core/components/BackButton.vue';
import ArmyRules from '../components/ArmyRules.vue';
import TwoTab from '../../core/components/TwoTab.vue';

const props = defineProps<{ lore: string }>();
const loreName = props.lore;

const units = ref<Unit[]>([]);
const spells = ref<any[]>([]);
const loreData = ref<Lore | null>(null);
const loreNotFound = ref(false);
const leftActive = ref(true);

onMounted(async () => {
  try {
    const lores = await loadLores();
    const lore = lores.get(loreName);
    const loreSpells = lore?.abilities;
    if (!loreSpells) {
      loreNotFound.value = true;
      return;
    }
    loreData.value = lore;
    spells.value = loreSpells;
    const allUnits = await loadUniversalUnits();
    // Find all units that are referenced by any spell in this lore
    const unitNames = new Set<string>();
    for (const unit of allUnits) {
      // does a spell name or text contain the unit name?
      for (const spell of loreSpells) {
        if (spell.name.includes(unit.name) || spell.text.includes(unit.name)) {
          unitNames.add(unit.name);
          break; // No need to check other spells for this unit
        }
      }
    }
    units.value = allUnits.filter((u) => unitNames.has(u.name));
    if (units.value.length === 0) {
      loreNotFound.value = true;
    }
  } catch (e) {
    loreNotFound.value = true;
  }
});
</script>
<template>
  <BackButton :size="36" class="unit-list-back" />
  <div class="list-container">
    <h1>
      {{ loreName }}
      <span
        v-if="loreData && loreData.points !== undefined && loreData.points > 0"
        class="points-badge"
      >
        {{ loreData.points }} pts
      </span>
    </h1>
    <TwoTab :left-label="'Manifestations'" :right-label="'Lore'" v-model:leftActive="leftActive">
      <template #left>
        <ul>
          <li v-for="u in units" :key="u.name">
            <router-link
              :to="{
                name: 'UnitDetail',
                params: { army: 'UniversalManifestations', unit: u.name },
              }"
              custom
              v-slot="{ navigate, href }"
            >
              <ListButton :label="u.name" :points="u.points" @click="navigate" :href="href" />
            </router-link>
          </li>
        </ul>
        <div v-if="loreNotFound" class="error">Lore not found.</div>
      </template>
      <template #right>
        <ArmyRules
          :army="{
            units: [],
            artifacts: new Map(),
            heroicTraits: new Map(),
            spellLores: [],
            prayerLores: [],
            formations: new Map(),
            battleTraits: [],
            manifestationLores: loreData ? [{ name: loreName, points: loreData.points ?? 0 }] : [],
            enhancementTables: new Map(),
            toJSON: function () {
              return {
                units: this.units,
                artifacts: Array.from(this.artifacts.entries()),
                heroicTraits: Array.from(this.heroicTraits.entries()),
                manifestationLores: this.manifestationLores,
                spellLores: this.spellLores,
                prayerLores: this.prayerLores,
                battleTraits: this.battleTraits,
                formations: Array.from(this.formations.entries()),
                enhancementTables: Array.from(this.enhancementTables.entries()),
              };
            },
          }"
        />
      </template>
    </TwoTab>
  </div>
</template>
<style src="../../../views/list-shared.css" scoped></style>
<style scoped>
.unit-list-back {
  margin-bottom: 0.5rem;
}
.points-badge {
  display: inline-block;
  background: #8b0000;
  color: #f3f4f6;
  font-weight: 600;
  font-size: 0.65em;
  border-radius: 12px;
  padding: 0.12em 0.5em;
  margin-left: 0.7em;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.error {
  color: #b91c1c;
  margin-top: 1em;
  font-weight: 500;
}
</style>
