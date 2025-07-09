<template>
  <h2>Your Lists</h2>
  <div v-if="lists.length === 0" class="empty-message">You have no saved lists yet.</div>
  <ul v-else>
    <li v-for="list in lists" :key="list.id">
      <ListButton
        :label="`${list.name} | ${list.faction}${list.formation && list.formation.trim() ? ' | ' + list.formation : ''}`"
        @click="goToList(list)"
      />
    </li>
  </ul>
  <button class="fab" @click="openModal">+</button>
  <CreateListModal
    v-model="showModal"
    initialFaction="Cities of Sigmar"
    :armyList="game?.armyList || new Map()"
    @create="handleCreate"
    @close="closeModal"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue';
import type { List } from '../common/ListData';
import ListButton from '../modules/shared/components/ListButton.vue';
import {
  createList as createListInStorage,
  getAllLists,
  setListDefaultOptions,
} from '../utils/list-manager';
import { useRouter } from 'vue-router';
import CreateListModal from './CreateListModal.vue';
import { useGame } from '../modules/shared/composables/useGame';

const router = useRouter();
const lists = ref<List[]>(getAllLists());
const showModal = ref(false);

const { game } = useGame();

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
}
function handleCreate({ name, faction }: { name: string; faction: string }) {
  const army = game.value?.armies.get(faction);
  if (!army) {
    console.error(`Army not found: ${faction}`);
    return;
  }

  let list: List = {
    name,
    faction,
    formation: '',
    regiments: [],
    id: '', // id will be generated in createListInStorage
    battle_tactics: [], // Initialize with empty array
    setup: false,
  };
  setListDefaultOptions(list, army);

  const id = createListInStorage(list);
  lists.value = getAllLists();
  closeModal();
  router.push({ name: 'ListBuilder', params: { id: id } });
}
function goToList(list: List) {
  router.push({ name: 'ListBuilder', params: { id: list.id } });
}
</script>
<style scoped>
.list-list-component {
  padding: 1.5em 0.5em;
  position: relative;
  min-height: 60vh;
}
.list-summary {
  font-size: 1.1em;
  margin-bottom: 0.5em;
}
.faction {
  color: #666;
  margin-left: 0.5em;
}
.empty-message {
  color: #888;
  text-align: center;
  margin-top: 2em;
}
.fab {
  position: fixed;
  right: 2.2em;
  bottom: 2.2em;
  width: 56px;
  height: 56px;
  min-width: 56px;
  min-height: 56px;
  max-width: 56px;
  max-height: 56px;
  border-radius: 50%;
  background: #a00;
  color: #fff;
  font-size: 2.2em;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1001;
  transition: background 0.2s;
  line-height: 1;
  padding: 0;
}
.fab:hover {
  background: #c00;
}
ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}
li {
  margin-bottom: 0.7em;
}
li:last-child {
  margin-bottom: 0;
}
@media (max-width: 600px) {
  .fab {
    right: 1em;
    bottom: 1em;
  }
}
</style>
