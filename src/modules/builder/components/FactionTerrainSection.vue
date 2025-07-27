<template>
  <Section
    v-if="hasFactionTerrain"
    :default-collapsed="collapsed"
    collapse-key="factionTerrain"
  >
    <template #title> Faction Terrain </template>
    <div>
      <div
        v-if="factionTerrain"
        class="faction-terrain-controls"
      >
        <ListButton
          :label="factionTerrain"
          :points="battleProfiles.get(factionTerrain)?.points"
          :split-on-sub-label="true"
          @click="goToUnitDetail"
        />
        <button
          class="delete-terrain-btn"
          title="Delete Faction Terrain"
          @click="handleDeleteFactionTerrain"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
      <div v-else>
        <button
          class="add-terrain-btn"
          @click="handleAddFactionTerrain"
        >
          + Faction Terrain
        </button>
      </div>
    </div>
  </Section>
</template>
<script lang="ts" setup>
import { computed, ref } from 'vue';
import Section from '../../core/components/ContentSection.vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import type { BattleProfile } from '../../../parser/models/battleProfile';

const props = defineProps<{
  modelValue: string;
  battleProfiles: Map<string, BattleProfile>;
  armyName: string;
  listId: string;
}>();

const emit = defineEmits(['update:modelValue']);
const router = useRouter();

const terrainUnits = computed(() => {
  return Array.from(props.battleProfiles.values()).filter(
    (u: any) => u.category === 'FACTION TERRAIN'
  );
});
const hasFactionTerrain = computed(() => terrainUnits.value.length > 0);

const collapsed = ref(props.modelValue === '');

const factionTerrain = computed({
  get: () => props.modelValue,
  set: (val: string) => {
    emit('update:modelValue', val);
  },
});

function handleAddFactionTerrain() {
  if (terrainUnits.value.length === 1) {
    factionTerrain.value = terrainUnits.value[0].name;
  } else if (terrainUnits.value.length > 1) {
    router.push({
      name: 'UnitPicker',
      params: { id: props.listId, regimentIdx: '0', filter: 'terrain' },
    });
  }
}

function handleDeleteFactionTerrain() {
  factionTerrain.value = '';
}

function goToUnitDetail() {
  if (!factionTerrain.value) return;
  router.push({
    name: 'UnitDetail',
    params: { armyName: props.armyName, unitName: factionTerrain.value },
  });
}
</script>
<style scoped>
.faction-terrain-controls {
  display: flex;
  align-items: stretch;
  /* gap: 0.5em; */
}
.add-terrain-btn {
  width: 100%;
  background: var(--primary);
  color: #fff;
  border: 2px solid var(--border-color);
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
  filter: brightness(1.1);
}

.delete-terrain-btn {
  min-width: 67px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: var(--danger);
  color: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.25em;
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
  background: var(--bg-head);
}
</style>
