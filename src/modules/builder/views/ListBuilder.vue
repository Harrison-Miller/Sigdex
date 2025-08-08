<template>
  <div
    v-if="!loading"
    class="list-builder-view"
  >
        <div class="floating-header-buttons">
        <CircleIconButton
          class="export-btn"
          :size="36"
          icon="fa-solid fa-file-arrow-down"
          @click="openExport"
        />
        <SettingsButton
          class="settings-btn"
          :size="36"
          @click="openSettings"
        />
      </div>
    <h1
      v-if="list"
      class="list-title"
    >
      {{ list.name }}
    </h1>
    <div
      v-if="list"
      class="subheader"
    >
      {{ list.faction }}
    </div>
    <div
      v-else
      class="not-found"
    >
      List not found.
    </div>
    <LegendsBadge big :legends="army.legends" />
    <Section
      v-if="army.battleTraits.length > 0"
      :default-collapsed="battleTraitsCollapsed"
      collapse-key="battleTraits"
    >
      <template #title>Battle Traits</template>
      <AbilityCard
        v-for="(trait, i) in army.battleTraits"
        :key="trait.name + i"
        :ability="trait"
      />
    </Section>
    <Section
      v-if="army.formations.size > 0"
      :default-collapsed="formationCollapsed"
      collapse-key="formations"
    >
      <template #title>{{ list.formation || 'Formations' }}<BadgeRow inline><SoGBadge :sog="selectedFormation.sog" /><PointsBadge :points="selectedFormation.points" /></BadgeRow></template>
      <div class="formation-section">
        <OptionSelect
          v-model="list.formation"
          :options="Array.from(army.formations.keys())"
        />
        <div>
          <AbilityCard
            v-for="(ability, i) in selectedFormation.abilities"
            :key="ability.name + i"
            :ability="ability"
          />
        </div>
      </div>
    </Section>
    <Section
v-if="showTactics"
      :default-collapsed="battleTacticCardsCollapsed"
      collapse-key="battleTacticCards"
    >
      <template #title>Battle Tactic Cards</template>
      <div>
        <div>
          <OptionSelect
            v-model="list.battleTacticCard1"
            :options="battleTacticCards.map((card) => card.name)"
            placeholder="Select Battle Tactic Card 1"
          />
          <BattleTacticCard
            v-if="selectedBattleTacticCard1.name.length > 0"
            :card="selectedBattleTacticCard1"
          />
        </div>
        <div>
          <OptionSelect
            v-model="list.battleTacticCard2"
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
      <div
        v-for="(regiment, idx) in list.regiments"
        :key="idx"
        class="regiment-block"
      >
        <ListRegiment
          :regiment-idx="idx"
          :regiment="regiment"
          :list-id="list.id"
          :battle-profiles="army.battleProfiles"
          :army-name="list.faction"
          @delete="() => deleteRegiment(idx)"
          @delete-unit="(unitIdx) => handleDeleteUnit(idx, unitIdx)"
        />
      </div>
      <button
        class="add-regiment-btn"
        @click="addRegiment"
      >
        Add regiment
      </button>

      <RegimentOfRenownSection
        v-if="list && game && army.regimentsOfRenown.length > 0"
        :model-value-name="list.regimentOfRenown"
        :model-value-units="list.regimentOfRenownUnits"
        :list-id="list.id"
        :game="game"
        @update:model-value-name="val => list.regimentOfRenown = val"
        @update:model-value-units="val => list.regimentOfRenownUnits = val"
      />
      <AuxiliaryUnitsSection
        v-model="list.auxiliaryUnits"
        :battle-profiles="army.battleProfiles"
        :army-name="list.faction"
        :list-id="list.id"
      />
      <FactionTerrainSection 
        v-if="list && game"
        v-model="list.factionTerrain"
        :battle-profiles="army.battleProfiles"
        :army-name="list.faction"
        :list-id="list.id"
        :game="game"
      />
      <!-- Lore Sections -->
      <ListBuilderLoreSection
        v-model="list.spellLore"
        :army-lore="army.spellLores"
        :army-name="list.faction"
        title="Spell Lore"
      />
      <ListBuilderLoreSection
        v-model="list.prayerLore"
        :army-lore="army.prayerLores"
        :army-name="list.faction"
        title="Prayer Lore"
      />
      <ListBuilderLoreSection
        v-model="list.manifestationLore"
        :army-lore="army.manifestationLores"
        :army-name="list.faction"
        title="Manifestation Lore"
        manifestation-mode
      />
    </div>
  </div>
  <ListIndicator
    v-if="list && game"
    :list="list"
    :game="game"
  />
</template>

<script setup lang="ts">
import OptionSelect from '../../core/components/OptionSelect.vue';
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useList } from '../../shared/composables/useList';
import SettingsButton from '../../core/components/SettingsButton.vue';
import CircleIconButton from '../../core/components/CircleIconButton.vue';
import { useGame } from '../../shared/composables/useGame';
import Section from '../../core/components/ContentSection.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import ListBuilderLoreSection from '../components/ListBuilderLoreSection.vue';
import ListIndicator from '../components/ListIndicator.vue';
import ListRegiment from '../components/ListRegiment.vue';
import BattleTacticCard from '../../shared/components/BattleTacticCard.vue';
import FactionTerrainSection from '../components/FactionTerrainSection.vue';
import AuxiliaryUnitsSection from '../components/AuxiliaryUnitsSection.vue';
import RegimentOfRenownSection from '../components/RegimentOfRenownSection.vue';
import { Army, Formation } from '../../../parser/models/army';
import { BattleTacticCard as BattleTacticCardModel } from '../../../parser/models/game';
import { ListUnit } from '../../../list/models/unit';
import { ListRegiment as ListRegimentModel } from '../../../list/models/regiment';
import PointsBadge from '../../shared/components/badges/PointsBadge.vue';
import LegendsBadge from '../../shared/components/badges/LegendsBadge.vue';
import SoGBadge from '../../shared/components/badges/SoGBadge.vue';
import BadgeRow from '../../shared/components/badges/BadgeRow.vue';
import { useTitle } from '@vueuse/core';

const props = defineProps<{ id: string }>();
const route = useRoute();
const router = useRouter();
const listId = props.id ?? (route.params.id as string);
const list = useList(listId);

useTitle(`${list.value?.name || 'List Builder'}`);

const { game, loading } = useGame();
const army = computed(() => {
  return game.value?.armies.get(list.value?.faction || '') || new Army();
});
const selectedFormation = computed(() => {
  return army.value.formations.get(list.value.formation) || new Formation();
});
const selectedBattleTacticCard1 = computed(() => {
  return (
    battleTacticCards.value.find((card) => card.name === list.value.battleTacticCard1) ||
    new BattleTacticCardModel()
  );
});
const selectedBattleTacticCard2 = computed(() => {
  return (
    battleTacticCards.value.find((card) => card.name === list.value.battleTacticCard2) ||
    new BattleTacticCardModel()
  );
});

const showTactics = computed(() => {
  return list.value.validator !== 'holy havoc';
});

const battleTraitsCollapsed = ref(true);
const formationCollapsed = ref(true);
const battleTacticCardsCollapsed = ref(true);
const battleTacticCards = computed(() => {
  return game.value?.battleTacticCards || [];
});

function addRegiment() {
  list.value.regiments.push(new ListRegimentModel());
  list.value.modifiedAt = new Date();
}
function openSettings() {
  router.push({ name: 'BuilderSettings', params: { id: listId } });
}
function openExport() {
  router.push({ name: 'ListExport', params: { id: listId } });
}
function deleteRegiment(idx: number) {
  list.value.regiments.splice(idx, 1);
  list.value.modifiedAt = new Date();
}
function handleDeleteUnit(regimentIdx: number, unitIdx: number | string) {
  if (!list.value.regiments[regimentIdx]) return;
  if (unitIdx === 'leader') {
    list.value.regiments[regimentIdx].leader = new ListUnit();
  } else if (typeof unitIdx === 'number') {
    list.value.regiments[regimentIdx].units.splice(unitIdx, 1);
  }
  list.value.modifiedAt = new Date();
}

const spellLoreRef = computed(() => list.value.spellLore || '');
const prayerLoreRef = computed(() => list.value.prayerLore || '');
const manifestationLoreRef = computed(() => list.value.manifestationLore || '');
const factionTerrainRef = computed(() => list.value.factionTerrain || '');
watch([selectedFormation, selectedBattleTacticCard1, selectedBattleTacticCard2, spellLoreRef, prayerLoreRef, manifestationLoreRef, factionTerrainRef], () => {
  if (list.value) {
    // console.log('List modified due to changes in formation, battle tactics, or lore');
    list.value.modifiedAt = new Date();
  }
});
// const modifiedRef = computed(() => list.value.modifiedAt || new Date());
// watch(modifiedRef, () => {
//   if (list.value) {
//     console.log('List modified at:', list.value.modifiedAt);
//   }
// });
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
