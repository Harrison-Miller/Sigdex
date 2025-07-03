<template>
  <div class="list-builder-view">
    <div class="header-bar">
      <div style="flex: 1; min-width: 0; display: flex; align-items: center">
        <BackButton />
      </div>
      <div class="floating-header-buttons">
        <CircleIconButton
          class="export-btn"
          :size="36"
          icon="fa-solid fa-file-arrow-down"
          @click="openExport"
        />
        <SettingsButton class="settings-btn" :size="36" @click="openSettings" />
      </div>
    </div>
    <h1 class="list-title" v-if="list">{{ list.name }}</h1>
    <div v-if="list" class="subheader">{{ list.faction }}</div>
    <div v-else class="not-found">List not found.</div>
    <Section
      v-if="armyData && armyData.battleTraits && armyData.battleTraits.length > 0"
      v-model="battleTraitsCollapsed"
    >
      <template #title>Battle Traits</template>
      <AbilityCard
        v-for="(trait, i) in armyData.battleTraits"
        :key="trait.name + i"
        :ability="trait"
      />
    </Section>
    <Section
      v-if="armyData && armyData.formations && armyData.formations.size > 0"
      v-model="formationCollapsed"
    >
      <template #title>{{ selectedFormation || 'Formation' }}</template>
      <div class="formation-section">
        <OptionSelect
          v-model="selectedFormation"
          :options="Array.from(armyData.formations.keys())"
          @update:modelValue="onFormationSelect"
        />
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
    <Section v-model="battleTacticCardsCollapsed">
      <template #title>Battle Tactic Cards</template>
      <div v-if="battleTacticCards.length === 0" style="margin: 1em 0; color: #a00">
        No battle tactic cards found.
      </div>
      <div v-else class="battle-tactic-selectors">
        <div class="battle-tactic-selector">
          <OptionSelect
            v-model="selectedBattleTactic1"
            :options="battleTacticCards.map((card) => card.name)"
            placeholder="Select Battle Tactic Card 1"
            @update:modelValue="onBattleTacticSelect"
          />
          <div v-if="selectedBattleTacticCard1">
            <BattleTacticCard :card="selectedBattleTacticCard1" />
          </div>
        </div>
        <div class="battle-tactic-selector">
          <OptionSelect
            v-model="selectedBattleTactic2"
            :options="battleTacticCards.map((card) => card.name)"
            placeholder="Select Battle Tactic Card 2"
            @update:modelValue="onBattleTacticSelect"
          />
          <div v-if="selectedBattleTacticCard2">
            <BattleTacticCard :card="selectedBattleTacticCard2" />
          </div>
        </div>
      </div>
    </Section>
    <div v-if="list && armyData">
      <div v-for="(regiment, idx) in list.regiments" :key="idx" class="regiment-block">
        <ListRegiment
          :key="idx"
          :regimentIdx="idx"
          :regiment="regiment"
          :listId="list.id"
          :army="armyData"
          :armyName="list.faction"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
        />
      </div>
      <button class="add-regiment-btn" @click="addRegiment">Add regiment</button>

      <!-- Auxillary Units Section -->
      <AuxiliaryUnitsSection
        v-model="list.auxiliary_units"
        :army-data="armyData"
        :list-faction="list.faction"
        :router="router"
        :list-id="list.id"
        @update:modelValue="onListChange"
      />
    </div>
    <FactionTerrainSection
      v-if="list && armyData"
      v-model="factionTerrainRef"
      :army-data="armyData"
      :list-faction="list.faction"
      :list-id="list.id"
    />
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
      :armyLore="armyData?.manifestationLores"
      :lores="lores"
      :currentArmy="armyData"
      :armyName="list?.faction"
      v-model="manifestationLoresCollapsed"
      v-model:selectedLore="selectedManifestationLore"
      manifestationMode
      @saveLore="saveManifestationLore"
    />
    <div class="scroll-buffer"></div>
  </div>
  <ListIndicator
    v-if="list && armyData"
    :list="list"
    :army-data="armyData"
    :lores="lores"
    :points-cap="POINTS_CAP"
  />
</template>

<script setup lang="ts">
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getList, saveList } from '../../../utils/list-manager';
import BackButton from '../../core/components/BackButton.vue';
import SettingsButton from '../../core/components/SettingsButton.vue';
import CircleIconButton from '../../core/components/CircleIconButton.vue';
import type { List } from '../../../common/ListData';
import { loadArmy, loadLores } from '../../../army';
import type { Army } from '../../../common/ArmyData';
import Section from '../../core/components/Section.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListBuilderLoreSection from '../components/ListBuilderLoreSection.vue';
import { universalManifestationLores } from '../../../common/ManifestationData';
import ListIndicator from '../components/ListIndicator.vue';
import { POINTS_CAP } from '../../../common/ListData';
import ListRegiment from '../components/ListRegiment.vue';
import BattleTacticCard from '../../shared/components/BattleTacticCard.vue';
import { loadBattleTacticCards } from '../../../army';
import FactionTerrainSection from '../components/FactionTerrainSection.vue';
import AuxiliaryUnitsSection from '../components/AuxiliaryUnitsSection.vue';

const props = defineProps<{ id: string }>();
const route = useRoute();
const router = useRouter();
const listId = props.id ?? (route.params.id as string);
const list = ref<List | undefined>();
const armyData = ref<Army | null>(null);
const lores = ref<Map<string, any> | null>(null);
const loadingArmy = ref(false);
const selectedFormation = ref<string>('');
const selectedSpellLore = ref<string>('');
const selectedPrayerLore = ref<string>('');
const selectedManifestationLore = ref<string>('');
const battleTraitsCollapsed = ref(true);
const spellLoresCollapsed = ref(true);
const prayerLoresCollapsed = ref(true);
const formationCollapsed = ref(true);
const manifestationLoresCollapsed = ref(true);
const auxCollapsed = ref(true);
const battleTacticCardsCollapsed = ref(true);
const battleTacticCards = ref<any[]>([]);
const selectedBattleTactic1 = ref<string>('');
const selectedBattleTactic2 = ref<string>('');
const selectedBattleTacticCard1 = computed(() =>
  battleTacticCards.value.find((card) => card.name === selectedBattleTactic1.value)
);
const selectedBattleTacticCard2 = computed(() =>
  battleTacticCards.value.find((card) => card.name === selectedBattleTactic2.value)
);
// Sync selected battle tactics from list on mount and when list changes
watch(
  () => list.value?.battle_tactics,
  (tactics) => {
    if (Array.isArray(tactics)) {
      selectedBattleTactic1.value = tactics[0] || '';
      selectedBattleTactic2.value = tactics[1] || '';
    }
  },
  { immediate: true }
);

function onBattleTacticSelect() {
  if (list.value) {
    // Always keep both selected, even if blank, and never save null
    const val1 = selectedBattleTactic1.value || '';
    const val2 = selectedBattleTactic2.value || '';
    list.value.battle_tactics = [val1, val2];
    saveList(list.value);
  }
}
const factionTerrainRef = ref<string | undefined>(undefined);

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
  const found = getList(listId);
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

  try {
    battleTacticCards.value = await loadBattleTacticCards();
  } catch (e) {
    battleTacticCards.value = [];
  }
});

watch(
  () => list.value?.auxiliary_units?.length,
  (len) => {
    if (len && len > 0) auxCollapsed.value = false;
    else auxCollapsed.value = true;
  },
  { immediate: true }
);

// Sync ref with list value on mount and when list changes
watch(
  () => list.value?.faction_terrain,
  (val) => {
    factionTerrainRef.value = val;
  },
  { immediate: true }
);

// Watch the ref and update the list and save when it changes
watch(factionTerrainRef, (val) => {
  if (list.value) {
    list.value.faction_terrain = val;
    saveList(list.value);
  }
});

function addRegiment() {
  if (!list.value) return;
  list.value.regiments.push({ leader: { name: '' }, units: [] });
  saveList(list.value);
}

function openSettings() {
  router.push({ name: 'BuilderSettings', params: { id: listId } });
}

function openExport() {
  router.push({ name: 'ListExport', params: { id: listId } });
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
function onFormationSelect(newFormation: string | undefined) {
  if (!newFormation) return;
  selectedFormation.value = newFormation;
  if (list.value) {
    list.value.formation = newFormation;
    saveList(list.value);
  }
}

function onListChange() {
  if (list.value) {
    saveList(list.value);
  }
}
</script>
<style scoped>
@import './listbuilder.css';
.battle-tactic-selectors {
  display: flex;
  gap: 2em;
  flex-wrap: wrap;
  margin-bottom: 1em;
}
.battle-tactic-selector {
  flex: 1 1 250px;
  min-width: 220px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  gap: 0.7em;
}
</style>
