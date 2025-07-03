<template>
  <Section v-model="collapsed" v-if="hasFactionTerrain">
    <template #title> Faction Terrain </template>
    <div>
      <div v-if="factionTerrain && armyData" class="faction-terrain-controls">
        <ListButton
          :label="factionTerrain"
          :points="armyData.units.find((u: any) => u.name === factionTerrain)?.points"
          @click="
            () =>
              router &&
              router.push({
                name: 'UnitDetail',
                params: { army: listFaction, unit: factionTerrain },
              })
          "
        />
        <button
          class="delete-terrain-btn"
          @click="handleDeleteFactionTerrain"
          title="Delete Faction Terrain"
        >
          <font-awesome-icon icon="trash" />
        </button>
      </div>
      <div v-else>
        <button class="add-terrain-btn" @click="handleAddFactionTerrain">+ Faction Terrain</button>
      </div>
    </div>
  </Section>
</template>
<script lang="ts" setup>
import { computed, ref, onMounted } from 'vue';
import Section from '../../core/components/Section.vue';
import ListButton from '../../shared/components/ListButton.vue';
import { useRouter } from 'vue-router';
import type { Army } from '../../../common/ArmyData';

const props = defineProps<{
  modelValue: string | undefined;
  armyData: Army;
  listFaction: string;
  listId: string;
}>();

const emit = defineEmits(['update:modelValue']);
const router = useRouter();

// Expose to template
const hasFactionTerrain = computed(
  () =>
    props.armyData &&
    Array.isArray(props.armyData.units) &&
    props.armyData.units.some((u: any) => (u.category || '').toLowerCase() === 'faction terrain')
);

const collapsed = ref(true);
onMounted(() => {
  // Only start collapsed if there is no faction terrain assigned
  collapsed.value = !props.modelValue;
});

const factionTerrain = computed({
  get: () => props.modelValue,
  set: (val: string | undefined) => {
    emit('update:modelValue', val);
  },
});

function handleAddFactionTerrain() {
  if (!props.armyData) return;
  const terrainUnits = props.armyData.units.filter(
    (u: any) => (u.category || '').toLowerCase() === 'faction terrain'
  );
  if (terrainUnits.length === 1) {
    factionTerrain.value = terrainUnits[0].name;
  } else if (terrainUnits.length > 1 && props.listFaction) {
    router.push({
      name: 'UnitPicker',
      params: { id: props.listId, regimentIdx: '0', filter: 'terrain' },
    });
  }
}

function handleDeleteFactionTerrain() {
  factionTerrain.value = undefined;
}

// Make sure all variables used in the template are exposed
// (in <script setup> this is automatic, but for clarity):
// hasFactionTerrain, collapsed, factionTerrain, handleAddFactionTerrain, handleDeleteFactionTerrain, router, props
</script>
<style scoped>
.faction-terrain-controls {
  display: flex;
  align-items: stretch;
  /* gap: 0.5em; */
}
.add-terrain-btn {
  width: 100%;
  background: #f5f5f5;
  color: #1976d2;
  border: 2px dashed #1976d2;
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
  background: #1976d2;
  color: #fff;
}

.delete-terrain-btn {
  min-width: 44px;
  min-height: 44px;
  height: auto;
  font-size: 1.3em;
  background: #f5f5f5;
  color: #a00;
  border: 1.5px solid #a00;
  border-radius: 7px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 0.1em;
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
  background: #a00;
  color: #fff;
  border-color: #a00;
}
</style>
