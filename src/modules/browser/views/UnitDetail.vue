<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AbilityCard from '../../shared/components/AbilityCard.vue';
import StatCircle from '../components/StatCircle.vue';
import KeywordsBar from '../../shared/components/KeywordsBar.vue';
import WeaponTable from '../components/WeaponTable.vue';
import Section from '../../core/components/ContentSection.vue';
import {
  formatModelGroups,
  formatSubHeroTags,
  formatRegimentOptions,
  formatText,
} from '../../../utils/formatter';
import { useArmy, useUnit, useGame } from '../../shared/composables/useGame';
import { useUnitSettings } from '../../shared/composables/useUnitSettings';
import WeaponOptionsSelection from '../../builder/components/WeaponOptionsSelection.vue';
import ReportErrorButton from '../../shared/components/ReportErrorButton.vue';
import LegendsBadge from '../../shared/components/badges/LegendsBadge.vue';
import SoGBadge from '../../shared/components/badges/SoGBadge.vue';
import { useTitle } from '@vueuse/core';
import FavoritesToggle from '../../shared/components/FavoritesToggle.vue';
import BadgeRow from '../../shared/components/badges/BadgeRow.vue';
import WizardBadge from '../../shared/components/badges/WizardBadge.vue';
import PriestBadge from '../../shared/components/badges/PriestBadge.vue';
import FAQSection from '../../shared/faq/FAQSection.vue';
import { useFAQ } from '../../shared/composables/useFAQ';
import { useFAQSearch } from '../../shared/composables/useFAQSearch';
import PopOver from '../../shared/components/PopOver.vue';

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

const isSoG = computed(() => /\(Scourge of Ghyran\)/.test(unitName));
const withoutSoG = computed(() => unitName.replace(/\s*\(Scourge of Ghyran\)/, ''));


const splitLabel = computed(() => withoutSoG.value.split(/,| on | with /));
const displayLabel = computed(() => splitLabel.value[0]);
const displaySubLabel = computed(() => {
  if (splitLabel.value.length <= 1) return '';
  // Only preserve "on"/"with" (not ",") in the sublabel
  const original = withoutSoG.value;
  const match = original.match(/ (on|with) (.*)$/);
  return match ? match[0].trim() : splitLabel.value.slice(1).join(' ');
});

const { army } = useArmy(armyName ?? '');
const { unit, battleProfile } = useUnit(armyName ?? '', unitName ?? '');
const { game } = useGame();
const unitSettings = useUnitSettings(unit);

// Load FAQ data
const { faq: faqData, loading: faqLoading, error: faqError } = useFAQ();

// Create search queries for unit and abilities
const faqSearchQueries = computed(() => {
  const queries = [withoutSoG.value.trim()]; // Start with the unit name
  
  // Add all ability names
  unit.value.abilities.forEach(ability => {
    queries.push(ability.name);
  });
  
  // Add summoning spell name if it exists
  if (unit.value.summoningSpell) {
    queries.push(unit.value.summoningSpell.name);
  }
  
  return queries.filter(q => q && q.trim()); // Filter out empty queries
});

// Filter FAQ data by unit and ability names
const unitFAQData = useFAQSearch(faqData, faqSearchQueries);

const unitKeywords = computed(() => {
  const keywords = new Set<string>(unit.value.keywords);
  if (army.value.armyKeyword) {
    keywords.add(army.value.armyKeyword);
  }
  return Array.from(keywords).sort();
})

const possibleTerrainAbilities = ['Cover', 'Impassable', 'Obscuring', 'Unstable'];
const terrainAbilities = computed(() => {
  // check unit.descriptions for terrain abilities
  const descriptions = unit.value.descriptions || [];
  const abilities = descriptions.flatMap(desc => {
    return possibleTerrainAbilities.filter(ability => desc.includes(ability));
  });
  return abilities;
});

function sharedAbilityText(ability: string): string {
  // Pull description from game.sharedAbilityDescriptions (Map<string, string>)
  const map = game.value?.sharedAbilityDescriptions;
  return map?.get(ability) || '';
}

useTitle(`${unitName}`);

</script>
<template>
  <FavoritesToggle
    v-if="armyName !== 'UniversalUnits'"
    type="unit"
    :name="unitName"
  />
  <div>
    <h1 class="fancy-text">{{ displayLabel }}
      <br v-if="displaySubLabel" />
      <span
        v-if="displaySubLabel"
        class="sub-label"
      >
        {{ displaySubLabel }}
      </span>
    </h1>
    <BadgeRow style="justify-content: center; margin-bottom: 1em">
      <LegendsBadge big :legends="unit.legends"/>
      <SoGBadge big :sog="isSoG"/>
      <WizardBadge big :keywords="unit.keywords"/>
      <PriestBadge big :keywords="unit.keywords"/>
    </BadgeRow>
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
        <template v-if="unit.descriptions.length && terrainAbilities.length === 0">
          <div v-for="(desc, index) in unit.descriptions" :key="`desc-${index}`" class="unit-detail-section">
            <span v-html="formatText(desc)" />
          </div>
        </template>
        <template v-if="terrainAbilities.length > 0">
          <div class="unit-detail-section">
            <span v-html="`<i>This unit has the following terrain abilities: </i>`" />
            <ul>
              <li v-for="(ability, index) in terrainAbilities" :key="`terrain-ability-${index}`">
                <PopOver>
                  <template #trigger>
                    <span class="terrain-ability-underline">{{ ability }}</span>
                  </template>
                  <h4>{{ ability }}</h4>
                  <span v-html="formatText(sharedAbilityText(ability))" />
                </PopOver>
              </li>
            </ul>
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
        
        <!-- FAQ Section -->
        <Section
          v-if="unitFAQData && unitFAQData.data && unitFAQData.data.length > 0"
          :default-collapsed="true"
          collapse-key="unit-faq"
        >
          <template #title>FAQ</template>
          <div v-if="faqLoading">Loading FAQ...</div>
          <div v-else-if="faqError" class="error">{{ faqError }}</div>
          <div v-else-if="unitFAQData">
            <i class="faq-warning">Only FAQs that directly references this unit appear here, it may not be all relevant FAQs.</i>
            <FAQSection
              v-for="(section, i) in unitFAQData.data"
              :key="'unit-faq-section-' + i"
              :section="section"
            />
          </div>
        </Section>
        
          <ReportErrorButton 
    :unit-name="unitName"
    :army-name="armyName"
    :army-revision="army.revision"/>
  </div>
</template>
<style src="./unit-detail.css" scoped></style>
<style scoped>
.unit-detail {
  font-size: 0.95em;
  color: var(--text-head);
  text-align: left;
}

.sub-label {
  display: block;
  font-size: 0.5em;
  color: var(--text-muted);
  margin-top: 0.4em;
  font-family: 'system-ui', sans-serif;
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

.error {
  color: #c00;
  text-align: center;
  margin-top: 1rem;
}

.terrain-ability-underline {
  text-decoration: underline dotted;
  cursor: pointer;
  text-underline-offset: 2px;
  color: inherit;
}
.faq-warning {
  color: var(--text-muted);
  font-size: 0.9em;
  margin-top: 0.5em;
  display: block;
}
</style>

