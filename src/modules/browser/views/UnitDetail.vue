<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
import KeywordsBar from '../../shared/components/KeywordsBar.vue';
import WeaponTable from '../components/WeaponTable.vue';
import FavoriteToggle from '../../core/components/FavoriteToggle.vue';
import BackButton from '../../core/components/BackButton.vue';
import Section from '../../core/components/ContentSection.vue';
import { isFavorite, saveFavorite, removeFavorite } from '../../../favorites';
import {
  formatModelGroups,
  formatSubHeroTags,
  formatRegimentOptions,
  formatText,
} from '../../../utils/formatter';
import { useArmy, useUnit } from '../../shared/composables/useGame';
import { useUnitSettings } from '../../shared/composables/useUnitSettings';
import WeaponOptionsSelection from '../../builder/components/WeaponOptionsSelection.vue';
import ReportErrorButton from '../../shared/components/ReportErrorButton.vue';
import LegendsBadge from '../../shared/components/badges/LegendsBadge.vue';

function formatCompanionUnits(unitName: string, companionLeader: string): string {
  const bold = (name: string) => `<b>${name}</b>`;
  if (companionLeader) {
    return `<i>${bold(unitName)} must be in a regiment led by ${bold(companionLeader)}.</i>`;
  }
  return '';
}

const hasChampion = computed(() => {
  return unit.value.hasKeyword('Champion');
});

const props = defineProps<{ unitName: string; armyName: string }>();
const route = useRoute();

const unitName = props.unitName ?? (route?.params?.unit as string | undefined);
const armyName = props.armyName ?? (route?.params?.army as string | undefined);

const { army } = useArmy(armyName ?? '');
const { unit, battleProfile } = useUnit(armyName ?? '', unitName ?? '');
const unitSettings = useUnitSettings(unit);

const unitFavorite = ref(isFavorite('unit', unitName));
function toggleUnitFavoriteDetail(fav: boolean) {
  unitFavorite.value = fav;
  if (fav) {
    saveFavorite('unit', unitName);
  } else {
    removeFavorite('unit', unitName);
  }
}
const favoriteToggleSize = 36;

const unitKeywords = computed(() => {
  const keywords = new Set<string>(unit.value.keywords);
  if (army.value.armyKeyword) {
    keywords.add(army.value.armyKeyword);
  }
  return Array.from(keywords).sort();
})

</script>
<template>
  <BackButton :size="36" />
        <div
        v-if="armyName !== 'UniversalUnits'"
        class="floating-header-buttons"
      >
        <FavoriteToggle
          :model-value="unitFavorite"
          :size="favoriteToggleSize"
          no-text
          @update:model-value="toggleUnitFavoriteDetail"
        />
      </div>
  <div>
          <h1 class="fancy-text">{{ unit.name }}</h1>
          <LegendsBadge big :legends="unit.legends" style="margin-bottom: 1em" />
    <div class="stats-row">
      <StatCircle
        v-if="unit.stats.move"
        :value="unit.stats.move"
        label="Move"
      />
      <StatCircle
        v-if="unit.stats.health"
        :value="unit.stats.health"
        label="Health"
      />
      <StatCircle
        v-if="unit.stats.control"
        :value="unit.stats.control"
        label="Control"
      />
      <StatCircle
        v-if="unit.stats.banishment"
        :value="unit.stats.banishment"
        label="Banishment"
      />
      <StatCircle
        v-if="unit.stats.save"
        :value="unit.stats.save"
        label="Save"
      />
      <StatCircle
        v-if="unit.stats.ward"
        :value="unit.stats.ward"
        label="Ward"
      />
    </div>
    <Section
      v-if="unit.meleeWeapons.length"
      collapse-key="meleeWeapons"
    >
      <template #title>
        Melee Weapons
        <img v-if="hasChampion" src="/assets/icons/wreath-laurel-solid.svg" alt="Champion" class="champion-icon" />
      </template>
      <WeaponTable
        :weapons="unit.meleeWeapons"
        short-headers
      />
    </Section>
    <Section
      v-if="unit.rangedWeapons.length"
      collapse-key="rangedWeapons"
    >
      <template #title>
        Ranged Weapons
        <img v-if="hasChampion" src="/assets/icons/wreath-laurel-solid.svg" alt="Champion" class="champion-icon" />
      </template>
      <WeaponTable
        :weapons="unit.rangedWeapons"
        short-headers
      />
    </Section>
    <Section
      v-if="unit.abilities.length"
      collapse-key="abilities"
    >
      <template #title>Abilities</template>
      <div class="abilities">
        <AbilityCard
          v-for="(a, i) in [...unit.abilities].sort((a, b) => a.name.localeCompare(b.name))"
          :key="a.name + i"
          :ability="a"
        />
      </div>
    </Section>
    <Section
      v-if="unit.summoningSpell"
      collapse-key="summoningSpell"
    >
      <template #title>Summoning</template>
      <div class="abilities">
        <AbilityCard :ability="unit.summoningSpell" />
      </div>
    </Section>
    <Section
      collapse-key="unitDetails"
    >
      <template #title>Unit Details</template>
      <div
        class="unit-detail"
      >
        <template v-if="unit.descriptions.length">
          <div v-for="(desc, index) in unit.descriptions" :key="`desc-${index}`" class="unit-detail-section">
            <span v-html="formatText(desc)" />
          </div>
        </template>
        <div
          v-if="armyName !== 'UniversalUnits' && !battleProfile.reinforceable && !battleProfile.defaultNotReinforceable()"
          class="unit-detail-section"
        >
          <span v-html="`<i>This unit can not be reinforced.</i>`" />
        </div>
        <div
          v-if="battleProfile.reinforceable && battleProfile.defaultNotReinforceable()"
        >
          <span v-html="`<i>This unit can be reinforced.</i>`" />
        </div>
        <div
          v-if="battleProfile.undersizeCondition"
          class="unit-detail-section"
        >
          <span
            v-html="
              `<i>You can include 1 unit of this type for each <b>${battleProfile.undersizeCondition}</b> in your army.</i>`
            "
          />
        </div>
        <div
          v-if="battleProfile.companionUnits.length > 0 || battleProfile.companionLeader"
          class="unit-detail-section"
        >
          <span v-html="formatCompanionUnits(unit.name, battleProfile.companionLeader)" />
        </div>
        <div
          class="unit-detail-section"
          v-html="formatModelGroups(Array.from(unit.models.values()), unit)"
        />
        <span v-if="battleProfile.points > 0">{{ battleProfile.points }} Points</span>
        <span
          v-if="unit.unitSize > 0"
          style="margin-left: 1.5em"
        >Unit Size: {{ unit.unitSize }}</span>

        <div
          v-if="battleProfile.category === 'HERO' && battleProfile.regimentTags.length > 0"
          class="unit-detail-section"
        >
          <span v-html="formatSubHeroTags(battleProfile.regimentTags)" />
        </div>
        <div
          v-if="battleProfile.regimentOptions.length > 0"
          class="unit-detail-section"
        >
          <span v-html="formatRegimentOptions(battleProfile.regimentOptions)" />
        </div>
      </div>
    </Section>
    <Section
      v-if="unit.keywords.length"
      collapse-key="keywords"
    >
      <template #title>Keywords</template>
      <KeywordsBar :keywords="unitKeywords" />
    </Section>
            <WeaponOptionsSelection
          v-if="unit.hasWeaponOptions()"
          v-model="unitSettings"
          :unit-data="unit"
          title="Default Weapon Options"
          :default-collapsed="true"
        />
          <ReportErrorButton 
    :unit-name="unitName"
    :army-name="armyName"
    :army-revision="army.revision"/>
  </div>
</template>
<style src="./unit-detail.css" scoped></style>
<style scoped>
.floating-header-buttons {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  padding: 1.2em 0.3em 0 0;
}

.unit-detail {
  font-size: 0.95em;
  color: var(--text-head);
  text-align: left;
}

.unit-detail-section {
  margin-top: 0.5em;
}

.unit-default-settings-label {
  font-size: 1.1em;
  font-weight: 600;
  margin-bottom: 0.7em;
  color: #a00;
}
.unit-default-settings-block {
  margin-bottom: 2em;
  padding: 1em 0 0 0;
}
.option-row {
  margin-bottom: 0.7em;
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  align-items: center;
}

.champion-icon {
  height: 1.2em;
  margin-left: 0.4em;
  vertical-align: middle;
  /* default: no filter */
}
.dark .champion-icon {
  filter: invert(1) brightness(1.6);
}
</style>

