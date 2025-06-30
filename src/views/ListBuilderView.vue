<template>
  <div class="list-builder-view">
    <div class="header-bar">
      <BackButton />
      <SettingsButton class="settings-btn" :size="36" @click="openSettings" />
    </div>
    <h1 class="list-title" v-if="list">{{ list.name }}</h1>
    <div v-if="list" class="subheader">{{ list.faction }}</div>
    <div v-else class="not-found">List not found.</div>
    <Section
      v-if="armyData && armyData.formations && armyData.formations.size > 0"
      v-model="formationCollapsed"
    >
      <template #title>{{ selectedFormation || 'Formation' }}</template>
      <div class="formation-section">
        <select v-model="selectedFormation" @change="onFormationChange">
          <option v-for="name in Array.from(armyData.formations.keys())" :key="name" :value="name">
            {{ name }}
          </option>
        </select>
        <div
          v-if="
            selectedFormation &&
            Array.isArray(armyData.formations.get(selectedFormation)) &&
            (armyData.formations.get(selectedFormation)?.length ?? 0) > 0
          "
        >
          <AbilityCard
            v-for="(ability, i) in armyData.formations.get(selectedFormation)"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <div v-if="list">
      <div v-for="(regiment, idx) in list.regiments" :key="idx" class="regiment-block">
        <ListRegiment
          :regiment="regiment"
          :title="`Regiment ${idx + 1}`"
          :army="armyData"
          :armyName="list.faction"
          :settingsOpen="showSettingsModal"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
          @ellipsis="(payload) => handleRegimentEllipsis({ ...payload, regimentIdx: idx })"
        />
      </div>
      <button class="add-regiment-btn" @click="addRegiment">Add regiment</button>
    </div>
    <ListSettingsModal
      v-model="showSettingsModal"
      :initialName="list?.name || ''"
      :existingNames="lists.map((l) => l.name)"
      @rename="handleRename"
      @delete="handleDelete"
      @close="closeSettings"
    />
    <div class="divider"></div>
    <div class="faction-terrain-controls">
      <template v-if="list?.faction_terrain && armyData">
        <ListButton
          :label="list.faction_terrain"
          :points="armyData.units.find((u) => u.name === list?.faction_terrain)?.points"
          @click="
            () =>
              list &&
              router.push({
                name: 'UnitDetail',
                params: { army: list.faction, unit: list.faction_terrain },
              })
          "
        />
        <button
          class="delete-terrain-btn"
          @click="handleDeleteFactionTerrain"
          title="Delete Faction Terrain"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </template>
      <template
        v-else-if="
          armyData &&
          armyData.units &&
          armyData.units.some((u) => (u.category || '').toLowerCase() === 'faction terrain')
        "
      >
        <button class="add-terrain-btn" @click="handleAddFactionTerrain">+ Faction Terrain</button>
      </template>
    </div>
    <!-- Lore Sections -->
    <ListBuilderLoreSection
      :armyLore="armyData?.spellLores"
      :lores="lores"
      v-model="spellLoresCollapsed"
      v-model:selectedLore="selectedSpellLore"
      @saveLore="saveSpellLore"
    />
    <ListBuilderLoreSection
      :armyLore="armyData?.prayerLores"
      :lores="lores"
      v-model="prayerLoresCollapsed"
      v-model:selectedLore="selectedPrayerLore"
      @saveLore="savePrayerLore"
    />
    <ListBuilderLoreSection
      v-if="armyData && armyData.manifestationLores && armyData.manifestationLores.length > 0"
      :armyLore="armyData.manifestationLores"
      :lores="lores"
      v-model="manifestationLoresCollapsed"
      v-model:selectedLore="selectedManifestationLore"
      manifestationMode
      @saveLore="saveManifestationLore"
    />
    <UnitSettingsModal
      v-if="showUnitSettingsModal && unitSettings && unitSettings.unit && armyData"
      v-model="showUnitSettingsModal"
      :unit="unitSettings.unit"
      :army="armyData"
      :regimentIdx="unitSettings.regimentIdx"
      :unitIdx="unitSettings.unitIdx"
      @save="handleUnitSettingsSave"
      @close="handleUnitSettingsClose"
    />
    <div class="scroll-buffer"></div>
  </div>
  <ListIndicator
    v-if="list && armyData && !showSettingsModal"
    :list="list"
    :army-data="armyData"
    :lores="lores"
    :points-cap="POINTS_CAP"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getAllLists, saveList, deleteList } from '../utils/list-manager';
import BackButton from '../components/BackButton.vue';
import SettingsButton from '../components/SettingsButton.vue';
import type { List } from '../common/ListData';
import ListRegiment from '../components/ListRegiment.vue';
import { loadArmy, loadLores } from '../army';
import type { Army } from '../common/ArmyData';
import ListSettingsModal from '../components/ListSettingsModal.vue';
import Section from '../components/Section.vue';
import AbilityCard from '../components/AbilityCard.vue';
import ListButton from '../components/ListButton.vue';
import ListBuilderLoreSection from '../components/ListBuilderLoreSection.vue';
import { universalManifestationLores } from '../common/ManifestationData';
import UnitSettingsModal from '../components/UnitSettingsModal.vue';
import ListIndicator from '../components/ListIndicator.vue';
import { POINTS_CAP, type ListUnit } from '../common/ListData';

const route = useRoute();
const router = useRouter();
const listName = route.params.name as string;
const list = ref<List | undefined>();
const showSettingsModal = ref(false);
const renameValue = ref('');
const lists = ref(getAllLists());
const armyData = ref<Army | null>(null);
const lores = ref<Map<string, any> | null>(null);
const loadingArmy = ref(false);
const selectedFormation = ref<string>('');
const selectedSpellLore = ref<string>('');
const selectedPrayerLore = ref<string>('');
const selectedManifestationLore = ref<string>('');
const spellLoresCollapsed = ref(true);
const prayerLoresCollapsed = ref(true);
const formationCollapsed = ref(true);
const manifestationLoresCollapsed = ref(true);
const showUnitSettingsModal = ref(false);
const unitSettings = ref<{
  regimentIdx: number;
  unitIdx: number | 'leader';
  unit: ListUnit | null;
} | null>(null);

function saveSpellLore(lore: string) {
  if (list.value) {
    list.value.spell_lore = lore;
    saveList(list.value);
  }
}
function savePrayerLore(lore: string) {
  if (list.value) {
    list.value.prayer_lore = lore;
    saveList(list.value);
  }
}
function saveManifestationLore(lore: string) {
  if (list.value) {
    list.value.manifestation_lore = lore;
    saveList(list.value);
  }
}

onMounted(async () => {
  const found = getAllLists().find((l) => l.name === listName);
  list.value = found;
  if (found) {
    loadingArmy.value = true;
    try {
      armyData.value = await loadArmy(found.faction);
      lores.value = await loadLores();
      // Only do auto-selections if setup is falsey
      if (armyData.value && list.value && !list.value.setup) {
        // Auto-select first available faction terrain
        const terrainUnits = armyData.value.units.filter(
          (u) => (u.category || '').toLowerCase() === 'faction terrain'
        );
        if (terrainUnits.length > 0) {
          list.value.faction_terrain = terrainUnits[0].name;
        }
        // Auto-select formation
        if (armyData.value.formations && armyData.value.formations.size > 0) {
          const firstFormation = Array.from(armyData.value.formations.keys())[0];
          list.value.formation = firstFormation;
          selectedFormation.value = firstFormation;
        }
        // Auto-select spell lore
        if (armyData.value.spellLores && armyData.value.spellLores.length > 0) {
          const firstSpellLore = armyData.value.spellLores[0].name;
          list.value.spell_lore = firstSpellLore;
          selectedSpellLore.value = firstSpellLore;
        }
        // Auto-select prayer lore
        if (armyData.value.prayerLores && armyData.value.prayerLores.length > 0) {
          const firstPrayerLore = armyData.value.prayerLores[0].name;
          list.value.prayer_lore = firstPrayerLore;
          selectedPrayerLore.value = firstPrayerLore;
        }
        // Auto-select manifestation lore
        if (armyData.value.manifestationLores && armyData.value.manifestationLores.length > 0) {
          const firstManifestationLore = armyData.value.manifestationLores[0].name;
          list.value.manifestation_lore = firstManifestationLore;
          selectedManifestationLore.value = firstManifestationLore;
        }
        // Mark setup as true and save
        list.value.setup = true;
        saveList(list.value);
      } else if (list.value && !list.value.setup) {
        // Mark setup as true and save even if no terrain
        list.value.setup = true;
        saveList(list.value);
      }
      // After setup, sync selected* refs from list values (if present)
      const currentList = list.value;
      if (currentList) {
        if (
          currentList.formation &&
          armyData.value.formations &&
          armyData.value.formations.has(currentList.formation)
        ) {
          selectedFormation.value = currentList.formation;
        } else if (armyData.value.formations && armyData.value.formations.size > 0) {
          selectedFormation.value = Array.from(armyData.value.formations.keys())[0];
        }
        if (
          currentList.spell_lore &&
          armyData.value.spellLores &&
          armyData.value.spellLores.some((l) => l.name === currentList.spell_lore)
        ) {
          selectedSpellLore.value = currentList.spell_lore;
        } else if (armyData.value.spellLores && armyData.value.spellLores.length > 0) {
          selectedSpellLore.value = armyData.value.spellLores[0].name;
        }
        if (
          currentList.prayer_lore &&
          armyData.value.prayerLores &&
          armyData.value.prayerLores.some((l) => l.name === currentList.prayer_lore)
        ) {
          selectedPrayerLore.value = currentList.prayer_lore;
        } else if (armyData.value.prayerLores && armyData.value.prayerLores.length > 0) {
          selectedPrayerLore.value = armyData.value.prayerLores[0].name;
        }
        // Manifestation Lore: merge army and universal lores for selection check
        let allManifestationLores: { name: string }[] = [];
        if (armyData.value.manifestationLores && Array.isArray(armyData.value.manifestationLores)) {
          allManifestationLores = [...armyData.value.manifestationLores];
        }
        if (Array.isArray(universalManifestationLores)) {
          allManifestationLores = allManifestationLores.concat(
            universalManifestationLores.map((name) => ({ name }))
          );
        }
        if (
          currentList.manifestation_lore &&
          allManifestationLores.some((l) => l.name === currentList.manifestation_lore)
        ) {
          selectedManifestationLore.value = currentList.manifestation_lore;
        } else if (allManifestationLores.length > 0) {
          selectedManifestationLore.value = allManifestationLores[0].name;
        }
      }
    } catch (e) {
      armyData.value = null;
      lores.value = null;
    } finally {
      loadingArmy.value = false;
    }
  }
});

function addRegiment() {
  if (!list.value) return;
  list.value.regiments.push({ leader: { name: '' }, units: [] });
  // Save updated list to localStorage
  saveList(list.value);
}

function openSettings() {
  if (list.value) renameValue.value = list.value.name;
  showSettingsModal.value = true;
}
function closeSettings() {
  showSettingsModal.value = false;
}
function handleRename(newName: string) {
  if (!list.value) return;
  const oldName = list.value.name;
  if (oldName === newName) {
    closeSettings();
    return;
  }
  // Remove the old list first
  deleteList(oldName);
  list.value.name = newName;
  saveList(list.value);
  lists.value = getAllLists();
  closeSettings();
  router.replace({ name: 'ListBuilder', params: { name: newName } });
}
function handleDelete() {
  if (!list.value) return;
  deleteList(list.value.name);
  closeSettings();
  router.push({ name: 'Armies' });
}
function deleteRegiment(idx: number) {
  if (!list.value) return;
  list.value.regiments.splice(idx, 1);
  saveList(list.value);
}
function handleDeleteUnit(regimentIdx: number, unitIdx: number | string) {
  if (!list.value) return;
  if (!list.value.regiments[regimentIdx]) return;
  if (unitIdx === 'leader') {
    list.value.regiments[regimentIdx].leader = { name: '' };
  } else if (typeof unitIdx === 'number') {
    list.value.regiments[regimentIdx].units.splice(unitIdx, 1);
  }
  saveList(list.value);
}
function onFormationChange(event: Event) {
  const target = event.target as HTMLSelectElement | null;
  if (!target) return;
  const newFormation = target.value;
  selectedFormation.value = newFormation;
  if (list.value) {
    list.value.formation = newFormation;
    saveList(list.value);
  }
}
function handleAddFactionTerrain() {
  if (!list.value || !armyData.value) return;
  // Find all faction terrain units in the army
  const terrainUnits = armyData.value.units.filter(
    (u) => (u.category || '').toLowerCase() === 'faction terrain'
  );
  if (terrainUnits.length === 1) {
    list.value.faction_terrain = terrainUnits[0].name;
    saveList(list.value);
  } else if (terrainUnits.length > 1) {
    // Use the same routing logic as ListRegiment for UnitPicker
    const listName = list.value.name;
    router.push({
      name: 'UnitPicker',
      params: { listName, regimentIdx: -1 }, // -1 indicates no specific regiment
      query: { filter: 'terrain' },
    });
  }
}
function handleDeleteFactionTerrain() {
  if (!list.value) return;
  list.value.faction_terrain = undefined;
  saveList(list.value);
}

function handleRegimentEllipsis(payload: { type: 'leader' | 'unit'; name: string; idx?: number }) {
  let regimentIdx = -1;
  let unitIdx: number | 'leader' = 'leader';
  let unit: ListUnit | null = null;
  if (payload.type === 'leader') {
    regimentIdx = list.value?.regiments.findIndex((r) => r.leader?.name === payload.name) ?? -1;
    unitIdx = 'leader';
    if (regimentIdx >= 0) {
      unit = list.value?.regiments[regimentIdx].leader ?? null;
    }
  } else {
    regimentIdx =
      list.value?.regiments.findIndex((r) => r.units.some((u) => u.name === payload.name)) ?? -1;
    unitIdx = payload.idx ?? 0;
    if (regimentIdx >= 0 && typeof unitIdx === 'number') {
      unit = list.value?.regiments[regimentIdx].units[unitIdx] ?? null;
    }
  }
  if (regimentIdx >= 0 && unit) {
    unitSettings.value = {
      regimentIdx,
      unitIdx,
      unit,
    };
    showUnitSettingsModal.value = true;
  }
}
function handleUnitSettingsSave(settings: {
  regimentIdx: number;
  unitIdx: number | 'leader';
  unit: ListUnit;
}) {
  if (!list.value) {
    showUnitSettingsModal.value = false;
    return;
  }
  const { regimentIdx, unitIdx, unit } = settings;
  const reg = list.value.regiments[regimentIdx];
  if (!reg) {
    showUnitSettingsModal.value = false;
    return;
  }
  if (unitIdx === 'leader') {
    reg.leader = unit;
  } else if (typeof unitIdx === 'number' && reg.units[unitIdx]) {
    reg.units[unitIdx] = unit;
  }
  saveList(list.value);
  showUnitSettingsModal.value = false;
}
function handleUnitSettingsClose() {
  showUnitSettingsModal.value = false;
}
</script>

<style scoped>
.header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5em;
}
.settings-btn {
  background: none;
  border: none;
  border-radius: 50%;
  box-shadow: none;
  color: #555;
  cursor: pointer;
  z-index: 2;
}
.settings-btn:hover {
  background: #e5e5e5;
}
.subheader {
  color: #666;
  font-size: 1.2em;
  margin-bottom: 0.5em;
}
.not-found {
  color: #a00;
  font-size: 1.2em;
  margin-top: 2em;
}
.add-regiment-btn {
  display: block;
  width: 100%;
  margin: 2em auto 0 auto;
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 0.9em 0;
  font-size: 1.15em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 340px;
}
.add-regiment-btn:hover {
  background: #c00;
}
.divider {
  border-bottom: 1px solid #ddd;
  margin: 0.5em 0;
}
.faction-terrain-controls {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  width: 100%;
}
.add-terrain-btn {
  width: 100%;
  background: #f5f5f5;
  color: #1976d2;
  border: 2px dashed #1976d2;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  padding: 0.7em 1.2em;
  cursor: pointer;
  transition:
    background 0.18s,
    color 0.18s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-terrain-btn:hover {
  background: #1976d2;
  color: #fff;
}
.delete-terrain-btn {
  min-width: 44px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: #f5f5f5;
  color: #a00;
  border: 1.5px solid #a00;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.1em;
  margin-right: 0;
  margin-top: 0;
  margin-bottom: 0;
  box-sizing: border-box;
  transition:
    background 0.18s,
    color 0.18s,
    border 0.18s;
}
.delete-terrain-btn:hover {
  background: #a00;
  color: #fff;
  border-color: #a00;
}
.list-title {
  margin: 0;
  margin-bottom: 0.25em;
}
.scroll-buffer {
  height: 5em;
  width: 100%;
}
</style>
