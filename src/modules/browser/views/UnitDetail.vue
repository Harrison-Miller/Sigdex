<script setup lang="ts">
import { computed } from 'vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
import KeywordsBar from '../../shared/components/KeywordsBar.vue';
import WeaponTable from '../components/WeaponTable.vue';
import FavoriteToggle from '../../core/components/FavoriteToggle.vue';
import BackButton from '../../core/components/BackButton.vue';
import Section from '../../core/components/Section.vue';
import { isFavorite, saveFavorite, removeFavorite } from '../../../favorites';
import { loadArmy, loadLores, loadUniversalUnits } from '../../../army';
import { MOCK_UNIT } from '../../../army';
import type { Ability } from '../../../common/Ability';
import {
  formatModelGroups,
  formatSubHeroTags,
  formatRegimentOptions,
} from '../../../utils/formatter';

function formatCompanionUnits(unitName: string, companions: string[]): string {
  if (!companions || companions.length === 0) return '';
  const bold = (name: string) => `<b>${name}</b>`;
  const companionsText = companions.map(bold).join(' and ');
  // Italicize the whole sentence
  return `<i>${bold(unitName)} must be taken with ${companionsText}.</i>`;
}

// Accept unit and army as props for detail view
const props = defineProps<{ unit?: any; army?: string }>();
const route = useRoute();

const unitPropIsObject = typeof props.unit === 'object' && props.unit !== null;
let unitName = unitPropIsObject
  ? props.unit.name
  : (props.unit ?? (route?.params?.unit as string | undefined));
let armyName = props.army ?? (route?.params?.army as string | undefined);

const unit = ref(unitPropIsObject ? props.unit : null);
const summoningAbility = ref<Ability | null>(null);

onMounted(async () => {
  if (!unitName || !armyName) return;

  let units = [];
  let manifestationLores: string[] = [];
  let armyData: any = null;

  if (armyName === 'UniversalManifestations') {
    units = await loadUniversalUnits();
    // No manifestationLores for universal units
    manifestationLores = [];
    unit.value = (units as any[]).find((u: any) => u.name === unitName) ?? MOCK_UNIT;
  } else {
    armyData = await loadArmy(armyName);
    if (armyData) {
      units = armyData.units || [];
      manifestationLores = armyData.manifestationLores.map((lore: any) => lore.name) || [];
    }
    unit.value = (armyData.units as any[]).find((u: any) => u.name === unitName) ?? MOCK_UNIT;
  }

  // Summoning logic for Manifestation
  if (unit.value && unit.value.category === 'Manifestation') {
    const lores = await loadLores();
    if (manifestationLores.length === 0) {
      manifestationLores = Array.from(lores.keys());
    }

    let foundAbility: Ability | null = null;
    for (const loreName of manifestationLores) {
      const abilities = lores.get(loreName)?.abilities || [];
      foundAbility =
        abilities.find(
          (a) =>
            a.name.toLowerCase().includes(unit.value.name.toLowerCase()) ||
            a.text.toLowerCase().includes(unit.value.name.toLowerCase())
        ) || null;
      if (foundAbility) break;
    }
    summoningAbility.value = foundAbility;
    // try name split
    if (!foundAbility) {
      const nameParts = (unit.value.name as string).split(' ');
      for (const loreName of manifestationLores) {
        const abilities = lores.get(loreName)?.abilities || [];
        foundAbility =
          abilities.find((a) =>
            nameParts.some(
              (part) =>
                a.name.toLowerCase().includes(part.toLowerCase()) ||
                a.text.toLowerCase().includes(part.toLowerCase())
            )
          ) || null;
        if (foundAbility) break;
      }
      summoningAbility.value = foundAbility;
    }
  }
});

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

function shouldShowUnitDetails(unit: any): boolean {
  if (!unit) return false;
  return (unit.points && unit.points > 0) || (unit.unit_size && unit.unit_size > 0);
}

// Computed: extract ward value from keywords like "Ward (5+)"
const wardValue = computed(() => {
  if (!unit.value || !unit.value.keywords) return null;
  const match = unit.value.keywords.find((k: string) => /^ward \([^)]+\)$/i.test(k));
  if (!match) return null;
  const paren = match.match(/\(([^)]+)\)/);
  return paren ? paren[1] : null;
});
</script>
<template>
  <BackButton :size="36" />
  <div v-if="unit && unit.stats" class="unit-detail">
    <div class="unit-detail-header">
      <div v-if="armyName !== 'UniversalManifestations'" class="unit-detail-fav">
        <FavoriteToggle
          :model-value="unitFavorite"
          @update:modelValue="toggleUnitFavoriteDetail"
          :size="favoriteToggleSize"
          no-text
        />
      </div>
      <h1>{{ unit.name }}</h1>
    </div>
    <div class="stats-row">
      <StatCircle :value="unit.stats.move" label="Move" />
      <StatCircle :value="unit.stats.health" label="Health" />
      <StatCircle
        :value="
          unit.stats.control !== undefined
            ? unit.stats.control
            : unit.stats.banishment !== undefined
              ? unit.stats.banishment
              : '-'
        "
        :label="
          unit.stats.control !== undefined
            ? 'Control'
            : unit.stats.banishment !== undefined
              ? 'Banishment'
              : 'Control'
        "
      />
      <StatCircle :value="unit.stats.save" label="Save" />
      <StatCircle v-if="wardValue" :value="wardValue" label="Ward" />
    </div>
    <Section v-if="unit.melee_weapons && unit.melee_weapons.length">
      <template #title>Melee Weapons</template>
      <WeaponTable :weapons="unit.melee_weapons" short-headers />
    </Section>
    <Section v-if="unit.ranged_weapons && unit.ranged_weapons.length">
      <template #title>Ranged Weapons</template>
      <WeaponTable :weapons="unit.ranged_weapons" short-headers />
    </Section>
    <Section v-if="unit.abilities && unit.abilities.length">
      <template #title>Abilities</template>
      <div class="abilities">
        <AbilityCard
          v-for="(a, i) in [...unit.abilities].sort((a, b) => a.name.localeCompare(b.name))"
          :key="a.name + i"
          :ability="a"
        />
      </div>
    </Section>
    <Section v-if="summoningAbility && summoningAbility.text">
      <template #title>Summoning</template>
      <div class="abilities">
        <AbilityCard :ability="summoningAbility" />
      </div>
    </Section>
    <Section v-if="shouldShowUnitDetails(unit)">
      <template #title>Unit Details</template>
      <div class="unit-detail-points" style="font-size: 0.95em; color: #666; text-align: left">
        <div v-if="unit.notReinforcable" class="unit-not-reinforceable" style="margin-top: 0.5em">
          <span v-html="`<i>This unit can not be reinforced.</i>`"></span>
        </div>
        <div
          v-if="unit.undersize_condition"
          class="unit-not-reinforceable"
          style="margin-top: 0.5em"
        >
          <span
            v-html="
              `<i>You can include 1 unit of this type for each <b>${unit.undersize_condition}</b> in your army.</i>`
            "
          ></span>
        </div>
        <div
          v-if="unit.companion_units && unit.companion_units.length > 0"
          class="unit-companion-units"
          style="margin-top: 0.5em"
        >
          <span v-html="formatCompanionUnits(unit.name, unit.companion_units)"></span>
        </div>
        <div
          v-if="unit.models && unit.models.length"
          class="unit-model-groups"
          style="margin-top: 0.5em"
          v-html="formatModelGroups(unit.models, unit)"
        ></div>

        <span v-if="unit.points && unit.points > 0">{{ unit.points }} Points</span>
        <span v-if="unit.unit_size && unit.unit_size > 0" style="margin-left: 1.5em"
          >Unit Size: {{ unit.unit_size }}</span
        >

        <div
          v-if="unit.sub_hero_tags && unit.sub_hero_tags.length > 0"
          class="unit-sub-hero-tags"
          style="margin-top: 0.5em"
        >
          <span v-html="formatSubHeroTags(unit.sub_hero_tags)"></span>
        </div>
        <div
          v-if="
            (unit.regiment_options && unit.regiment_options.length > 0) ||
            (unit.sub_hero_options && unit.sub_hero_options.length > 0)
          "
          class="unit-regiment-options"
          style="margin-top: 0.5em"
        >
          <span v-html="formatRegimentOptions(unit.sub_hero_options, unit.regiment_options)"></span>
        </div>
      </div>
    </Section>
    <Section v-if="unit.keywords && unit.keywords.length">
      <template #title>Keywords</template>
      <KeywordsBar :keywords="unit.keywords" />
    </Section>
  </div>
  <div v-else>
    <p style="color: red">Unit data is missing or incomplete.</p>
    <pre>{{ unit }}</pre>
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
