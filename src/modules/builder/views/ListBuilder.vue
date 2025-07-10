<template>
  <div v-if="!loading" class="list-builder-view">
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
    <Section v-if="army.battleTraits.length > 0" v-model="battleTraitsCollapsed">
      <template #title>Battle Traits</template>
      <AbilityCard v-for="(trait, i) in army.battleTraits" :key="trait.name + i" :ability="trait" />
    </Section>
    <Section v-if="army.formations.size > 0" v-model="formationCollapsed">
      <template #title>{{ selectedFormationName || 'Formation' }}</template>
      <div class="formation-section">
        <OptionSelect
          v-model="selectedFormationName"
          :options="Array.from(army.formations.keys())"
          @update:modelValue="onFormationSelect"
        />
        <div>
          <AbilityCard
            v-for="(ability, i) in selectedFormation"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <Section v-model="battleTacticCardsCollapsed">
      <template #title>Battle Tactic Cards</template>
      <div class="battle-tactic-selectors">
        <div class="battle-tactic-selector">
          <OptionSelect
            v-model="selectedBattleTacticCardName1"
            :options="battleTacticCards.map((card) => card.name)"
            placeholder="Select Battle Tactic Card 1"
          />
          <BattleTacticCard
            v-if="selectedBattleTacticCard1.name.length > 0"
            :card="selectedBattleTacticCard1"
          />
        </div>
        <div class="battle-tactic-selector">
          <OptionSelect
            v-model="selectedBattleTacticCardName2"
            :options="battleTacticCards.map((card) => card.name)"
            placeholder="Select Battle Tactic Card 2"
          />
          <BattleTacticCard
            v-if="selectedBattleTacticCard2.name.length > 0"
            :card="selectedBattleTacticCard2"
          />
        </div>
      </div>
    </Section>
    <div v-if="list && army.battleProfiles.size > 0">
      <div v-for="(regiment, idx) in list.regiments" :key="idx" class="regiment-block">
        <ListRegiment
          :regimentIdx="idx"
          :regiment="regiment"
          :listId="list.id"
          :battleProfiles="army.battleProfiles"
          :armyName="list.faction"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
        />
      </div>
      <button class="add-regiment-btn" @click="addRegiment">Add regiment</button>

      <AuxiliaryUnitsSection
        v-model="list.auxiliary_units"
        :battleProfiles="army.battleProfiles"
        :armyName="list.faction"
        :listId="list.id"
        @update:modelValue="onListChange"
      />
      <FactionTerrainSection
        v-model="factionTerrainRef"
        :battleProfiles="army.battleProfiles"
        :armyName="list.faction"
        :listId="list.id"
      />
      <!-- Lore Sections -->
      <ListBuilderLoreSection
        :armyLore="army.spellLores"
        :armyName="list.faction"
        v-model="selectedSpellLore"
      />
      <ListBuilderLoreSection
        :armyLore="army.prayerLores"
        :armyName="list.faction"
        v-model="selectedPrayerLore"
      />
      <ListBuilderLoreSection
        :armyLore="army.manifestationLores"
        :armyName="list.faction"
        v-model="selectedManifestationLore"
        manifestationMode
      />
    </div>
    <div class="scroll-buffer"></div>
  </div>
  <ListIndicator v-if="list && game" :list="list" :game="game" :pointsCap="POINTS_CAP" />
</template>

<script setup lang="ts">
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { saveList, getList } from '../../../utils/list-manager';
import BackButton from '../../core/components/BackButton.vue';
import SettingsButton from '../../core/components/SettingsButton.vue';
import CircleIconButton from '../../core/components/CircleIconButton.vue';
import { useGame } from '../../shared/composables/useGame';
import Section from '../../core/components/Section.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListBuilderLoreSection from '../components/ListBuilderLoreSection.vue';
import ListIndicator from '../components/ListIndicator.vue';
import { POINTS_CAP } from '../../../common/ListData';
import ListRegiment from '../components/ListRegiment.vue';
import BattleTacticCard from '../../shared/components/BattleTacticCard.vue';
import FactionTerrainSection from '../components/FactionTerrainSection.vue';
import AuxiliaryUnitsSection from '../components/AuxiliaryUnitsSection.vue';
import { Army } from '../../../parser/v3/models/army';
import { BattleTacticCard as BattleTacticCardType } from '../../../parser/v3/models/game';

const props = defineProps<{ id: string }>();
const route = useRoute();
const router = useRouter();
const listId = props.id ?? (route.params.id as string);
const list = ref(getList(listId));
const { game, loading } = useGame();
const army = computed(() => {
  return game.value?.armies.get(list.value?.faction || '') || new Army();
});
const selectedFormationName = computed({
  get: () => list.value?.formation || '',
  set: (val: string) => {
    if (list.value) {
      list.value.formation = val;
      saveList(list.value);
    }
  },
});
const selectedFormation = computed(() => {
  return army.value.formations.get(selectedFormationName.value) || [];
});
const selectedSpellLore = computed({
  get: () => list.value?.spell_lore || '',
  set: (val: string) => {
    if (list.value) {
      list.value.spell_lore = val;
      saveList(list.value);
    }
  },
});
const selectedPrayerLore = computed({
  get: () => list.value?.prayer_lore || '',
  set: (val: string) => {
    if (list.value) {
      list.value.prayer_lore = val;
      saveList(list.value);
    }
  },
});
const selectedManifestationLore = computed({
  get: () => list.value?.manifestation_lore || '',
  set: (val: string) => {
    if (list.value) {
      list.value.manifestation_lore = val;
      saveList(list.value);
    }
  },
});
const battleTraitsCollapsed = ref(true);
const formationCollapsed = ref(true);
const auxCollapsed = ref(true);
const battleTacticCardsCollapsed = ref(true);
const battleTacticCards = computed(() => {
  return game.value?.battleTacticCards || [];
});
// Removed legacy refs and computed for selectedBattleTactic1/2 and cards

const selectedBattleTacticCardName1 = computed({
  get: () => list.value?.battle_tactics?.[0] || '',
  set: (val: string) => {
    if (list.value) {
      const val1 = val || '';
      const val2 = list.value.battle_tactics?.[1] || '';
      list.value.battle_tactics = [val1, val2];
      saveList(list.value);
    }
  },
});

const selectedBattleTacticCard1 = computed(() => {
  return (
    battleTacticCards.value.find((card) => card.name === selectedBattleTacticCardName1.value) ||
    new BattleTacticCardType()
  );
});

const selectedBattleTacticCardName2 = computed({
  get: () => list.value?.battle_tactics?.[1] || '',
  set: (val: string) => {
    if (list.value) {
      const val1 = list.value.battle_tactics?.[0] || '';
      const val2 = val || '';
      list.value.battle_tactics = [val1, val2];
      saveList(list.value);
    }
  },
});

const selectedBattleTacticCard2 = computed(() => {
  return (
    battleTacticCards.value.find((card) => card.name === selectedBattleTacticCardName2.value) ||
    new BattleTacticCardType()
  );
});

const factionTerrainRef = ref<string | undefined>(undefined);

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
  selectedFormationName.value = newFormation;
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
