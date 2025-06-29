<script setup lang="ts">
import { ref, computed } from 'vue';
import type { List } from '../common/ListData';
import { allArmies } from '../common/ArmyData';
import ListButton from './ListButton.vue';
import { createList as createListInStorage, getAllLists } from '../utils/list-manager';
import { useRouter } from 'vue-router';

const router = useRouter();
const lists = ref<List[]>(getAllLists());
const showModal = ref(false);
const newListName = ref('');
const newListFaction = ref(allArmies[0]?.name || '');

const isNameUnique = computed(() => {
  const trimmed = newListName.value.trim();
  if (!trimmed) return false;
  return !lists.value.some((l) => l.name === trimmed);
});

function openModal() {
  showModal.value = true;
}
function closeModal() {
  showModal.value = false;
  newListName.value = '';
  newListFaction.value = allArmies[0]?.name || '';
}
function createList() {
  const trimmedName = newListName.value.trim();
  if (!trimmedName || !isNameUnique.value) {
    return;
  }
  createListInStorage({
    name: trimmedName,
    faction: newListFaction.value,
    formation: '',
    regiments: [],
  });
  lists.value = getAllLists();
  closeModal();
  router.push({ name: 'ListBuilder', params: { name: trimmedName } });
}
function goToList(list: List) {
  router.push({ name: 'ListBuilder', params: { name: list.name } });
}
</script>
<template>
  <h2>Your Lists</h2>
  <div v-if="lists.length === 0" class="empty-message">You have no saved lists yet.</div>
  <ul v-else>
    <li v-for="list in lists" :key="list.name">
      <ListButton :label="`${list.name} | ${list.faction}`" @click="goToList(list)" />
    </li>
  </ul>
  <button class="fab" @click="openModal">+</button>
  <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
    <div class="modal">
      <h3>Create New List</h3>
      <label>
        Name
        <input v-model="newListName" type="text" placeholder="List name" />
      </label>
      <label>
        Army
        <select v-model="newListFaction">
          <optgroup label="Order">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Order')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Chaos">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Chaos')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Death">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Death')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
          <optgroup label="Destruction">
            <option
              v-for="army in allArmies.filter((a) => a.grandAlliance === 'Destruction')"
              :key="army.name"
              :value="army.name"
            >
              {{ army.name }}
            </option>
          </optgroup>
        </select>
      </label>
      <div class="modal-actions">
        <button @click="closeModal">Cancel</button>
        <button class="create-btn" @click="createList" :disabled="!newListName || !isNameUnique">
          Create
        </button>
      </div>
      <div v-if="newListName && !isNameUnique" class="error-message">
        A list with this name already exists.
      </div>
    </div>
  </div>
</template>
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
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
}
.modal {
  background: #fff;
  color: #222;
  border-radius: 12px;
  padding: 2em 1.5em 1.5em 1.5em;
  min-width: 320px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  gap: 1.2em;
}
.modal h3 {
  margin: 0 0 0.5em 0;
  font-size: 1.3em;
}
.modal label {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
  font-weight: 500;
}
.modal input,
.modal select {
  padding: 0.5em;
  border-radius: 6px;
  border: 1px solid #bbb;
  font-size: 1em;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
  margin-top: 0.5em;
}
.create-btn {
  background: #a00;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.5em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.create-btn:disabled {
  background: #ccc;
  color: #888;
  cursor: not-allowed;
}
.create-btn:not(:disabled):hover {
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
.error-message {
  color: #d00;
  font-size: 0.9em;
  margin-top: 0.5em;
}
@media (max-width: 600px) {
  .fab {
    right: 1em;
    bottom: 1em;
  }
}
</style>
