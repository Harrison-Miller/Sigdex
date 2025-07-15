<script setup lang="ts">
import { ref } from 'vue';
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
} from '../../../utils/formatter';
import { useUnit } from '../../shared/composables/useGame';

function formatCompanionUnits(unitName: string, companionLeader: string): string {
  const bold = (name: string) => `<b>${name}</b>`;
  if (companionLeader) {
    return `<i>${bold(unitName)} must be in a regiment led by ${bold(companionLeader)}.</i>`;
  }
  return '';
}

const props = defineProps<{ unitName: string; armyName: string }>();
const route = useRoute();

const unitName = props.unitName ?? (route?.params?.unit as string | undefined);
const armyName = props.armyName ?? (route?.params?.army as string | undefined);

const { unit, battleProfile } = useUnit(armyName ?? '', unitName ?? '');

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
</script>
<template>
  <BackButton :size="36" />
  <div class="unit-detail">
    <div class="unit-detail-header">
      <div
        v-if="armyName !== 'UniversalUnits'"
        class="unit-detail-fav"
      >
        <FavoriteToggle
          :model-value="unitFavorite"
          :size="favoriteToggleSize"
          no-text
          @update:model-value="toggleUnitFavoriteDetail"
        />
      </div>
      <h1>{{ unit.name }}</h1>
    </div>
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
      <template #title>Melee Weapons</template>
      <WeaponTable
        :weapons="unit.meleeWeapons"
        short-headers
      />
    </Section>
    <Section
      v-if="unit.rangedWeapons.length"
      collapse-key="rangedWeapons"
    >
      <template #title>Ranged Weapons</template>
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
        class="unit-detail-points"
        style="font-size: 0.95em; color: #666; text-align: left"
      >
        <div
          v-if="armyName !== 'UniversalUnits' && !battleProfile.reinforceable && !battleProfile.defaultNotReinforceable()"
          class="unit-not-reinforceable"
          style="margin-top: 0.5em"
        >
          <span v-html="`<i>This unit can not be reinforced.</i>`" />
        </div>
        <div
          v-if="battleProfile.reinforceable && battleProfile.defaultNotReinforceable()"
          class="unit-reinforceable"
        >
          <span v-html="`<i>This unit can be reinforced.</i>`" />
        </div>
        <div
          v-if="battleProfile.undersizeCondition"
          class="unit-not-reinforceable"
          style="margin-top: 0.5em"
        >
          <span
            v-html="
              `<i>You can include 1 unit of this type for each <b>${battleProfile.undersizeCondition}</b> in your army.</i>`
            "
          />
        </div>
        <div
          v-if="battleProfile.companionUnits.length > 0 || battleProfile.companionLeader"
          class="unit-companion-units"
          style="margin-top: 0.5em"
        >
          <span v-html="formatCompanionUnits(unit.name, battleProfile.companionLeader)" />
        </div>
        <div
          class="unit-model-groups"
          style="margin-top: 0.5em"
          v-html="formatModelGroups(Array.from(unit.models.values()), unit)"
        />
        <span v-if="battleProfile.points > 0">{{ battleProfile.points }} Points</span>
        <span
          v-if="unit.unitSize > 0"
          style="margin-left: 1.5em"
        >Unit Size: {{ unit.unitSize }}</span>

        <div
          v-if="battleProfile.category === 'HERO' && battleProfile.regimentTags.length > 0"
          class="unit-sub-hero-tags"
          style="margin-top: 0.5em"
        >
          <span v-html="formatSubHeroTags(battleProfile.regimentTags)" />
        </div>
        <div
          v-if="battleProfile.regimentOptions.length > 0"
          class="unit-regiment-options"
          style="margin-top: 0.5em"
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
      <KeywordsBar :keywords="unit.keywords" />
    </Section>
  </div>
</template>
<style src="./unit-detail.css" scoped></style>
<style scoped>
.unit-detail-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  position: relative;
}

.unit-detail-fav {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 1;
}
</style>
