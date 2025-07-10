<script setup lang="ts">
import { ref, computed } from 'vue';
import { useUniversalManifestationLore } from '../../shared/composables/useGame';
import ListButton from '../../shared/components/ListButton.vue';
import BackButton from '../../core/components/BackButton.vue';
import ArmyRules from '../components/ArmyRules.vue';
import TwoTab from '../../core/components/TwoTab.vue';
import { Army } from '../../../parser/models/army';

const props = defineProps<{ lore: string }>();
const loreName = props.lore;
const leftActive = ref(true);

const { lore } = useUniversalManifestationLore(loreName);
const units = computed(() => {
  return lore.value.abilities.map((ability) => ability.summonedUnit);
});
</script>
<template>
  <BackButton :size="36" class="unit-list-back" />
  <div class="list-container">
    <h1>
      {{ loreName }}
      <span v-if="lore.points > 0" class="points-badge"> {{ lore.points }} pts </span>
    </h1>
    <TwoTab :left-label="'Manifestations'" :right-label="'Lore'" v-model:leftActive="leftActive">
      <template #left>
        <ul>
          <li v-for="name in units" :key="name">
            <router-link
              :to="{
                name: 'UnitDetail',
                params: { army: 'UniversalManifestations', unit: name },
              }"
              custom
              v-slot="{ navigate, href }"
            >
              <ListButton :label="name" :points="0" @click="navigate" :href="href" />
            </router-link>
          </li>
        </ul>
      </template>
      <template #right>
        <ArmyRules
          :army="
            new Army({
              manifestationLores: new Map([[loreName, lore]]),
            })
          "
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
