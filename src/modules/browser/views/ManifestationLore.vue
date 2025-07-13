<script setup lang="ts">
import { computed } from 'vue';
import { useUniversalManifestationLore } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import BackButton from '../../core/components/BackButton.vue';
import Section from '../../core/components/ContentSection.vue';
import AbilityCard from '../../shared/components/AbilityCard.vue';

const props = defineProps<{ loreName: string }>();

const { lore } = useUniversalManifestationLore(props.loreName);
const units = computed(() => {
  return lore.value.abilities.map((ability) => ability.summonedUnit);
});
</script>
<template>
  <BackButton
    :size="36"
    class="unit-list-back"
  />
  <div class="list-container">
    <h1 style="margin: 0">
      {{ loreName }}
    </h1>
    <h1 style="margin: 0">
      <span
        v-if="lore?.points ? lore?.points > 0 : 0"
        class="points-badge"
      >{{ lore?.points }} pts</span>
    </h1>
    <Section collapse-key="warscrolls">
      <template #title>Warscrolls</template>
      <ul>
        <li
          v-for="name in units"
          :key="name"
        >
          <router-link
            v-slot="{ navigate, href }"
            :to="{
              name: 'UnitDetail',
              params: { armyName: 'UniversalManifestations', unitName: name },
            }"
            custom
          >
            <ListButton
              :label="name"
              :points="0"
              :href="href"
              @click="navigate"
            />
          </router-link>
        </li>
      </ul>
    </Section>
    <Section collapse-key="lore">
      <template #title>Lore</template>
      <AbilityCard
        v-for="(ability, i) in lore.abilities"
        :key="ability.name + i"
        :ability="ability"
      />
    </Section>
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
